const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getTargetGroupIds, progressForGroups } = require('../utils/helpers');

/** GET /api/admin/overview - high level counts for the professor dashboard. */
const overview = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE role='student') AS students,
       (SELECT COUNT(*)::int FROM groups) AS groups,
       (SELECT COUNT(*)::int FROM assignments) AS assignments,
       (SELECT COUNT(*)::int FROM submissions) AS submissions,
       (SELECT COUNT(*)::int FROM users WHERE role='admin') AS admins`
  );

  const recent = await query(
    `SELECT s.id, s.confirmed_at AS "confirmedAt", g.name AS "groupName",
            a.title AS "assignmentTitle", u.name AS "confirmedByName"
     FROM submissions s
     JOIN groups g ON g.id = s.group_id
     JOIN assignments a ON a.id = s.assignment_id
     JOIN users u ON u.id = s.confirmed_by
     ORDER BY s.confirmed_at DESC LIMIT 6`
  );

  res.json({ success: true, overview: result.rows[0], recentSubmissions: recent.rows });
});

/** GET /api/admin/analytics - per-assignment and per-group breakdown for charts. */
const analytics = asyncHandler(async (req, res) => {
  const assignmentsRes = await query(
    `SELECT id, title, due_date AS "dueDate", target_type AS "targetType"
     FROM assignments ORDER BY due_date`
  );
  const subsRes = await query('SELECT assignment_id, group_id FROM submissions');
  const submittedIdsByAssignment = new Map();
  for (const sub of subsRes.rows) {
    if (!submittedIdsByAssignment.has(sub.assignment_id)) {
      submittedIdsByAssignment.set(sub.assignment_id, new Set());
    }
    submittedIdsByAssignment.get(sub.assignment_id).add(sub.group_id);
  }

  const assignmentBreakdown = [];
  for (const a of assignmentsRes.rows) {
    const targets = await getTargetGroupIds({ id: a.id, target_type: a.targetType });
    const submittedIds = submittedIdsByAssignment.get(a.id) || new Set();
    // Only count confirmations from groups that are still targeted.
    const submitted = targets.filter((gid) => submittedIds.has(gid)).length;
    const total = targets.length;
    assignmentBreakdown.push({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      submitted,
      total,
      percent: total === 0 ? 0 : Math.round((submitted / total) * 100),
    });
  }

  const groupsRes = await query('SELECT id, name FROM groups ORDER BY name');
  const progress = await progressForGroups(groupsRes.rows.map((g) => g.id));
  const groupBreakdown = groupsRes.rows.map((g) => ({
    id: g.id,
    name: g.name,
    ...(progress[g.id] || { total: 0, completed: 0, percent: 0 }),
  }));

  const overallTotal = assignmentBreakdown.reduce((s, a) => s + a.total, 0);
  const overallSubmitted = assignmentBreakdown.reduce((s, a) => s + a.submitted, 0);

  res.json({
    success: true,
    analytics: {
      summary: {
        completionPercent:
          overallTotal === 0 ? 0 : Math.round((overallSubmitted / overallTotal) * 100),
        totalTargets: overallTotal,
        totalSubmitted: overallSubmitted,
      },
      byAssignment: assignmentBreakdown,
      byGroup: groupBreakdown,
    },
  });
});

/** GET /api/admin/groups - all groups with member counts and progress. */
const allGroups = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT gr.id, gr.name, gr.created_at AS "createdAt", u.name AS "ownerName",
            COUNT(gm.user_id)::int AS "memberCount"
     FROM groups gr
     JOIN users u ON u.id = gr.created_by
     LEFT JOIN group_members gm ON gm.group_id = gr.id
     GROUP BY gr.id, u.name ORDER BY gr.created_at DESC`
  );
  const progress = await progressForGroups(result.rows.map((g) => g.id));
  res.json({
    success: true,
    groups: result.rows.map((g) => ({ ...g, progress: progress[g.id] })),
  });
});

/** GET /api/admin/students - all students with group and submission counts. */
const allStudents = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.student_id AS "studentId", u.created_at AS "createdAt",
            COUNT(DISTINCT gm.group_id)::int AS "groupCount",
            COUNT(DISTINCT s.id)::int AS "submissionCount"
     FROM users u
     LEFT JOIN group_members gm ON gm.user_id = u.id
     LEFT JOIN submissions s ON s.confirmed_by = u.id
     WHERE u.role = 'student'
     GROUP BY u.id ORDER BY u.name`
  );
  res.json({ success: true, students: result.rows });
});

module.exports = { overview, analytics, allGroups, allStudents };
