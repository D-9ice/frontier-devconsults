BEGIN;

-- The signed Android release exposes both values independently. Keeping them as
-- structured fields prevents a filename, build number, and public version from
-- drifting apart again.
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_build INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS artifact_filename VARCHAR(255);
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_artifact_build_check;
ALTER TABLE apps ADD CONSTRAINT apps_artifact_build_check CHECK (artifact_build IS NULL OR artifact_build > 0);

-- Owner-approved, evidence-backed Upwork case study: Lotto Forecaster AI.
UPDATE apps
SET
  version = '1.0.10',
  size = '63,254,638 bytes',
  lifecycle = 'live',
  status = 'Published',
  visibility = 'published',
  published_at = COALESCE(published_at, NOW()),
  solution_kind = 'ai_platform',
  availability = 'available',
  primary_action = 'automatic',
  show_in_upwork_portfolio = TRUE,
  demo_url = NULL,
  play_store_link = NULL,
  download_link = 'https://storage.googleapis.com/lottoforecasterai-android-releases-464754a9/releases/1.0.10-build-11/lotto-forecaster-ai-1.0.10-build-11.apk',
  technologies = ARRAY['Flutter', 'Dart', 'Python', 'FastAPI', 'Supabase', 'PostgreSQL', 'Supabase Edge Functions', 'Machine Learning', 'OCR', 'Docker'],
  client_problem = 'Turning lottery-type-specific historical draw records into reproducible analysis and clearly qualified forecasts requires disciplined data ingestion, isolated datasets, retraining, traceability and responsible presentation.',
  solution_summary = 'Implemented a Flutter Android client and a FastAPI service backed by Supabase. The workflow stages imported CSV and OCR data before commit, keeps each lottery type in an isolated learning context, trains and evaluates forecasting models, and returns ranked candidates with structured reasoning and confidence information.',
  responsibilities = ARRAY[
    'Designed and developed the Flutter Android client for import, preview, analysis and predictor workflows',
    'Implemented FastAPI endpoints for authenticated imports, OCR, staging, commit, analysis and forecast training',
    'Designed the Supabase PostgreSQL data model, row-level security boundaries and supporting Edge Functions',
    'Implemented traceable model artifacts, training manifests, evaluation gates and versioned release controls',
    'Built and verified the signed Android production release'
  ],
  challenges = ARRAY[
    'Keeping unrelated lottery-type histories isolated from one another',
    'Staging and validating imported rows before any committed-data mutation',
    'Presenting probabilistic analysis without implying guaranteed outcomes',
    'Keeping the public release version, build, filename and binary integrity metadata synchronized'
  ],
  outcomes = jsonb_build_array(
    jsonb_build_object(
      'label', 'Verified Android release',
      'value', 'Version 1.0.10, build 11',
      'evidenceNote', 'The signed universal APK reports package com.lottoforecasterai.mobile, version 1.0.10 and build 11.'
    ),
    jsonb_build_object(
      'label', 'Release integrity',
      'value', 'SHA-256 verified',
      'evidenceNote', 'The published 63,254,638-byte APK matches SHA-256 571b6afd99c40ba5e2fafe9ff6ce32b622f4bf46c8f1fbbba783e6dddf80e48e.'
    )
  ),
  upwork_skill_tags = ARRAY['Flutter', 'Dart', 'Python', 'FastAPI', 'Supabase', 'PostgreSQL', 'Machine Learning', 'OCR', 'API Development', 'Android App Development'],
  upwork_relevance = 'Relevant to mobile, full-stack SaaS and responsible AI engagements that require authenticated data workflows, API design, database security, machine-learning pipelines, traceable releases and production validation.',
  artifact_version = '1.0.10',
  artifact_build = 11,
  artifact_filename = 'lotto-forecaster-ai-1.0.10-build-11.apk',
  artifact_platform = 'Android universal signed APK',
  artifact_byte_size = 63254638,
  artifact_release_date = DATE '2026-08-30',
  artifact_checksum = '571b6afd99c40ba5e2fafe9ff6ce32b622f4bf46c8f1fbbba783e6dddf80e48e',
  artifact_verified_at = TIMESTAMPTZ '2026-09-01T00:00:00Z',
  artifact_availability = 'available',
  updated_at = NOW()
WHERE slug = 'lotto-forecaster-ai';

-- Owner-approved, evidence-backed Upwork case study and verified website: BusiBazaar.
UPDATE apps
SET
  lifecycle = 'live',
  status = 'Published',
  visibility = 'published',
  published_at = COALESCE(published_at, NOW()),
  solution_kind = 'web_application',
  availability = 'available',
  primary_action = 'automatic',
  show_in_upwork_portfolio = TRUE,
  demo_url = 'https://busibazaar.com/',
  download_link = NULL,
  play_store_link = NULL,
  external_url_verified_at = TIMESTAMPTZ '2026-09-01T00:00:00Z',
  technologies = ARRAY['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Supabase', 'Vercel', 'Progressive Web App'],
  client_problem = 'Businesses, suppliers, service providers and buyers need a unified marketplace for discovery, digital storefronts, product and service listings, quotation requests and commercial enquiries.',
  solution_summary = 'Implemented a responsive multi-category marketplace with discovery and search, storefront and listing workflows, order and request-for-quotation submission, administration, media management, visitor analytics, protected owner controls and a production deployment path.',
  responsibilities = ARRAY[
    'Designed and implemented the full-stack marketplace experience and responsive public interface',
    'Built product, service, seller, discovery, order and request-for-quotation workflows',
    'Implemented administrative management, media controls, visitor reporting and operational notifications',
    'Added session protection, CSRF controls, rate limiting and owner billing-state enforcement',
    'Configured persistent data and media-provider integration paths for production delivery'
  ],
  challenges = ARRAY[
    'Supporting several business and listing categories through one coherent marketplace experience',
    'Separating public discovery, administrative operations and owner-only controls',
    'Providing durable structured-data and media-storage options suitable for production hosting'
  ],
  outcomes = jsonb_build_array(
    jsonb_build_object(
      'label', 'Production availability',
      'value', 'Live website verified',
      'evidenceNote', 'The public BusiBazaar website returned HTTP 200 on 1 September 2026.'
    ),
    jsonb_build_object(
      'label', 'Delivered scope',
      'value', 'Marketplace and administration workflows',
      'evidenceNote', 'The maintained application includes marketplace discovery, order and quotation workflows, media management and protected administration.'
    )
  ),
  upwork_skill_tags = ARRAY['Next.js', 'React', 'TypeScript', 'Full-Stack Development', 'Web Application', 'Marketplace', 'PostgreSQL', 'Supabase', 'API Integration', 'Progressive Web App'],
  upwork_relevance = 'Relevant to full-stack SaaS, marketplace and e-commerce engagements requiring responsive product experiences, administration, secure operational workflows, persistent data, media handling and cloud delivery.',
  artifact_version = NULL,
  artifact_build = NULL,
  artifact_filename = NULL,
  artifact_platform = NULL,
  artifact_byte_size = NULL,
  artifact_release_date = NULL,
  artifact_checksum = NULL,
  artifact_verified_at = NULL,
  artifact_availability = 'unavailable',
  updated_at = NOW()
WHERE slug = 'busibazaar';

-- Owner-approved live website destinations. Legacy download fields are cleared so
-- website records can never be projected as binary artifacts.
UPDATE apps
SET
  lifecycle = 'live',
  status = 'Published',
  visibility = 'published',
  solution_kind = 'website',
  availability = 'available',
  primary_action = 'automatic',
  demo_url = CASE slug
    WHEN 'macsunny-electronics' THEN 'https://www.macsunny.com/'
    WHEN 'bethel-for-ethel-foundation' THEN 'https://www.bethelforethel.org/'
  END,
  download_link = NULL,
  play_store_link = NULL,
  external_url_verified_at = TIMESTAMPTZ '2026-09-01T00:00:00Z',
  artifact_version = NULL,
  artifact_build = NULL,
  artifact_filename = NULL,
  artifact_platform = NULL,
  artifact_byte_size = NULL,
  artifact_release_date = NULL,
  artifact_checksum = NULL,
  artifact_verified_at = NULL,
  artifact_availability = 'unavailable',
  updated_at = NOW()
WHERE slug IN ('macsunny-electronics', 'bethel-for-ethel-foundation');

-- Owner-approved current Bank of Ghana USD/GHS snapshot. USD remains the source
-- pricing basis and the convenience conversion expires after seven days.
UPDATE pricing_settings
SET
  settings = settings || jsonb_build_object(
    'exchangeRate', 11.2500,
    'currencyCode', 'GHS',
    'currencySymbol', 'GH₵',
    'exchangeRateEffectiveAt', '2026-08-31T00:00:00.000Z',
    'exchangeRateSourceLabel', 'Bank of Ghana Daily Interbank FX Rates (USD/GHS mid rate)',
    'exchangeRateSourceUrl', 'https://www.bog.gov.gh/treasury-and-the-markets/daily-interbank-fx-rates/',
    'exchangeRateApproved', TRUE,
    'exchangeRateMaxAgeDays', 7,
    'note', 'USD amounts are the authoritative planning estimates. GHS amounts are approximate conversions for convenience; final cost depends on the confirmed project scope and requirements.',
    'updatedAt', '2026-09-01T00:00:00.000Z'
  ),
  updated_at = NOW()
WHERE key = 'default';

INSERT INTO pricing_settings_history (settings, action, editor_username)
SELECT settings, 'save', 'owner-approved migration'
FROM pricing_settings
WHERE key = 'default';

COMMIT;
