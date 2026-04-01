-- Add account approval fields for Admin review flow
-- Safe to run multiple times.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approved_by uuid;

DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT users_approval_status_check
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users (approval_status);

COMMIT;

