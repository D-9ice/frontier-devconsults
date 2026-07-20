CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Planning',
  visibility VARCHAR(20) NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  logo_url VARCHAR(500),
  live_link VARCHAR(500),
  download_link VARCHAR(500),
  color VARCHAR(32) NOT NULL DEFAULT 'blue',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'draft';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS download_link VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS color VARCHAR(32) NOT NULL DEFAULT 'blue';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique ON projects(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS projects_public_listing ON projects(visibility, sort_order, updated_at DESC);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public reads" ON projects;
-- Public project content is returned by the server; the service role bypasses RLS.
