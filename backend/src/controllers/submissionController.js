const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields } = require('../utils/validate');
const { assertMembership, getTargetGroupIds, getGroupIdsForUser, progressForGroups } = require('../utils/helpers');

/** POST /api/submissions - confirm a group's submission for an assignment. */
const confirmSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, groupId, note } = req.body;
  requireFields(req.body, ['assignmentId', 'groupId']);

  if (req.body.confirm !== true) {
    throw ApiError.badRequest(
      'Second-step confirmation is required (send confirm: true)'
    );
  }

  const assignmentRes = await query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
  if (!assignmentRes.rows.length) throw ApiError.notFound('Assignment not found');
  const assignment = assignmentRes.rows[0];

  const targetIds = await getTargetGroupIds(assignment);
  if (!targetIds.includes(Number(groupId))) {
    throw ApiError.badRequest('This assignment is not assigned to the selected group');
  }

  await assertMembership(req.user.id, Number(groupId));

  const existing = await query(
    'SELECT id FROM submissions WHERE assignment_id = $1 AND group_id = $2',
    [assignmentId, groupId]
  );
  if (existing.rows.length) {
    throw ApiError.conflict('This group has already confirmed this assignment');
  }

  const created = await query(
    `INSERT INTO submissions (assignment_id, group_id, confirmed_by, note)
     VALUES ($1, $2, $3, $4)
     RETURNING id, assignment_id AS "assignmentId", group_id AS "groupId",
               confirmed_by AS "confirmedBy", note, confirmed_at AS "confirmedAt"`,
    [assignmentId, groupId, req.user.id, note || null]
  );

  res.status(201).json({
    success: true,
    message: 'Submission confirmed successfully',
    submission: created.rows[0],
  });
});

/** GET /api/submissions/assignment/:assignmentId */
const listForAssignment = asyncHandler(async (req, res) => {
  const assignmentId = Number(req.params.assignmentId);
  let sql = `
    SELECT s.id, s.group_id AS "groupId", g.name AS "groupName",
           s.confirmed_at AS "confirmedAt", s.note,
           u.id AS "confirmedById", u.name AS "confirmedByName"
    FROM submissions s
    JOIN groups g ON g.id = s.group_id
    JOIN users u ON u.id = s.confirmed_by
    WHERE s.assignment_id = $1`;
  const params = [assignmentId];

  if (req.user.role === 'student') {
    const myGroups = await getGroupIdsForUser(req.user.id);
    sql += ' AND s.group_id = ANY($2::int[])';
    params.push(myGroups);
  }

  sql += ' ORDER BY s.confirmed_at DESC';
  const result = await query(sql, params);
  res.json({ success: true, submissions: result.rows });
});

/** DELETE /api/submissions/:assignmentId/:groupId - withdraw a confirmation. */
const withdrawSubmission = asyncHandler(async (req, res) => {
  const assignmentId = Number(req.params.assignmentId);
  const groupId = Number(req.params.groupId);

  if (req.user.role !== 'admin') await assertMembership(req.user.id, groupId);

  const result = await query(
    'DELETE FROM submissions WHERE assignment_id = $1 AND group_id = $2',
    [assignmentId, groupId]
  );
  if (!result.rowCount) throw ApiError.notFound('Submission confirmation not found');

  res.json({ success: true, message: 'Submission confirmation withdrawn' });
});

/** GET /api/submissions/my-progress - progress across the student's groups. */
const myProgress = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    throw ApiError.forbidden('This endpoint is for students only');
  }
  const groupIds = await getGroupIdsForUser(req.user.id);
  const progress = await progressForGroups(groupIds);

  const totals = Object.values(progress).reduce(
    (acc, p) => ({ total: acc.total + p.total, completed: acc.completed + p.completed }),
    { total: 0, completed: 0 }
  );

  res.json({
    success: true,
    progress,
    summary: {
      ...totals,
      percent: totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
    },
  });
});

module.exports = {
  confirmSubmission,
  listForAssignment,
  withdrawSubmission,
  myProgress,
};
