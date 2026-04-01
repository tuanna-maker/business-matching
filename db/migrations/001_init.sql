-- Initial schema for IEC Hub Business Matching

-- Enable UUID extension if not already enabled
--CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============
-- Core / Org
-- ==============

CREATE TABLE orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES orgs (id),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  avatar_url text,
  user_type text NOT NULL CHECK (user_type IN ('startup', 'investor', 'admin', 'iec_staff')),
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_users_org_id ON users (org_id);
CREATE INDEX idx_users_user_type ON users (user_type);

CREATE TABLE roles (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role_id int NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ==============
-- Profiles
-- ==============

CREATE TABLE startup_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  user_id uuid NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website text,
  industry text,
  country text,
  city text,
  stage text,
  funding_need_amount numeric,
  funding_currency text,
  short_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_startup_profiles_org_id ON startup_profiles (org_id);

CREATE TABLE investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  user_id uuid NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  organization_name text NOT NULL,
  investor_type text,
  ticket_size_min numeric,
  ticket_size_max numeric,
  preferred_industries text[],
  preferred_stages text[],
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_investor_profiles_org_id ON investor_profiles (org_id);

-- ==============
-- Projects & Documents
-- ==============

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  startup_id uuid NOT NULL REFERENCES startup_profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  description text,
  industry text,
  stage text,
  funding_need_amount numeric,
  funding_currency text,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  iec_level text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_projects_org_id ON projects (org_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_iec_level ON projects (iec_level);

CREATE TABLE project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  type text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size int,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_project_documents_project_id ON project_documents (project_id);

-- ==============
-- IEC Framework
-- ==============

CREATE TABLE iec_levels (
  id serial PRIMARY KEY,
  org_id uuid REFERENCES orgs (id),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  "order" int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TABLE iec_criteria (
  id serial PRIMARY KEY,
  org_id uuid REFERENCES orgs (id),
  iec_level_id int NOT NULL REFERENCES iec_levels (id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  weight numeric,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_iec_criteria_level_id ON iec_criteria (iec_level_id);

CREATE TABLE project_iec_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  assessor_id uuid NOT NULL REFERENCES users (id),
  target_level_id int NOT NULL REFERENCES iec_levels (id),
  final_level_id int REFERENCES iec_levels (id),
  status text NOT NULL CHECK (status IN ('in_review', 'approved', 'rejected')) DEFAULT 'in_review',
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_project_iec_assessments_project_id ON project_iec_assessments (project_id);
CREATE INDEX idx_project_iec_assessments_org_id ON project_iec_assessments (org_id);

CREATE TABLE project_iec_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  assessment_id uuid NOT NULL REFERENCES project_iec_assessments (id) ON DELETE CASCADE,
  criterion_id int NOT NULL REFERENCES iec_criteria (id),
  score numeric NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_project_iec_scores_assessment_id ON project_iec_scores (assessment_id);

-- ==============
-- Matching
-- ==============

CREATE TABLE match_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  investor_id uuid NOT NULL REFERENCES investor_profiles (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('liked', 'requested_meeting', 'not_interested', 'matched')) DEFAULT 'liked',
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (investor_id, project_id)
);

CREATE INDEX idx_match_intents_org_id ON match_intents (org_id);
CREATE INDEX idx_match_intents_investor_id ON match_intents (investor_id);
CREATE INDEX idx_match_intents_project_id ON match_intents (project_id);

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  startup_id uuid NOT NULL REFERENCES startup_profiles (id),
  investor_id uuid NOT NULL REFERENCES investor_profiles (id),
  match_intent_id uuid REFERENCES match_intents (id),
  iec_level_at_match text,
  status text NOT NULL CHECK (status IN ('pending_intro', 'intro_done', 'in_discussion', 'closed_deal', 'rejected')) DEFAULT 'pending_intro',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_matches_org_id ON matches (org_id);
CREATE INDEX idx_matches_startup_id ON matches (startup_id);
CREATE INDEX idx_matches_investor_id ON matches (investor_id);

CREATE TABLE match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  match_id uuid NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('intro_sent', 'meeting_scheduled', 'meeting_done', 'note_added', 'status_changed')),
  old_status text,
  new_status text,
  actor_id uuid NOT NULL REFERENCES users (id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_match_events_match_id ON match_events (match_id);

-- ==============
-- Audit Logs
-- ==============

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  actor_id uuid,
  actor_type text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  payload_before jsonb,
  payload_after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs (org_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- Ensure password_hash column exists for JWT auth (safe if rerun)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash text;

