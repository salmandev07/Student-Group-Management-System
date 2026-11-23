-- ============================================================
-- SGAMS Database Schema (PostgreSQL)
-- Student Group & Assignment Management System
-- ============================================================

-- Users: students and professors (admins), distinguished by `role`.
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'admin')),
  student_id    VARCHAR(50)  UNIQUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Groups: created and owned by a student.
CREATE TABLE IF NOT EXISTS groups (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group membership: a student may belong to many groups; a group has many students.
CREATE TABLE IF NOT EXISTS group_members (
  id        SERIAL PRIMARY KEY,
  group_id  INTEGER NOT NULL REFERENCES groups(id)   ON DELETE CASCADE,
  user_id   INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- Assignments: posted by an admin; sent to everyone or to selected groups.
CREATE TABLE IF NOT EXISTS assignments (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  due_date      TIMESTAMPTZ  NOT NULL,
  onedrive_link TEXT         NOT NULL,
  target_type   VARCHAR(10)  NOT NULL DEFAULT 'all'
                  CHECK (target_type IN ('all', 'groups')),
  created_by    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Join table: the specific groups targeted when target_type = 'groups'.
CREATE TABLE IF NOT EXISTS assignment_groups (
  id            SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_id      INTEGER NOT NULL REFERENCES groups(id)      ON DELETE CASCADE,
  UNIQUE (assignment_id, group_id)
);

-- Submissions: one confirmation per (assignment, group) pair.
CREATE TABLE IF NOT EXISTS submissions (
  id            SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_id      INTEGER NOT NULL REFERENCES groups(id)      ON DELETE CASCADE,
  confirmed_by  INTEGER NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  note          TEXT,
  confirmed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, group_id)
);

-- Single-use OTP codes for password recovery (short lifetime, enforced in the API).
-- Rebuilt on startup so a schema change cannot leave an old token table behind.
DROP TABLE IF EXISTS password_resets;
CREATE TABLE password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash   VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  attempts   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for the dashboard queries.
CREATE INDEX IF NOT EXISTS idx_group_members_user   ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group  ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_assignment_groups_grp ON assignment_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_group    ON submissions(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
