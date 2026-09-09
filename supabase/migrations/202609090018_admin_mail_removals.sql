BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_mail_folder_state (
  folder text PRIMARY KEY CHECK (folder IN ('inbox', 'sent')),
  cleared_before timestamptz,
  preserve_subject text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_mail_removed (
  folder text NOT NULL CHECK (folder IN ('inbox', 'sent')),
  message_id uuid NOT NULL,
  removed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (folder, message_id)
);

-- Initial owner-authorized cleanup: clear both current lists while retaining the
-- genuine inbox message whose subject contains "SEO Report".
INSERT INTO public.admin_mail_folder_state(folder, cleared_before, preserve_subject)
VALUES
  ('inbox', '2026-09-09T15:47:17Z'::timestamptz, 'SEO Report'),
  ('sent', '2026-09-09T15:47:17Z'::timestamptz, NULL)
ON CONFLICT (folder) DO NOTHING;

ALTER TABLE public.admin_mail_folder_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_mail_removed ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_mail_folder_state, public.admin_mail_removed FROM anon, authenticated;
GRANT ALL ON public.admin_mail_folder_state, public.admin_mail_removed TO service_role;

COMMIT;
