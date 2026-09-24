-- Make App Store records authoritative for application-backed case studies.
-- Legacy portfolio migrations could leave a case study attached to a duplicate
-- project row even when an app with the same public slug exists. Re-linking the
-- case study to the app makes show_in_projects authoritative and restores the
-- intended ON DELETE CASCADE behavior when an app is removed.
BEGIN;

UPDATE public.case_studies AS c
SET
  app_id = a.id,
  project_id = NULL,
  updated_at = NOW()
FROM public.apps AS a
WHERE c.project_id IS NOT NULL
  AND a.slug IS NOT NULL
  AND lower(replace(c.slug, '_', '-')) = lower(replace(a.slug, '_', '-'))
  AND NOT EXISTS (
    SELECT 1
    FROM public.case_studies AS other
    WHERE other.app_id = a.id
      AND other.id <> c.id
  );

COMMIT;
