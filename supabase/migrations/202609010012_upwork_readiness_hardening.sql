-- Additive lifecycle, evidence, media, and release metadata for the Upwork-readiness release.
-- Existing uploader records and legacy status values remain intact.
ALTER TABLE apps ADD COLUMN IF NOT EXISTS lifecycle VARCHAR(24);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS external_url_verified_at TIMESTAMPTZ;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS upwork_skill_tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS upwork_relevance TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_version VARCHAR(80);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_platform VARCHAR(120);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_byte_size BIGINT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_release_date DATE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_checksum VARCHAR(160);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_verified_at TIMESTAMPTZ;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_availability VARCHAR(32) NOT NULL DEFAULT 'temporarily_unavailable';

UPDATE apps
SET lifecycle = CASE
  WHEN LOWER(COALESCE(status, '')) IN ('published', 'live', 'production', 'released') THEN 'live'
  WHEN LOWER(COALESCE(status, '')) IN ('development', 'in development', 'in_development', 'in progress') THEN 'in_development'
  WHEN LOWER(COALESCE(status, '')) IN ('archived', 'retired') THEN 'archived'
  ELSE 'planning'
END
WHERE lifecycle IS NULL;

ALTER TABLE apps ALTER COLUMN lifecycle SET DEFAULT 'planning';
ALTER TABLE apps ALTER COLUMN lifecycle SET NOT NULL;
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_lifecycle_check;
ALTER TABLE apps ADD CONSTRAINT apps_lifecycle_check CHECK (lifecycle IN ('live', 'in_development', 'planning', 'archived'));
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_artifact_availability_check;
ALTER TABLE apps ADD CONSTRAINT apps_artifact_availability_check CHECK (artifact_availability IN ('available', 'temporarily_unavailable', 'unavailable'));
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_artifact_byte_size_check;
ALTER TABLE apps ADD CONSTRAINT apps_artifact_byte_size_check CHECK (artifact_byte_size IS NULL OR artifact_byte_size > 0);

CREATE INDEX IF NOT EXISTS apps_lifecycle_visibility_idx ON apps(visibility, lifecycle, sort_order);

-- Explicit owner approval remains required: this migration never changes
-- show_in_upwork_portfolio or invents evidence, outcomes, URLs, or artifacts.
