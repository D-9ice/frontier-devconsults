-- Run after adding SUPABASE_SERVICE_ROLE_KEY to the application environment.
-- Server routes use this key; browser clients must never receive it.

ALTER TABLE IF EXISTS admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pricing_settings ENABLE ROW LEVEL SECURITY;

-- Remove the legacy anon write policies that allowed anyone holding the public key
-- to alter the whole pricing record.
DROP POLICY IF EXISTS "Allow pricing admin writes" ON pricing_settings;
DROP POLICY IF EXISTS "Allow pricing admin updates" ON pricing_settings;

-- Public pages read pricing through the application server, not directly from Supabase.
DROP POLICY IF EXISTS "Allow public reads" ON pricing_settings;

-- The service role bypasses RLS. No anon/authenticated policies are created here for
-- admin_credentials or pricing_settings.
