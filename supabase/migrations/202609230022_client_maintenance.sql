-- Frontier DevConsults client maintenance channel
-- Frontier is the authoritative maintenance/service record.
-- Client applications receive signed synchronized notices and completed-service records.

CREATE TABLE IF NOT EXISTS public.client_maintenance_clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  site_url text NOT NULL,
  contact_email text NOT NULL,
  interval_months integer NOT NULL DEFAULT 3 CHECK (interval_months BETWEEN 1 AND 24),
  last_service_at timestamptz,
  next_service_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_maintenance_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL REFERENCES public.client_maintenance_clients(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('frontier_to_client','client_to_frontier')),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','critical')),
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  external_id text,
  email_status text NOT NULL DEFAULT 'not_requested' CHECK (email_status IN ('not_requested','accepted','skipped','failed')),
  email_provider_id text,
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending','synced','failed')),
  sync_error text,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, external_id)
);

CREATE TABLE IF NOT EXISTS public.client_maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL REFERENCES public.client_maintenance_clients(id) ON DELETE CASCADE,
  service_reference text NOT NULL UNIQUE,
  completed_at timestamptz NOT NULL,
  summary text NOT NULL DEFAULT '',
  findings text NOT NULL DEFAULT '',
  work_performed text NOT NULL DEFAULT '',
  recommendations text NOT NULL DEFAULT '',
  next_due_at timestamptz NOT NULL,
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending','synced','failed')),
  sync_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_maintenance_sync_nonces (
  nonce text PRIMARY KEY,
  source text NOT NULL CHECK (source IN ('macsunny','frontier')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS client_maintenance_notices_client_created_idx
  ON public.client_maintenance_notices(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS client_maintenance_records_client_completed_idx
  ON public.client_maintenance_records(client_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS client_maintenance_nonces_expiry_idx
  ON public.client_maintenance_sync_nonces(expires_at);

ALTER TABLE public.client_maintenance_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_maintenance_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_maintenance_sync_nonces ENABLE ROW LEVEL SECURITY;

-- No browser/public policies are created. Server-side service-role access only.

INSERT INTO public.client_maintenance_clients (
  id, name, site_url, contact_email, interval_months, status
) VALUES (
  'macsunny',
  'MacSunny Electronics',
  'https://www.macsunny.com',
  'Macsunny2025@gmail.com',
  3,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  site_url = EXCLUDED.site_url,
  contact_email = EXCLUDED.contact_email,
  interval_months = EXCLUDED.interval_months,
  updated_at = now();
