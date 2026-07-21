ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE build_requests
  ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS contact_submissions_inbox
  ON contact_submissions(archived, responded, created_at DESC);

CREATE INDEX IF NOT EXISTS build_requests_inbox
  ON build_requests(archived, responded, created_at DESC);
