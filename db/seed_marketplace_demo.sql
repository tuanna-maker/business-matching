-- Marketplace demo seed: add more startups/investors + many published projects
-- Run AFTER:
-- - db/migrations/001_init.sql
-- - db/migrations/002_add_user_approval_status.sql
-- - db/seed_demo_3_accounts.sql
--
-- Password for all accounts below: 123456
-- bcrypt hash (cost=10): $2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG

BEGIN;

-- Use the default org created by seed_demo_3_accounts.sql
-- If you changed org name, update this.
WITH org AS (
  SELECT id FROM orgs WHERE name = 'IEC Hub Default' LIMIT 1
)
SELECT 1;

-- =========
-- Extra Startup accounts + profiles
-- =========
INSERT INTO users (id, org_id, full_name, email, user_type, password_hash, created_at, updated_at, created_by)
VALUES
  ('a1111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'Nova Founder', 'nova@startup.local', 'startup', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL),
  ('a2222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'FactoryOps CEO', 'factoryops@startup.local', 'startup', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL),
  ('a3333333-3333-4333-8333-333333333333', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'HealthBridge Founder', 'healthbridge@startup.local', 'startup', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL),
  ('a4444444-4444-4444-8444-444444444444', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'GreenLogix Founder', 'greenlogix@startup.local', 'startup', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL),
  ('a5555555-5555-4555-8555-555555555555', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'EduFlow Founder', 'eduflow@startup.local', 'startup', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL)
ON CONFLICT (email) DO NOTHING;

INSERT INTO startup_profiles (id, org_id, user_id, company_name, website, industry, country, city, stage, funding_need_amount, funding_currency, short_description, created_at, updated_at, created_by)
VALUES
  ('b1111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='nova@startup.local' LIMIT 1), 'Nova Fintech', 'https://nova.example', 'Fintech', 'VN', 'HCMC', 'Seed', 600000, 'USD', 'Risk engine + embedded lending for SME.', now(), now(), NULL),
  ('b2222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='factoryops@startup.local' LIMIT 1), 'FactoryOps', 'https://factoryops.example', 'SaaS', 'VN', 'HN', 'Series A', 1200000, 'USD', 'Operations platform for manufacturers.', now(), now(), NULL),
  ('b3333333-3333-4333-8333-333333333333', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='healthbridge@startup.local' LIMIT 1), 'HealthBridge', 'https://healthbridge.example', 'Health', 'VN', 'DN', 'Seed', 400000, 'USD', 'Care coordination workflows for clinics.', now(), now(), NULL),
  ('b4444444-4444-4444-8444-444444444444', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='greenlogix@startup.local' LIMIT 1), 'GreenLogix', 'https://greenlogix.example', 'Climate', 'VN', 'HCMC', 'Pre-seed', 250000, 'USD', 'Carbon-aware logistics optimization.', now(), now(), NULL),
  ('b5555555-5555-4555-8555-555555555555', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='eduflow@startup.local' LIMIT 1), 'EduFlow', 'https://eduflow.example', 'Edtech', 'VN', 'HN', 'Seed', 300000, 'USD', 'Workforce upskilling platform for enterprises.', now(), now(), NULL)
ON CONFLICT (user_id) DO NOTHING;

-- =========
-- Extra Investor accounts + profiles
-- =========
INSERT INTO users (id, org_id, full_name, email, user_type, password_hash, created_at, updated_at, created_by)
VALUES
  ('c1111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'Alpha Fund Partner', 'alpha@investor.local', 'investor', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL),
  ('c2222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'Beta Ventures', 'beta@investor.local', 'investor', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL),
  ('c3333333-3333-4333-8333-333333333333', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), 'Gamma Capital', 'gamma@investor.local', 'investor', '$2b$10$tIQbxckgK0r19SP1XAk0mOucnUQ497WupDgyGKhVferOwvErLnIjG', now(), now(), NULL)
ON CONFLICT (email) DO NOTHING;

INSERT INTO investor_profiles (id, org_id, user_id, organization_name, investor_type, ticket_size_min, ticket_size_max, preferred_industries, preferred_stages, country, created_at, updated_at, created_by)
VALUES
  ('d1111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='alpha@investor.local' LIMIT 1), 'Alpha Fund', 'basic', 50000, 250000, ARRAY['Fintech','SaaS','Health'], ARRAY['Pre-seed','Seed','Series A'], 'VN', now(), now(), NULL),
  ('d2222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='beta@investor.local' LIMIT 1), 'Beta Ventures', 'basic', 100000, 500000, ARRAY['SaaS','Climate'], ARRAY['Seed','Series A'], 'VN', now(), now(), NULL),
  ('d3333333-3333-4333-8333-333333333333', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM users WHERE email='gamma@investor.local' LIMIT 1), 'Gamma Capital', 'basic', 250000, 1500000, ARRAY['Fintech','Edtech'], ARRAY['Seed','Series A','Series B'], 'VN', now(), now(), NULL)
ON CONFLICT (user_id) DO NOTHING;

-- =========
-- Approval statuses: approve seeded marketplace accounts so they can access full UX (if column exists)
-- =========
DO $$
BEGIN
  UPDATE users
    SET approval_status = 'approved',
        approved_at = now(),
        approved_by = (SELECT id FROM users WHERE email='admin@example.com' LIMIT 1)
  WHERE email IN (
    'nova@startup.local','factoryops@startup.local','healthbridge@startup.local','greenlogix@startup.local','eduflow@startup.local',
    'alpha@investor.local','beta@investor.local','gamma@investor.local'
  );
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

-- =========
-- Published projects (what Investor sees in Discover)
-- Each startup will have 2 projects: 1 product + 1 "service/partnership offer"
-- =========
INSERT INTO projects (id, org_id, startup_id, title, slug, summary, description, industry, stage, funding_need_amount, funding_currency, status, iec_level, created_at, updated_at, created_by)
VALUES
  -- Nova Fintech
  ('e1111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='Nova Fintech' LIMIT 1), 'Nova Fintech – Embedded Lending', 'nova-embedded-lending', 'Embedded lending for SME merchants.', 'Product listing for Discover.', 'Fintech', 'Seed', 600000, 'USD', 'published', 'L3', now(), now(), (SELECT id FROM users WHERE email='nova@startup.local' LIMIT 1)),
  ('e1111111-1111-4111-8111-111111111112', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='Nova Fintech' LIMIT 1), 'Service Offer – Credit Scoring API', 'nova-credit-scoring-api', 'Offer scoring API partnership for B2B.', 'Service-style listing (still stored as Project).', 'Fintech', 'Service', NULL, NULL, 'published', 'L1', now(), now(), (SELECT id FROM users WHERE email='nova@startup.local' LIMIT 1)),

  -- FactoryOps
  ('e2222222-2222-4222-8222-222222222221', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='FactoryOps' LIMIT 1), 'FactoryOps – Manufacturing OS', 'factoryops-manufacturing-os', 'Ops platform for factories (MES-lite).', 'Product listing for Discover.', 'SaaS', 'Series A', 1200000, 'USD', 'published', 'L1', now(), now(), (SELECT id FROM users WHERE email='factoryops@startup.local' LIMIT 1)),
  ('e2222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='FactoryOps' LIMIT 1), 'Service Offer – Implementation Partner', 'factoryops-implementation-partner', 'Onsite implementation & integration service.', 'Service-style listing (still stored as Project).', 'SaaS', 'Service', NULL, NULL, 'published', 'L0', now(), now(), (SELECT id FROM users WHERE email='factoryops@startup.local' LIMIT 1)),

  -- HealthBridge
  ('e3333333-3333-4333-8333-333333333331', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='HealthBridge' LIMIT 1), 'HealthBridge – Clinic Workflow Suite', 'healthbridge-clinic-workflow', 'Clinic workflow + patient coordination.', 'Product listing for Discover.', 'Health', 'Seed', 400000, 'USD', 'published', 'L0', now(), now(), (SELECT id FROM users WHERE email='healthbridge@startup.local' LIMIT 1)),
  ('e3333333-3333-4333-8333-333333333332', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='HealthBridge' LIMIT 1), 'Service Offer – Hospital Integration', 'healthbridge-hospital-integration', 'Integration service for hospital systems.', 'Service-style listing (still stored as Project).', 'Health', 'Service', NULL, NULL, 'published', 'L1', now(), now(), (SELECT id FROM users WHERE email='healthbridge@startup.local' LIMIT 1)),

  -- GreenLogix
  ('e4444444-4444-4444-8444-444444444441', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='GreenLogix' LIMIT 1), 'GreenLogix – Carbon-aware Routing', 'greenlogix-carbon-routing', 'Reduce emissions with better routing decisions.', 'Product listing for Discover.', 'Climate', 'Pre-seed', 250000, 'USD', 'published', 'L1', now(), now(), (SELECT id FROM users WHERE email='greenlogix@startup.local' LIMIT 1)),
  ('e4444444-4444-4444-8444-444444444442', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='GreenLogix' LIMIT 1), 'Service Offer – ESG Reporting Kit', 'greenlogix-esg-reporting-kit', 'B2B ESG reporting templates + data connector.', 'Service-style listing (still stored as Project).', 'Climate', 'Service', NULL, NULL, 'published', 'L0', now(), now(), (SELECT id FROM users WHERE email='greenlogix@startup.local' LIMIT 1)),

  -- EduFlow
  ('e5555555-5555-4555-8555-555555555551', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='EduFlow' LIMIT 1), 'EduFlow – Enterprise Upskilling', 'eduflow-upskilling', 'Upskilling platform with analytics for HR.', 'Product listing for Discover.', 'Edtech', 'Seed', 300000, 'USD', 'published', 'L0', now(), now(), (SELECT id FROM users WHERE email='eduflow@startup.local' LIMIT 1)),
  ('e5555555-5555-4555-8555-555555555552', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1), (SELECT id FROM startup_profiles WHERE company_name='EduFlow' LIMIT 1), 'Service Offer – Corporate Training Program', 'eduflow-corporate-training', 'Custom training program design & delivery.', 'Service-style listing (still stored as Project).', 'Edtech', 'Service', NULL, NULL, 'published', 'L1', now(), now(), (SELECT id FROM users WHERE email='eduflow@startup.local' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- =========
-- Service listings (what Startup sees in B2B Services)
-- =========
INSERT INTO service_listings (
  id, org_id, startup_id, title, slug, summary, description, category, industry,
  price_from, price_to, currency, status, created_at, updated_at, created_by
)
VALUES
  -- Nova Fintech services
  ('aa111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM startup_profiles WHERE company_name='Nova Fintech' LIMIT 1),
    'Credit Scoring API Integration',
    'nova-credit-scoring-api-integration',
    'Partner API for underwriting & scoring.',
    'We provide SDK + integration support + risk model tuning.',
    'API/Integration',
    'Fintech',
    2000, 8000, 'USD', 'published', now(), now(),
    (SELECT id FROM users WHERE email='nova@startup.local' LIMIT 1)
  ),
  -- FactoryOps services
  ('aa222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM startup_profiles WHERE company_name='FactoryOps' LIMIT 1),
    'Onsite Implementation & ERP Connector',
    'factoryops-implementation-erp-connector',
    'Implementation team for integration projects.',
    'Deliver MES-lite rollout + ERP data connector + training.',
    'Implementation',
    'SaaS',
    5000, 25000, 'USD', 'published', now(), now(),
    (SELECT id FROM users WHERE email='factoryops@startup.local' LIMIT 1)
  ),
  -- HealthBridge services
  ('aa333333-3333-4333-8333-333333333333', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM startup_profiles WHERE company_name='HealthBridge' LIMIT 1),
    'Hospital System Integration',
    'healthbridge-hospital-system-integration',
    'Integrate with hospital EMR & lab systems.',
    'HL7/FHIR connectors + deployment support.',
    'Integration',
    'Health',
    3000, 15000, 'USD', 'published', now(), now(),
    (SELECT id FROM users WHERE email='healthbridge@startup.local' LIMIT 1)
  ),
  -- GreenLogix services
  ('aa444444-4444-4444-8444-444444444444', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM startup_profiles WHERE company_name='GreenLogix' LIMIT 1),
    'ESG Reporting Toolkit',
    'greenlogix-esg-reporting-toolkit',
    'Templates + data pipeline for ESG reporting.',
    'Starter kit for enterprise ESG reporting with connectors.',
    'Toolkit',
    'Climate',
    1000, 6000, 'USD', 'published', now(), now(),
    (SELECT id FROM users WHERE email='greenlogix@startup.local' LIMIT 1)
  ),
  -- EduFlow services
  ('aa555555-5555-4555-8555-555555555555', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM startup_profiles WHERE company_name='EduFlow' LIMIT 1),
    'Corporate Training Program Design',
    'eduflow-corporate-training-program-design',
    'Design & deliver enterprise training programs.',
    'Custom curriculum + delivery + analytics reporting.',
    'Training',
    'Edtech',
    2000, 12000, 'USD', 'published', now(), now(),
    (SELECT id FROM users WHERE email='eduflow@startup.local' LIMIT 1)
  )
ON CONFLICT (slug) DO NOTHING;

-- =========
-- Optional: add a few match intents so Investor "My deal flow" is not empty
-- =========
INSERT INTO match_intents (id, org_id, investor_id, project_id, status, source, created_at, updated_at, created_by)
VALUES
  ('f1111111-1111-4111-8111-111111111111', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM investor_profiles WHERE organization_name='Alpha Fund' LIMIT 1),
    (SELECT id FROM projects WHERE slug='nova-embedded-lending' LIMIT 1),
    'liked', 'seed_marketplace', now(), now(), (SELECT id FROM users WHERE email='alpha@investor.local' LIMIT 1)
  ),
  ('f2222222-2222-4222-8222-222222222222', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM investor_profiles WHERE organization_name='Beta Ventures' LIMIT 1),
    (SELECT id FROM projects WHERE slug='factoryops-manufacturing-os' LIMIT 1),
    'requested_meeting', 'seed_marketplace', now(), now(), (SELECT id FROM users WHERE email='beta@investor.local' LIMIT 1)
  ),
  ('f3333333-3333-4333-8333-333333333333', (SELECT id FROM orgs WHERE name='IEC Hub Default' LIMIT 1),
    (SELECT id FROM investor_profiles WHERE organization_name='Gamma Capital' LIMIT 1),
    (SELECT id FROM projects WHERE slug='eduflow-upskilling' LIMIT 1),
    'liked', 'seed_marketplace', now(), now(), (SELECT id FROM users WHERE email='gamma@investor.local' LIMIT 1)
  )
ON CONFLICT (investor_id, project_id) DO NOTHING;

COMMIT;

