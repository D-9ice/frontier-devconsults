-- Finalize the manager boundary.
-- App Store changes must never mutate Projects & Case Studies.
BEGIN;

DROP TRIGGER IF EXISTS trg_sync_case_study_app_media ON public.apps;
DROP FUNCTION IF EXISTS public.sync_case_study_app_media();

REVOKE ALL ON FUNCTION public.sync_case_study_project_media() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_case_study_project_media() FROM anon;
REVOKE ALL ON FUNCTION public.sync_case_study_project_media() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_case_study_project_media() TO service_role;

COMMIT;
