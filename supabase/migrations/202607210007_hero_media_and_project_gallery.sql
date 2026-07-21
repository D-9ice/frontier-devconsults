ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS hero_media_settings (
  id TEXT PRIMARY KEY DEFAULT 'homepage',
  desktop_media_url TEXT,
  desktop_media_type VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (desktop_media_type IN ('image', 'video')),
  desktop_poster_url TEXT,
  mobile_media_url TEXT,
  mobile_media_type VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (mobile_media_type IN ('image', 'video')),
  mobile_poster_url TEXT,
  office_media JSONB NOT NULL DEFAULT '[]'::jsonb,
  alt_text TEXT NOT NULL DEFAULT 'Frontier DevConsults office workspace',
  overlay_strength INTEGER NOT NULL DEFAULT 5 CHECK (overlay_strength BETWEEN 0 AND 95),
  desktop_focal_position VARCHAR(100) NOT NULL DEFAULT 'center 35%',
  mobile_focal_position VARCHAR(100) NOT NULL DEFAULT 'center center',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  revision INTEGER NOT NULL DEFAULT 0,
  updated_by VARCHAR(255) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hero_media_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings JSONB NOT NULL,
  action VARCHAR(20) NOT NULL DEFAULT 'save' CHECK (action IN ('save', 'restore')),
  editor_username VARCHAR(255) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hero_media_revisions_created_at ON hero_media_revisions(created_at DESC);

ALTER TABLE hero_media_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_media_revisions ENABLE ROW LEVEL SECURITY;
