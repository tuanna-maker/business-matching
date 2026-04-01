-- Add branding / trend columns only when "projects" exists.
-- Remote DBs that never applied the initial migration would otherwise fail with 42P01.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'projects'
  ) THEN
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "brand_palette" TEXT;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "growth_rate_pct" INTEGER;
  END IF;
END $$;
