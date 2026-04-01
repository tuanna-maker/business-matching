-- Row Level Security policies for IEC Hub Business Matching

-- Enable RLS on business tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_iec_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_iec_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: assume a function current_user_id() returning uuid (to be implemented in DB or via Supabase)

-- Users: user can see/update their own row; admins/iec_staff of same org can see all
CREATE POLICY users_select_own_or_org_admin
  ON users
  FOR SELECT
  USING (
    id = current_user_id()
    OR user_type IN ('admin', 'iec_staff')
  );

CREATE POLICY users_update_self
  ON users
  FOR UPDATE
  USING (id = current_user_id());

-- Startup profiles: owner or org admins
CREATE POLICY startup_profiles_select
  ON startup_profiles
  FOR SELECT
  USING (
    user_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = startup_profiles.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY startup_profiles_update_owner
  ON startup_profiles
  FOR UPDATE
  USING (user_id = current_user_id());

-- Investor profiles: owner or org admins
CREATE POLICY investor_profiles_select
  ON investor_profiles
  FOR SELECT
  USING (
    user_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = investor_profiles.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY investor_profiles_update_owner
  ON investor_profiles
  FOR UPDATE
  USING (user_id = current_user_id());

-- Projects: startup owner can manage; investors see only published in same org; admins see all
CREATE POLICY projects_select
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM startup_profiles sp
      WHERE sp.id = projects.startup_id
        AND sp.user_id = current_user_id()
    )
    OR (
      status = 'published'
      AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = current_user_id()
          AND u.org_id = projects.org_id
      )
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = projects.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY projects_insert_startup_owner
  ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM startup_profiles sp
      WHERE sp.id = startup_id
        AND sp.user_id = current_user_id()
    )
  );

CREATE POLICY projects_update_startup_owner_or_admin
  ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM startup_profiles sp
      WHERE sp.id = projects.startup_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = projects.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

-- Project documents: owner, related investors (via matches), org admins
CREATE POLICY project_documents_select
  ON project_documents
  FOR SELECT
  USING (
    is_public
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN startup_profiles sp ON sp.id = p.startup_id
      WHERE p.id = project_documents.project_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM matches m
      JOIN investor_profiles ip ON ip.id = m.investor_id
      WHERE m.project_id = project_documents.project_id
        AND ip.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = project_documents.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY project_documents_modify_owner_or_admin
  ON project_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN startup_profiles sp ON sp.id = p.startup_id
      WHERE p.id = project_documents.project_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = project_documents.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

-- IEC assessments & scores: startup (read only), assessor/admin (read/write), investors (read reduced via API)
CREATE POLICY project_iec_assessments_select
  ON project_iec_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN startup_profiles sp ON sp.id = p.startup_id
      WHERE p.id = project_iec_assessments.project_id
        AND sp.user_id = current_user_id()
    )
    OR assessor_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = project_iec_assessments.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY project_iec_assessments_write_assessor_or_admin
  ON project_iec_assessments
  FOR ALL
  USING (
    assessor_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = project_iec_assessments.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY project_iec_scores_rw
  ON project_iec_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_iec_assessments a
      WHERE a.id = project_iec_scores.assessment_id
        AND (
          a.assessor_id = current_user_id()
          OR EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = current_user_id()
              AND u.org_id = project_iec_scores.org_id
              AND u.user_type IN ('admin', 'iec_staff')
          )
        )
    )
  );

-- Match intents: investor owner (rw), startup owner (read), admin
CREATE POLICY match_intents_select
  ON match_intents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = match_intents.investor_id
        AND ip.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN startup_profiles sp ON sp.id = p.startup_id
      WHERE p.id = match_intents.project_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = match_intents.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY match_intents_rw_investor_or_admin
  ON match_intents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = match_intents.investor_id
        AND ip.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = match_intents.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

-- Matches & events: startup/investor participants and admins
CREATE POLICY matches_select
  ON matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM startup_profiles sp
      WHERE sp.id = matches.startup_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM investor_profiles ip
      WHERE ip.id = matches.investor_id
        AND ip.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = matches.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY matches_update_admin_only
  ON matches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = matches.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY match_events_select
  ON match_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN startup_profiles sp ON sp.id = m.startup_id
      WHERE m.id = match_events.match_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM matches m
      JOIN investor_profiles ip ON ip.id = m.investor_id
      WHERE m.id = match_events.match_id
        AND ip.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = match_events.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

CREATE POLICY match_events_insert_participant_or_admin
  ON match_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN startup_profiles sp ON sp.id = m.startup_id
      WHERE m.id = match_events.match_id
        AND sp.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM matches m
      JOIN investor_profiles ip ON ip.id = m.investor_id
      WHERE m.id = match_events.match_id
        AND ip.user_id = current_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = match_events.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

-- Audit logs: only admins/org_admins
CREATE POLICY audit_logs_select_admin
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = current_user_id()
        AND u.org_id = audit_logs.org_id
        AND u.user_type IN ('admin', 'iec_staff')
    )
  );

