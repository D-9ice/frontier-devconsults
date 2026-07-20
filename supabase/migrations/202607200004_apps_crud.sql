CREATE TABLE IF NOT EXISTS apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL,
  size VARCHAR(50),
  rating DECIMAL(2,1),
  downloads VARCHAR(50),
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  icon_url VARCHAR(500),
  screenshot_urls TEXT[] NOT NULL DEFAULT '{}',
  video_url VARCHAR(500),
  play_store_link VARCHAR(500),
  download_link VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'Development',
  visibility VARCHAR(20) NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE apps ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS screenshot_urls TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'draft';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS apps_slug_unique ON apps(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS apps_public_listing ON apps(visibility, sort_order, updated_at DESC);

ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public reads" ON apps;
-- Public app content is returned by the server; the service role bypasses RLS.
