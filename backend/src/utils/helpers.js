const { query } = require('../config/db');
const ApiError = require('./ApiError');

/** All group ids a given student belongs to. */
const getGroupIdsForUser = async (userId) => {
  const r = await query('SELECT group_id FROM group_members WHERE user_id = $1', [userId]);
  return r.rows.map((row) => row.group_id);
};

/** All group ids targeted by an assignment (every group, or selected groups). */
const getTargetGroupIds = async (assignment) => {
  if (assignment.target_type === 'all') {
    const r = await query('SELECT id FROM groups');
    return r.rows.map((row) => row.id);
  }
  const r = await query('SELECT group_id FROM assignment_groups WHERE assignment_id = $1', [
    assignment.id,
  ]);
  return r.rows.map((row) => row.group_id);
};

/** Ensure a user is a member of the given group, otherwise 403. */
const assertMembership = async (userId, groupId) => {
  const r = await query(
    'SELECT 1 FROM group_members WHERE user_id = $1 AND group_id = $2',
    [userId, groupId]
  );
  if (!r.rows.length) {
    throw ApiError.forbidden('You are not a member of this group');
  }
};

/** Progress (total targeted assignments, confirmed count, percentage) per group. */
const progressForGroups = async (groupIds) => {
  if (!groupIds.length) return {};
  const result = await query(
    `SELECT
       g.id AS group_id,
       COUNT(DISTINCT a.id) AS total,
       COUNT(DISTINCT s.id) AS completed
     FROM groups g
     LEFT JOIN assignments a
       ON a.target_type = 'all'
       OR EXISTS (
         SELECT 1 FROM assignment_groups ag
         WHERE ag.assignment_id = a.id AND ag.group_id = g.id
       )
     LEFT JOIN submissions s
       ON s.assignment_id = a.id AND s.group_id = g.id
     WHERE g.id = ANY($1::int[])
     GROUP BY g.id`,
    [groupIds]
  );

  const out = {};
  for (const row of result.rows) {
    const total = Number(row.total);
    const completed = Number(row.completed);
    out[row.group_id] = {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }
  return out;
};

/** Full group record including members and progress. */
const getGroupDetails = async (groupId) => {
  const groupRes = await query(
    `SELECT gr.id, gr.name, gr.created_at,
            u.id AS owner_id, u.name AS owner_name
     FROM groups gr JOIN users u ON u.id = gr.created_by
     WHERE gr.id = $1`,
    [groupId]
  );
  if (!groupRes.rows.length) throw ApiError.notFound('Group not found');

  const membersRes = await query(
    `SELECT u.id, u.name, u.email, u.student_id AS "studentId", gm.joined_at AS "joinedAt"
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1 ORDER BY gm.joined_at, u.id`,
    [groupId]
  );

  const progress = (await progressForGroups([groupId]))[groupId] || {
    total: 0,
    completed: 0,
    percent: 0,
  };

  return {
    id: groupRes.rows[0].id,
    name: groupRes.rows[0].name,
    createdAt: groupRes.rows[0].created_at,
    owner: { id: groupRes.rows[0].owner_id, name: groupRes.rows[0].owner_name },
    members: membersRes.rows,
    progress,
  };
};

module.exports = {
  getGroupIdsForUser,
  getTargetGroupIds,
  assertMembership,
  progressForGroups,
  getGroupDetails,
};
