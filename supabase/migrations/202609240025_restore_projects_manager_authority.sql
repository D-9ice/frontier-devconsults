-- Restore the intended admin boundary:
-- Projects Manager owns Projects & Case Studies.
-- App Store Manager owns Digital Products & Acquisition Opportunities.
BEGIN;

-- Promote the approved portfolio candidates into the Projects Manager dataset
-- using existing application metadata where it is already available.
INSERT INTO public.projects (
  title, slug, category, status, visibility, featured, sort_order,
  description, technologies, features, logo_url, gallery_urls,
  live_link, download_link, color, published_at, updated_at
)
SELECT
  a.name,
  lower(replace(a.slug, '_', '-')),
  a.category,
  CASE WHEN a.lifecycle = 'live' THEN 'Production' ELSE 'Development' END,
  'published',
  TRUE,
  CASE a.slug
    WHEN 'g-tube' THEN 4
    WHEN 'fine-health' THEN 5
    WHEN 'premium-space' THEN 7
    WHEN 'c-zan-guest-house' THEN 8
    ELSE 50
  END,
  a.description,
  COALESCE(a.technologies, '{}'::text[]),
  COALESCE(a.features, '{}'::text[]),
  a.icon_url,
  COALESCE(a.screenshot_urls, '{}'::text[]),
  a.demo_url,
  a.download_link,
  CASE a.slug
    WHEN 'g-tube' THEN 'red'
    WHEN 'fine-health' THEN 'green'
    WHEN 'premium-space' THEN 'purple'
    WHEN 'c-zan-guest-house' THEN 'orange'
    ELSE 'blue'
  END,
  NOW(),
  NOW()
FROM public.apps a
WHERE a.slug IN ('g-tube', 'fine-health', 'premium-space', 'c-zan-guest-house')
  AND NOT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE lower(replace(p.slug, '_', '-')) = lower(replace(a.slug, '_', '-'))
  );

-- Afri-Tube is an approved portfolio project but is not an App Store dependency.
INSERT INTO public.projects (
  title, slug, category, status, visibility, featured, sort_order,
  description, technologies, features, logo_url, gallery_urls,
  live_link, download_link, color, published_at, updated_at
)
SELECT
  'Afri-Tube',
  'afri-tube',
  'Video / Commerce Platform',
  'Development',
  'published',
  TRUE,
  6,
  'Afri-Tube is an Africa-focused video and commerce platform in development, designed around country, regional and local content discovery, creator publishing, business advertising and a commerce layer that can connect audiences with real-world businesses and stores across the continent.',
  '{}'::text[],
  ARRAY[
    'Africa-wide video content discovery',
    'Country and regional content navigation',
    'Creator publishing and audience engagement',
    'Business advertising workflows',
    'Commerce and store discovery',
    'Location-aware business discovery',
    'Administrative and moderation controls',
    'Mobile-responsive experience'
  ]::text[],
  NULL,
  '{}'::text[],
  NULL,
  NULL,
  'yellow',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects
  WHERE lower(replace(slug, '_', '-')) = 'afri-tube'
);

-- Remove only Case Study publication records that are not in the owner-approved
-- portfolio set. App Store records are deliberately untouched.
DELETE FROM public.case_studies
WHERE slug NOT IN (
  'bethel-for-ethel-foundation',
  'busibazaar',
  'lotto-forecaster-ai',
  'macsunny-electronics',
  'g-tube',
  'fine-health',
  'afri-tube',
  'premium-space',
  'c-zan-guest-house'
);

-- Re-link every retained case study to its Projects Manager record.
UPDATE public.case_studies c
SET
  project_id = p.id,
  app_id = NULL,
  visibility = p.visibility,
  updated_at = NOW()
FROM public.projects p
WHERE c.slug IN (
  'bethel-for-ethel-foundation',
  'busibazaar',
  'lotto-forecaster-ai',
  'macsunny-electronics',
  'g-tube',
  'fine-health',
  'afri-tube',
  'premium-space',
  'c-zan-guest-house'
)
  AND lower(replace(p.slug, '_', '-')) = c.slug;

-- Correct public ownership labels for Frontier-owned products while keeping
-- client/non-commercial work separate from acquisition controls.
UPDATE public.case_studies
SET ownership_type = 'frontier_product',
    commercial_state = 'not_currently_available',
    client_commercial_authorized = FALSE,
    updated_at = NOW()
WHERE slug IN (
  'busibazaar',
  'lotto-forecaster-ai',
  'g-tube',
  'fine-health',
  'afri-tube',
  'premium-space'
);

UPDATE public.case_studies
SET ownership_type = 'client_project',
    commercial_state = 'not_for_sale',
    client_commercial_authorized = FALSE,
    updated_at = NOW()
WHERE slug IN (
  'bethel-for-ethel-foundation',
  'macsunny-electronics',
  'c-zan-guest-house'
);

-- Create a conservative case-study shell for approved projects that do not yet
-- have a detailed record. Projects Manager remains the source of truth.
INSERT INTO public.case_studies (
  project_id, app_id, slug, ownership_type, commercial_state,
  client_commercial_authorized, visibility, executive_summary,
  capabilities, technology_architecture, project_status,
  evidence, section_order, published_at, created_at, updated_at
)
SELECT
  p.id,
  NULL,
  lower(replace(p.slug, '_', '-')),
  CASE
    WHEN lower(replace(p.slug, '_', '-')) IN ('afri-tube', 'premium-space') THEN 'frontier_product'
    ELSE 'client_project'
  END,
  CASE
    WHEN lower(replace(p.slug, '_', '-')) IN ('afri-tube', 'premium-space') THEN 'not_currently_available'
    ELSE 'not_for_sale'
  END,
  FALSE,
  p.visibility,
  p.description,
  to_jsonb(p.features),
  CASE WHEN cardinality(p.technologies) > 0
    THEN jsonb_build_object('Recorded technologies', to_jsonb(p.technologies))
    ELSE '{}'::jsonb
  END,
  p.status,
  '[]'::jsonb,
  '["overview","problem","objectives","challenges","approach","architecture","decisions","capabilities","solutions","security","performance","ux","technology","gallery","results","status","insights"]'::jsonb,
  CASE WHEN p.visibility = 'published' THEN COALESCE(p.published_at, NOW()) ELSE NULL END,
  COALESCE(p.created_at, NOW()),
  NOW()
FROM public.projects p
WHERE lower(replace(p.slug, '_', '-')) IN (
  'bethel-for-ethel-foundation',
  'busibazaar',
  'lotto-forecaster-ai',
  'macsunny-electronics',
  'g-tube',
  'fine-health',
  'afri-tube',
  'premium-space',
  'c-zan-guest-house'
)
  AND NOT EXISTS (
    SELECT 1
    FROM public.case_studies c
    WHERE c.slug = lower(replace(p.slug, '_', '-'))
  );

-- Enforce the manager boundary at the database layer.
ALTER TABLE public.case_studies
  DROP CONSTRAINT IF EXISTS case_studies_projects_manager_only;

ALTER TABLE public.case_studies
  ADD CONSTRAINT case_studies_projects_manager_only
  CHECK (project_id IS NOT NULL AND app_id IS NULL);

COMMIT;
