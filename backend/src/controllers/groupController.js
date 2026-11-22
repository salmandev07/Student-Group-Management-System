const { query, withTransaction } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields } = require('../utils/validate');
const { assertMembership, progressForGroups, getGroupDetails } = require('../utils/helpers');

/** GET /api/groups - groups the current user belongs to. */
const listMyGroups = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT gr.id, gr.name, gr.created_at AS "createdAt", gr.created_by AS "createdBy",
            COUNT(gm.user_id)::int AS "memberCount"
     FROM groups gr
     LEFT JOIN group_members gm ON gm.group_id = gr.id
     WHERE gr.id IN (SELECT group_id FROM group_members WHERE user_id = $1)
     GROUP BY gr.id ORDER BY gr.created_at DESC`,
    [req.user.id]
  );

  const groups = result.rows;
  const progress = await progressForGroups(groups.map((g) => g.id));
  res.json({
    success: true,
    groups: groups.map((g) => ({ ...g, progress: progress[g.id] })),
  });
});

/** GET /api/groups/:id */
const getGroup = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  await assertMembership(req.user.id, groupId);
  res.json({ success: true, group: await getGroupDetails(groupId) });
});

/** POST /api/groups */
const createGroup = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);

  const group = await withTransaction(async (client) => {
    const created = await client.query(
      'INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id, name, created_at',
      [String(req.body.name).trim(), req.user.id]
    );
    const groupId = created.rows[0].id;
    await client.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [
      groupId,
      req.user.id,
    ]);
    return created.rows[0];
  });

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    group: { ...group, progress: { total: 0, completed: 0, percent: 0 } },
  });
});

/** PUT /api/groups/:id - rename (owner only). */
const renameGroup = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);
  const groupId = Number(req.params.id);

  const result = await query(
    'UPDATE groups SET name = $1 WHERE id = $2 AND created_by = $3 RETURNING id, name',
    [String(req.body.name).trim(), groupId, req.user.id]
  );
  if (!result.rows.length) {
    throw ApiError.forbidden('Only the group owner can rename this group');
  }
  res.json({ success: true, group: result.rows[0] });
});

/** POST /api/groups/:id/members - add by email or student ID. */
const addMember = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  const { email, studentId } = req.body;
  if (!email && !studentId) {
    throw ApiError.badRequest('Provide a member email or studentId');
  }
  await assertMembership(req.user.id, groupId);

  const lookup = email
    ? await query('SELECT id, name, email FROM users WHERE email = $1', [
        String(email).toLowerCase().trim(),
      ])
    : await query('SELECT id, name, email FROM users WHERE student_id = $1', [
        String(studentId).trim(),
      ]);

  if (!lookup.rows.length) {
    throw ApiError.notFound('No student found with those details');
  }
  const member = lookup.rows[0];

  const existing = await query(
    'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, member.id]
  );
  if (existing.rows.length) {
    throw ApiError.conflict('This student is already a member of the group');
  }

  await query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [
    groupId,
    member.id,
  ]);

  res.status(201).json({ success: true, message: 'Member added', member });
});

/** DELETE /api/groups/:id/members/:userId - leave or remove (owner). */
const removeMember = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = Number(req.params.userId);
  await assertMembership(req.user.id, groupId);

  const group = await query('SELECT created_by FROM groups WHERE id = $1', [groupId]);
  if (!group.rows.length) throw ApiError.notFound('Group not found');

  const isOwner = group.rows[0].created_by === req.user.id;
  if (!isOwner && req.user.id !== userId) {
    throw ApiError.forbidden('Only the group owner can remove other members');
  }

  const result = await query(
    'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  );
  if (!result.rowCount) throw ApiError.notFound('Member not found in this group');

  res.json({ success: true, message: 'Member removed' });
});

/** DELETE /api/groups/:id - owner only. */
const deleteGroup = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM groups WHERE id = $1 AND created_by = $2', [
    Number(req.params.id),
    req.user.id,
  ]);
  if (!result.rowCount) {
    throw ApiError.forbidden('Only the group owner can delete this group');
  }
  res.json({ success: true, message: 'Group deleted' });
});

module.exports = {
  listMyGroups,
  getGroup,
  createGroup,
  renameGroup,
  addMember,
  removeMember,
  deleteGroup,
};
