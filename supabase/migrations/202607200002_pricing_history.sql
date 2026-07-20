CREATE TABLE IF NOT EXISTS pricing_settings_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settings JSONB NOT NULL,
  action VARCHAR(32) NOT NULL DEFAULT 'save',
  editor_username VARCHAR(255) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_settings_history_created_at
  ON pricing_settings_history(created_at DESC);

ALTER TABLE pricing_settings_history ENABLE ROW LEVEL SECURITY;
-- No browser policy: the server service role records and reads revisions.
