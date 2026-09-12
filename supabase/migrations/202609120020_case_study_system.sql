-- Evidence-controlled case studies linked to the existing projects/apps systems.
-- Core project and application records remain authoritative and are not duplicated.
BEGIN;

CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  app_id UUID UNIQUE REFERENCES public.apps(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  ownership_type VARCHAR(32) NOT NULL DEFAULT 'client_project',
  commercial_state VARCHAR(48) NOT NULL DEFAULT 'not_for_sale',
  client_commercial_authorized BOOLEAN NOT NULL DEFAULT FALSE,
  visibility VARCHAR(20) NOT NULL DEFAULT 'draft',
  executive_summary TEXT NOT NULL DEFAULT '',
  intended_market TEXT,
  engineering_responsibility TEXT,
  problem_opportunity TEXT,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenges_constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
  engineering_approach TEXT,
  architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
  engineering_decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  problems_solutions JSONB NOT NULL DEFAULT '[]'::jsonb,
  security_reliability JSONB NOT NULL DEFAULT '[]'::jsonb,
  performance_scalability TEXT,
  user_experience TEXT,
  technology_architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_status TEXT,
  engineering_insights TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  section_order JSONB NOT NULL DEFAULT '["overview","problem","objectives","challenges","approach","architecture","decisions","capabilities","solutions","security","performance","ux","technology","gallery","results","status","insights"]'::jsonb,
  seo_title VARCHAR(160),
  seo_description VARCHAR(320),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT case_studies_one_source CHECK ((project_id IS NOT NULL)::int + (app_id IS NOT NULL)::int = 1),
  CONSTRAINT case_studies_ownership CHECK (ownership_type IN ('frontier_product', 'client_project')),
  CONSTRAINT case_studies_commercial_state CHECK (commercial_state IN (
    'available_for_acquisition', 'available_for_licensing', 'available_for_customization',
    'partnership_available', 'not_currently_available', 'not_for_sale'
  )),
  CONSTRAINT case_studies_visibility CHECK (visibility IN ('draft', 'published')),
  CONSTRAINT case_studies_client_sale_guard CHECK (
    ownership_type = 'frontier_product'
    OR commercial_state = 'not_for_sale'
    OR client_commercial_authorized = TRUE
  )
);

CREATE INDEX IF NOT EXISTS case_studies_public_listing
  ON public.case_studies(visibility, published_at DESC, updated_at DESC);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.case_studies FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.case_studies TO service_role;

-- Existing portfolio projects migrate conservatively as client work. This prevents
-- accidental acquisition language until the owner explicitly reclassifies a record.
INSERT INTO public.case_studies (
  project_id, slug, ownership_type, commercial_state, visibility,
  executive_summary, capabilities, technology_architecture, project_status,
  evidence, published_at, created_at, updated_at
)
SELECT
  p.id,
  replace(lower(p.slug), '_', '-'),
  'client_project',
  'not_for_sale',
  p.visibility,
  p.description,
  to_jsonb(p.features),
  CASE WHEN cardinality(p.technologies) > 0
    THEN jsonb_build_object('Recorded technologies', to_jsonb(p.technologies))
    ELSE '{}'::jsonb END,
  p.status,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', gen_random_uuid()::text,
      'title', 'Published project screenshot ' || media.ordinality,
      'description', '',
      'type', 'screenshot',
      'sourceUrl', media.url,
      'date', NULL,
      'status', 'approved_for_publication',
      'attribution', NULL,
      'clientAttribution', NULL,
      'externalUrl', NULL,
      'publicationPermission', TRUE,
      'verificationState', 'verified'
    ) ORDER BY media.ordinality)
    FROM unnest(p.gallery_urls) WITH ORDINALITY AS media(url, ordinality)
  ), '[]'::jsonb)
  || CASE WHEN p.live_link IS NOT NULL THEN jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text, 'title', 'Published project link',
    'description', '', 'type', 'external_project_link', 'sourceUrl', NULL,
    'date', NULL, 'status', 'approved_for_publication', 'attribution', NULL,
    'clientAttribution', NULL, 'externalUrl', p.live_link,
    'publicationPermission', TRUE, 'verificationState', 'verified'
  )) ELSE '[]'::jsonb END,
  p.published_at,
  p.created_at,
  p.updated_at
FROM public.projects p
WHERE p.slug IS NOT NULL
ON CONFLICT DO NOTHING;

-- Product-only case studies reuse the current product/acquisition configuration.
-- A matching project slug wins, avoiding duplicate public case studies.
INSERT INTO public.case_studies (
  app_id, slug, ownership_type, commercial_state, visibility,
  executive_summary, problem_opportunity, challenges_constraints,
  engineering_responsibility, capabilities, technology_architecture,
  project_status, evidence, published_at, created_at, updated_at
)
SELECT
  a.id,
  lower(a.slug),
  'frontier_product',
  CASE
    WHEN a.commercial_modes && ARRAY['full_acquisition','exclusive_acquisition']::text[] THEN 'available_for_acquisition'
    WHEN a.commercial_modes && ARRAY['hosted_license','exclusive_license','non_exclusive_license']::text[] THEN 'available_for_licensing'
    WHEN a.commercial_modes && ARRAY['white_label','custom_completion','custom_deployment']::text[] THEN 'available_for_customization'
    WHEN a.commercial_modes && ARRAY['strategic_partnership']::text[] THEN 'partnership_available'
    ELSE 'not_currently_available'
  END,
  a.visibility,
  COALESCE(NULLIF(a.solution_summary, ''), a.description),
  a.client_problem,
  to_jsonb(COALESCE(a.challenges, '{}'::text[])),
  CASE WHEN cardinality(COALESCE(a.responsibilities, '{}'::text[])) > 0
    THEN array_to_string(a.responsibilities, E'\n') ELSE NULL END,
  to_jsonb(COALESCE(a.features, '{}'::text[])),
  CASE
    WHEN a.technology_stack IS NOT NULL AND a.technology_stack <> '{}'::jsonb THEN a.technology_stack
    WHEN cardinality(COALESCE(a.technologies, '{}'::text[])) > 0 THEN jsonb_build_object('Recorded technologies', to_jsonb(a.technologies))
    ELSE '{}'::jsonb
  END,
  COALESCE(a.development_status, a.lifecycle, a.status),
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', gen_random_uuid()::text,
      'title', 'Published application screenshot ' || media.ordinality,
      'description', '',
      'type', 'screenshot',
      'sourceUrl', media.url,
      'date', NULL,
      'status', 'approved_for_publication',
      'attribution', NULL,
      'clientAttribution', NULL,
      'externalUrl', NULL,
      'publicationPermission', TRUE,
      'verificationState', 'verified'
    ) ORDER BY media.ordinality)
    FROM unnest(COALESCE(a.screenshot_urls, '{}'::text[])) WITH ORDINALITY AS media(url, ordinality)
  ), '[]'::jsonb)
  || CASE WHEN a.video_url IS NOT NULL THEN jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text, 'title', 'Published project video',
    'description', '', 'type', 'project_video', 'sourceUrl', a.video_url,
    'date', NULL, 'status', 'approved_for_publication', 'attribution', NULL,
    'clientAttribution', NULL, 'externalUrl', NULL,
    'publicationPermission', TRUE, 'verificationState', 'verified'
  )) ELSE '[]'::jsonb END
  || COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', gen_random_uuid()::text,
      'title', COALESCE(NULLIF(outcome.item->>'label', ''), 'Verified outcome'),
      'description', concat_ws(' — ', NULLIF(outcome.item->>'value', ''), outcome.item->>'evidenceNote'),
      'type', 'business_result', 'sourceUrl', NULL, 'date', NULL,
      'status', 'approved_for_publication', 'attribution', 'Existing published application record',
      'clientAttribution', NULL, 'externalUrl', NULL,
      'publicationPermission', TRUE, 'verificationState', 'verified'
    ) ORDER BY outcome.ordinality)
    FROM jsonb_array_elements(COALESCE(a.outcomes, '[]'::jsonb)) WITH ORDINALITY AS outcome(item, ordinality)
    WHERE NULLIF(outcome.item->>'evidenceNote', '') IS NOT NULL
  ), '[]'::jsonb),
  a.published_at,
  a.created_at,
  a.updated_at
FROM public.apps a
WHERE a.show_in_projects = TRUE
  AND a.slug IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.case_studies c WHERE c.slug = lower(a.slug)
  )
ON CONFLICT DO NOTHING;

COMMIT;
