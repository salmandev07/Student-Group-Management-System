const { query, withTransaction } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, assertDate } = require('../utils/validate');
const { getTargetGroupIds, getGroupIdsForUser } = require('../utils/helpers');

/** Build the enriched assignment representation returned by the API. */
const enrich = async (row, user, myGroupIds = null) => {
  const targetIds = await getTargetGroupIds(row);

  let targetGroups = [];
  if (targetIds.length) {
    const r = await query(
      'SELECT id, name FROM groups WHERE id = ANY($1::int[]) ORDER BY name',
      [targetIds]
    );
    targetGroups = r.rows;
  }

  const subsRes = await query(
    `SELECT s.group_id, s.confirmed_at AS "confirmedAt", s.note, u.name AS "confirmedByName"
     FROM submissions s JOIN users u ON u.id = s.confirmed_by
     WHERE s.assignment_id = $1`,
    [row.id]
  );
  const submittedMap = new Map(subsRes.rows.map((s) => [s.group_id, s]));

  const completed = targetIds.filter((id) => submittedMap.has(id)).length;
  const total = targetIds.length;

  const base = {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    oneDriveLink: row.onedrive_link,
    targetType: row.target_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by_name ? { id: row.created_by, name: row.created_by_name } : null,
    targetGroups,
    stats: {
      total,
      submitted: completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    },
    submissions: subsRes.rows,
  };

  if (user.role === 'student') {
    const ids = myGroupIds || (await getGroupIdsForUser(user.id));
    base.myGroups = targetGroups
      .filter((g) => ids.includes(g.id))
      .map((g) => {
        const sub = submittedMap.get(g.id);
        return {
          groupId: g.id,
          groupName: g.name,
          submitted: Boolean(sub),
          confirmedAt: sub ? sub.confirmedAt : null,
          confirmedBy: sub ? sub.confirmedByName : null,
        };
      });
  }

  return base;
};

const selectWithAuthor = `
  SELECT a.*, u.name AS created_by_name
  FROM assignments a JOIN users u ON u.id = a.created_by
`;

/** GET /api/assignments */
const listAssignments = asyncHandler(async (req, res) => {
  let result;
  let myGroupIds = null;

  if (req.user.role === 'admin') {
    result = await query(`${selectWithAuthor} ORDER BY a.due_date ASC, a.id DESC`);
  } else {
    myGroupIds = await getGroupIdsForUser(req.user.id);
    result = await query(
      `${selectWithAuthor}
       WHERE a.target_type = 'all'
          OR EXISTS (
            SELECT 1 FROM assignment_groups ag
            WHERE ag.assignment_id = a.id AND ag.group_id = ANY($1::int[])
          )
       ORDER BY a.due_date ASC, a.id DESC`,
      [myGroupIds]
    );
  }

  const assignments = [];
  for (const row of result.rows) {
    assignments.push(await enrich(row, req.user, myGroupIds));
  }
  res.json({ success: true, assignments });
});

/** GET /api/assignments/:id */
const getAssignment = asyncHandler(async (req, res) => {
  const result = await query(`${selectWithAuthor} WHERE a.id = $1`, [Number(req.params.id)]);
  if (!result.rows.length) throw ApiError.notFound('Assignment not found');

  const assignment = await enrich(result.rows[0], req.user);
  if (req.user.role === 'student' && !assignment.myGroups.length) {
    throw ApiError.forbidden('This assignment is not assigned to your group');
  }
  res.json({ success: true, assignment });
});

/** POST /api/assignments (admin only) */
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, oneDriveLink, targetType = 'all', groupIds = [] } = req.body;
  requireFields(req.body, ['title', 'dueDate', 'oneDriveLink']);
  const due = assertDate(dueDate);
  if (!['all', 'groups'].includes(targetType)) {
    throw ApiError.badRequest('targetType must be either "all" or "groups"');
  }
  if (targetType === 'groups' && (!Array.isArray(groupIds) || groupIds.length === 0)) {
    throw ApiError.badRequest('Select at least one group for a targeted assignment');
  }

  const assignment = await withTransaction(async (client) => {
    const created = await client.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, target_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, description, due_date, onedrive_link, target_type, created_at, created_by`,
      [String(title).trim(), description || null, due, String(oneDriveLink).trim(), targetType, req.user.id]
    );
    const id = created.rows[0].id;

    if (targetType === 'groups') {
      for (const gid of groupIds) {
        await client.query(
          'INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)',
          [id, Number(gid)]
        );
      }
    }
    return created.rows[0];
  });

  res.status(201).json({
    success: true,
    message: 'Assignment created',
    assignment: await enrich({ ...assignment, created_by_name: req.user.name }, req.user),
  });
});

/** PUT /api/assignments/:id (admin only) */
const updateAssignment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await query('SELECT * FROM assignments WHERE id = $1', [id]);
  if (!existing.rows.length) throw ApiError.notFound('Assignment not found');

  const old = existing.rows[0];
  const {
    title = old.title,
    description = old.description,
    dueDate = old.due_date,
    oneDriveLink = old.onedrive_link,
    targetType = old.target_type,
    groupIds,
  } = req.body;
  const due = assertDate(dueDate);
  if (!['all', 'groups'].includes(targetType)) {
    throw ApiError.badRequest('targetType must be either "all" or "groups"');
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE assignments
       SET title=$1, description=$2, due_date=$3, onedrive_link=$4, target_type=$5, updated_at=NOW()
       WHERE id=$6`,
      [String(title).trim(), description || null, due, String(oneDriveLink).trim(), targetType, id]
    );

    if (targetType === 'groups') {
      if (!Array.isArray(groupIds) || !groupIds.length) {
        throw ApiError.badRequest('Select at least one group for a targeted assignment');
      }
      await client.query('DELETE FROM assignment_groups WHERE assignment_id = $1', [id]);
      for (const gid of groupIds) {
        await client.query(
          'INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)',
          [id, Number(gid)]
        );
      }
      // Drop confirmations for groups that are no longer targeted.
      await client.query(
        'DELETE FROM submissions WHERE assignment_id = $1 AND group_id <> ALL($2::int[])',
        [id, groupIds.map(Number)]
      );
    } else {
      // "All" assignments need no explicit group rows.
      await client.query('DELETE FROM assignment_groups WHERE assignment_id = $1', [id]);
    }
  });

  const updated = await query(`${selectWithAuthor} WHERE a.id = $1`, [id]);
  res.json({
    success: true,
    message: 'Assignment updated',
    assignment: await enrich(updated.rows[0], req.user),
  });
});

/** DELETE /api/assignments/:id (admin only) */
const deleteAssignment = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM assignments WHERE id = $1', [Number(req.params.id)]);
  if (!result.rowCount) throw ApiError.notFound('Assignment not found');
  res.json({ success: true, message: 'Assignment deleted' });
});

module.exports = {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
