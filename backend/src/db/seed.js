const { query } = require('../config/db');
const { hashPassword } = require('../utils/password');
const logger = require('../utils/logger');

const ADMIN_EMAIL = 'professor@joineazy.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@123';

/**
 * Idempotent seed data for local development / demo.
 * The professor account is created if missing; its password is never
 * overwritten, so a password reset survives container restarts.
 */
const seed = async () => {
  const adminExists = await query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
  let adminId;

  if (adminExists.rows.length) {
    adminId = adminExists.rows[0].id;
    logger.info('Seed: professor account already present.');
  } else {
    const adminHash = await hashPassword(ADMIN_PASSWORD);
    const admin = await query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, 'admin', NULL) RETURNING id`,
      ['Dr. Sarah Professor', ADMIN_EMAIL, adminHash]
    );
    adminId = admin.rows[0].id;
    logger.info(`Seed: professor account created (${ADMIN_EMAIL}).`);
  }

  const existing = await query('SELECT COUNT(*)::int AS count FROM users');
  if (existing.rows[0].count > 1) {
    logger.info('Seed skipped - demo students already exist.');
    logger.info(`  Professor login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    return;
  }

  logger.info('Seeding demo students, groups and assignments...');
  const studentHash = await hashPassword('password123');

  const studentData = [
    ['Alice Johnson', 'alice@student.com', 'STU001'],
    ['Bob Smith', 'bob@student.com', 'STU002'],
    ['Charlie Brown', 'charlie@student.com', 'STU003'],
    ['Diana Prince', 'diana@student.com', 'STU004'],
    ['Evan Wright', 'evan@student.com', 'STU005'],
    ['Fiona Gallagher', 'fiona@student.com', 'STU006'],
  ];

  const studentIds = [];
  for (const [name, email, sid] of studentData) {
    const r = await query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, 'student', $4) RETURNING id`,
      [name, email, studentHash, sid]
    );
    studentIds.push(r.rows[0].id);
  }

  const g1 = await query(
    'INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id',
    ['The Alchemists', studentIds[0]]
  );
  const g2 = await query(
    'INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id',
    ['Code Crusaders', studentIds[3]]
  );
  const group1 = g1.rows[0].id;
  const group2 = g2.rows[0].id;

  for (const uid of [studentIds[0], studentIds[1], studentIds[2]]) {
    await query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [group1, uid]);
  }
  for (const uid of [studentIds[3], studentIds[4], studentIds[5]]) {
    await query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [group2, uid]);
  }

  const onedrive = 'https://onedrive.live.com/';

  const a1 = await query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target_type, created_by)
     VALUES ($1, $2, NOW() + INTERVAL '7 days', $3, 'all', $4) RETURNING id`,
    [
      'Week 3 – Requirements Analysis',
      'Analyse the requirements for the Joineazy platform and submit a grouped report.',
      onedrive,
      adminId,
    ]
  );

  const a2 = await query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target_type, created_by)
     VALUES ($1, $2, NOW() + INTERVAL '14 days', $3, 'groups', $4) RETURNING id`,
    [
      'Database Design Deliverable',
      'Submit your ER diagram and normalized schema for the group project.',
      onedrive,
      adminId,
    ]
  );
  await query('INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)', [
    a2.rows[0].id,
    group2,
  ]);

  await query(
    `INSERT INTO submissions (assignment_id, group_id, confirmed_by, note)
     VALUES ($1, $2, $3, 'Uploaded the final PDF to OneDrive.')`,
    [a1.rows[0].id, group1, studentIds[0]]
  );

  logger.info('Seed complete.');
  logger.info(`  Professor login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  logger.info('  Student login: alice@student.com / password123');
};

module.exports = seed;
