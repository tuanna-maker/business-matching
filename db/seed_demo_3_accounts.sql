-- IEC Hub demo seed (3 sample accounts)
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING where possible).
-- Password for all demo accounts: 123456
--
-- Accounts:
-- - startup@example.com  (user_type: startup)
-- - investor@example.com (user_type: investor, investor_type: basic)
-- - admin@example.com    (user_type: admin)

BEGIN;

-- =========
-- IDs (fixed UUIDs so you can reference them)
-- =========
-- Org
--   ORG_ID:            4b325218-5a80-42b4-806d-177c62a17e95
-- Users
--   STARTUP_USER_ID:   a34fae02-274f-4d26-877a-eb43a4e41465
--   INVESTOR_USER_ID:  787bafb9-c9c3-4d23-ac8e-c3c98a874691
--   ADMIN_USER_ID:     40eb4149-5fa7-43df-a9d7-bc5b84ee433f
-- Profiles
--   STARTUP_PROFILE_ID: 3e3d2579-8a82-4272-96de-e2ad1f7b7f2c
--   INVESTOR_PROFILE_ID: fb40e305-5c2f-4d9c-bea6-27d9bd8a9f0f
-- Projects
--   PROJECT_L3_ID:     d836709b-fef3-48af-a6eb-ee406dc36082
--   PROJECT_L1_ID:     7261c687-f8c6-407e-9307-ee6f4af7247e
-- DataRoom + Request
--   DATA_ROOM_ID:      5c4b3dfc-76c3-48a0-80d3-fc5c47ef2357
--   DATA_ROOM_REQ_ID:  d823bdb9-23ce-48d7-8082-c8187731f963
-- Matching
--   INTENT_ID:         861199fb-2075-4b02-b450-44d72848cfdd
--   MATCH_ID:          ccf6c8a1-6432-4956-a0fc-b8ae7738e14f
--   MATCH_EVENT_ID:    5e62ec71-b1f0-4921-b3d2-3527b0ef6fe9
-- IEC
--   ASSESSMENT_ID:     ee1d617b-60d6-4ab8-8a66-03aa97c2d141
--   SCORE_ID:          bef354f0-38ec-4bf6-bbae-a002d46a75ba
-- Admin artifacts
--   AUDIT_ID:          6aace8af-8f64-4b3e-8046-f06cbbf6c349
-- Notifications
--   NOTIF_STARTUP_ID:  38e21f09-82f7-4092-a046-55a4b9d07ea0
--   NOTIF_INVESTOR_ID: 13b3d289-daa2-454e-81eb-9153b2fafa24
--   NOTIF_ADMIN_ID:    186f4a3c-ca15-4a53-81db-9de71e0bd7cd

-- =========
-- Org
-- =========
INSERT INTO orgs (id, name, org_type, created_at, updated_at, created_by)
VALUES (
  '4b325218-5a80-42b4-806d-177c62a17e95',
  'IEC Hub Default',
  'platform_admin',
  now(),
  now(),
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- =========
-- Users
-- =========
-- bcrypt hash for "123456" (cost=10):
-- $2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG

INSERT INTO users (id, org_id, full_name, email, phone, avatar_url, user_type, password_hash, created_at, updated_at, created_by)
VALUES
(
  'a34fae02-274f-4d26-877a-eb43a4e41465',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  'Demo Startup',
  'startup@example.com',
  NULL,
  NULL,
  'startup',
  '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG',
  now(),
  now(),
  NULL
),
(
  '787bafb9-c9c3-4d23-ac8e-c3c98a874691',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  'Demo Investor',
  'investor@example.com',
  NULL,
  NULL,
  'investor',
  '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG',
  now(),
  now(),
  NULL
),
(
  '40eb4149-5fa7-43df-a9d7-bc5b84ee433f',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  'Demo Admin',
  'admin@example.com',
  NULL,
  NULL,
  'admin',
  '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG',
  now(),
  now(),
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  org_id = EXCLUDED.org_id,
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type,
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- If approval columns exist, set initial statuses for demo.
DO $$
BEGIN
  UPDATE users
    SET approval_status = 'approved',
        approved_at = now(),
        approved_by = (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
  WHERE email = 'admin@example.com';

  UPDATE users
    SET approval_status = 'pending',
        approved_at = NULL,
        approved_by = NULL
  WHERE email IN ('startup@example.com', 'investor@example.com');
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

-- =========
-- Profiles
-- =========
INSERT INTO startup_profiles (
  id, org_id, user_id, company_name, website, industry, country, city, stage,
  funding_need_amount, funding_currency, short_description,
  created_at, updated_at, created_by
)
VALUES (
  '3e3d2579-8a82-4272-96de-e2ad1f7b7f2c',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT id FROM users WHERE email = 'startup@example.com' LIMIT 1),
  'Demo Startup Company',
  'https://example.com',
  'Fintech',
  'VN',
  'HCMC',
  'Seed',
  500000,
  'USD',
  'Fintech lending platform with strong risk engine.',
  now(),
  now(),
  NULL
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO investor_profiles (
  id, org_id, user_id, organization_name, investor_type,
  ticket_size_min, ticket_size_max, preferred_industries, preferred_stages, country,
  created_at, updated_at, created_by
)
VALUES (
  'fb40e305-5c2f-4d9c-bea6-27d9bd8a9f0f',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT id FROM users WHERE email = 'investor@example.com' LIMIT 1),
  'Demo Fund',
  'basic',
  50000,
  250000,
  ARRAY['Fintech','SaaS'],
  ARRAY['Seed','Series A'],
  'VN',
  now(),
  now(),
  NULL
)
ON CONFLICT (user_id) DO NOTHING;

-- =========
-- IEC master data (minimal)
-- =========
INSERT INTO iec_levels (org_id, code, name, description, "order", created_at, updated_at, created_by)
VALUES
  (NULL, 'L0', 'Level 0', 'Not verified', 0, now(), now(), NULL),
  (NULL, 'L1', 'Level 1', 'Basic verification', 1, now(), now(), NULL),
  (NULL, 'L3', 'Level 3', 'Advanced verification', 3, now(), now(), NULL)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "order" = EXCLUDED."order",
  updated_at = now();

INSERT INTO iec_criteria (org_id, iec_level_id, code, title, description, weight, is_required, created_at, updated_at, created_by)
SELECT
  NULL,
  (SELECT id FROM iec_levels WHERE code = 'L1' LIMIT 1),
  'L1-TEAM',
  'Team profile',
  'Team background and completeness',
  1.0,
  true,
  now(),
  now(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM iec_criteria c
  WHERE c.code = 'L1-TEAM'
    AND c.iec_level_id = (SELECT id FROM iec_levels WHERE code = 'L1' LIMIT 1)
);

INSERT INTO iec_criteria (org_id, iec_level_id, code, title, description, weight, is_required, created_at, updated_at, created_by)
SELECT
  NULL,
  (SELECT id FROM iec_levels WHERE code = 'L3' LIMIT 1),
  'L3-IP',
  'IP & defensibility',
  'Evidence of defensibility',
  1.0,
  true,
  now(),
  now(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM iec_criteria c
  WHERE c.code = 'L3-IP'
    AND c.iec_level_id = (SELECT id FROM iec_levels WHERE code = 'L3' LIMIT 1)
);

-- =========
-- Projects
-- =========
INSERT INTO projects (
  id, org_id, startup_id, title, slug, summary, description, industry, stage,
  funding_need_amount, funding_currency, status, iec_level,
  created_at, updated_at, created_by
)
VALUES
(
  'd836709b-fef3-48af-a6eb-ee406dc36082',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT sp.id FROM startup_profiles sp
   WHERE sp.user_id = (SELECT u.id FROM users u WHERE u.email = 'startup@example.com' LIMIT 1)
   LIMIT 1),
  'Demo Project L3',
  'demo-project-l3',
  'A verified (L3) fintech project for testing gating.',
  'Longer description for Demo Project L3.',
  'Fintech',
  'Seed',
  500000,
  'USD',
  'published',
  'L3',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'startup@example.com' LIMIT 1)
),
(
  '7261c687-f8c6-407e-9307-ee6f4af7247e',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT sp.id FROM startup_profiles sp
   WHERE sp.user_id = (SELECT u.id FROM users u WHERE u.email = 'startup@example.com' LIMIT 1)
   LIMIT 1),
  'Demo Project L1',
  'demo-project-l1',
  'A verified (L1) project for testing discover & intents.',
  'Longer description for Demo Project L1.',
  'SaaS',
  'Seed',
  200000,
  'USD',
  'published',
  'L1',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'startup@example.com' LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;

-- =========
-- Data room (metadata-only)
-- =========
INSERT INTO data_rooms (id, org_id, project_id, name, description, created_at, updated_at, created_by)
VALUES (
  '5c4b3dfc-76c3-48a0-80d3-fc5c47ef2357',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  '7261c687-f8c6-407e-9307-ee6f4af7247e',
  'Demo Data Room',
  'Pitch deck metadata only',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'startup@example.com' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO data_room_requests (
  id, org_id, project_id, investor_id, data_room_id, status, reason, created_at, updated_at, created_by
)
VALUES (
  'd823bdb9-23ce-48d7-8082-c8187731f963',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  '7261c687-f8c6-407e-9307-ee6f4af7247e',
  (SELECT ip.id FROM investor_profiles ip
   WHERE ip.user_id = (SELECT u.id FROM users u WHERE u.email = 'investor@example.com' LIMIT 1)
   LIMIT 1),
  '5c4b3dfc-76c3-48a0-80d3-fc5c47ef2357',
  'pending',
  NULL,
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'investor@example.com' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- =========
-- Matching (intent + match + event)
-- =========
INSERT INTO match_intents (id, org_id, investor_id, project_id, status, source, created_at, updated_at, created_by)
VALUES (
  '861199fb-2075-4b02-b450-44d72848cfdd',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT ip.id FROM investor_profiles ip
   WHERE ip.user_id = (SELECT u.id FROM users u WHERE u.email = 'investor@example.com' LIMIT 1)
   LIMIT 1),
  '7261c687-f8c6-407e-9307-ee6f4af7247e',
  'requested_meeting',
  'seed_sql',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'investor@example.com' LIMIT 1)
)
ON CONFLICT (investor_id, project_id) DO UPDATE SET
  status = EXCLUDED.status,
  source = EXCLUDED.source,
  updated_at = now();

INSERT INTO matches (
  id, org_id, project_id, startup_id, investor_id, match_intent_id, iec_level_at_match, status,
  created_at, updated_at, created_by
)
VALUES (
  'ccf6c8a1-6432-4956-a0fc-b8ae7738e14f',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  '7261c687-f8c6-407e-9307-ee6f4af7247e',
  (SELECT sp.id FROM startup_profiles sp
   WHERE sp.user_id = (SELECT u.id FROM users u WHERE u.email = 'startup@example.com' LIMIT 1)
   LIMIT 1),
  (SELECT ip.id FROM investor_profiles ip
   WHERE ip.user_id = (SELECT u.id FROM users u WHERE u.email = 'investor@example.com' LIMIT 1)
   LIMIT 1),
  (SELECT mi.id FROM match_intents mi
   WHERE mi.investor_id = (SELECT ip.id FROM investor_profiles ip
                           WHERE ip.user_id = (SELECT u.id FROM users u WHERE u.email = 'investor@example.com' LIMIT 1)
                           LIMIT 1)
     AND mi.project_id = '7261c687-f8c6-407e-9307-ee6f4af7247e'
   LIMIT 1),
  'L1',
  'pending_intro',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO match_events (
  id, org_id, match_id, event_type, old_status, new_status, actor_id, note, created_at, updated_at, created_by
)
VALUES (
  '5e62ec71-b1f0-4921-b3d2-3527b0ef6fe9',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  'ccf6c8a1-6432-4956-a0fc-b8ae7738e14f',
  'status_changed',
  NULL,
  'pending_intro',
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1),
  'Seeded match created',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- =========
-- IEC assessment (minimal: in_review + 1 score)
-- =========
INSERT INTO project_iec_assessments (
  id, org_id, project_id, assessor_id, target_level_id, final_level_id, status, comments, created_at, updated_at, created_by
)
VALUES (
  'ee1d617b-60d6-4ab8-8a66-03aa97c2d141',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  '7261c687-f8c6-407e-9307-ee6f4af7247e',
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1),
  (SELECT id FROM iec_levels WHERE code = 'L1' LIMIT 1),
  NULL,
  'in_review',
  'Seeded IEC assessment for review flow',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'startup@example.com' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_iec_scores (
  id, org_id, assessment_id, criterion_id, score, comment, created_at, updated_at, created_by
)
VALUES (
  'bef354f0-38ec-4bf6-bbae-a002d46a75ba',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  'ee1d617b-60d6-4ab8-8a66-03aa97c2d141',
  (SELECT id FROM iec_criteria WHERE code = 'L1-TEAM' ORDER BY id DESC LIMIT 1),
  8.5,
  'Looks good',
  now(),
  now(),
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- =========
-- Audit log (1 row)
-- =========
INSERT INTO audit_logs (id, org_id, actor_id, actor_type, action, entity_type, entity_id, payload_before, payload_after, created_at)
VALUES (
  '6aace8af-8f64-4b3e-8046-f06cbbf6c349',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1),
  'admin',
  'SEED',
  'system',
  NULL,
  NULL,
  '{"message":"Seed demo data inserted"}',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- =========
-- Notifications (3 rows)
-- =========
INSERT INTO notifications (id, org_id, recipient_user_id, type, payload, read_at, created_at)
VALUES
(
  '38e21f09-82f7-4092-a046-55a4b9d07ea0',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT id FROM users WHERE email = 'startup@example.com' LIMIT 1),
  'seed:start',
  '{"hint":"Login with startup@example.com / 123456"}',
  NULL,
  now()
),
(
  '13b3d289-daa2-454e-81eb-9153b2fafa24',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT id FROM users WHERE email = 'investor@example.com' LIMIT 1),
  'seed:start',
  '{"hint":"Login with investor@example.com / 123456"}',
  NULL,
  now()
),
(
  '186f4a3c-ca15-4a53-81db-9de71e0bd7cd',
  '4b325218-5a80-42b4-806d-177c62a17e95',
  (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1),
  'seed:start',
  '{"hint":"Login with admin@example.com / 123456"}',
  NULL,
  now()
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

