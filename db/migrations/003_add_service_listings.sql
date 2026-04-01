-- Add B2B Marketplace Service Listings
-- Safe to run multiple times.

BEGIN;

CREATE TABLE IF NOT EXISTS service_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs (id),
  startup_id uuid NOT NULL REFERENCES startup_profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  description text,
  category text,
  industry text,
  price_from numeric,
  price_to numeric,
  currency text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

DO $$
BEGIN
  ALTER TABLE service_listings
    ADD CONSTRAINT service_listings_status_check
    CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_service_listings_org_id ON service_listings (org_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_startup_id ON service_listings (startup_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_status ON service_listings (status);
CREATE INDEX IF NOT EXISTS idx_service_listings_industry ON service_listings (industry);

COMMIT;

