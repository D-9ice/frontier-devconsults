-- Digital product marketplace and formal acquisition workflow.
-- All changes are additive. Existing application records and submissions remain intact.
BEGIN;

ALTER TABLE apps ADD COLUMN IF NOT EXISTS tagline VARCHAR(240);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS development_status VARCHAR(40);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS completion_percentage INTEGER;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS roadmap_items TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS technology_stack JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS seo_title VARCHAR(160);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS seo_description VARCHAR(320);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);

ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_development_status_check;
ALTER TABLE apps ADD CONSTRAINT apps_development_status_check CHECK (
  development_status IS NULL OR development_status IN (
    'concept_research', 'early_development', 'in_development',
    'acquisition_preview', 'beta_pre_launch', 'production_ready',
    'live', 'maintenance_expansion'
  )
);
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_completion_percentage_check;
ALTER TABLE apps ADD CONSTRAINT apps_completion_percentage_check CHECK (
  completion_percentage IS NULL OR completion_percentage BETWEEN 0 AND 100
);

CREATE TABLE IF NOT EXISTS application_acquisition_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number VARCHAR(40) NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES apps(id) ON DELETE RESTRICT,
  product_slug VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  buyer_full_name VARCHAR(200) NOT NULL,
  buyer_company VARCHAR(240) NOT NULL,
  buyer_email VARCHAR(320) NOT NULL,
  buyer_phone VARCHAR(80),
  buyer_country VARCHAR(120) NOT NULL,
  buyer_website VARCHAR(500),
  buyer_role VARCHAR(160),
  buyer_type VARCHAR(48) NOT NULL,
  acquisition_type VARCHAR(64) NOT NULL,
  intended_use TEXT NOT NULL,
  deployment_market VARCHAR(240) NOT NULL,
  source_code_transfer VARCHAR(24) NOT NULL,
  ip_branding_transfer VARCHAR(24) NOT NULL,
  completion_requirement VARCHAR(64) NOT NULL,
  additional_development_requirements TEXT,
  support_requirement VARCHAR(32) NOT NULL,
  budget_range VARCHAR(64),
  acquisition_timeline VARCHAR(40) NOT NULL,
  additional_requirements TEXT,
  legal_acknowledged BOOLEAN NOT NULL,
  privacy_acknowledged BOOLEAN NOT NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'acquisition_initiated',
  internal_notes TEXT NOT NULL DEFAULT '',
  assigned_follow_up VARCHAR(200),
  buyer_qualification VARCHAR(40) NOT NULL DEFAULT 'not_reviewed',
  nda_status VARCHAR(40) NOT NULL DEFAULT 'not_required',
  demo_status VARCHAR(40) NOT NULL DEFAULT 'not_scheduled',
  negotiation_status VARCHAR(40) NOT NULL DEFAULT 'not_started',
  utm_source VARCHAR(240),
  utm_medium VARCHAR(240),
  utm_campaign VARCHAR(240),
  utm_content VARCHAR(240),
  utm_term VARCHAR(240),
  referrer VARCHAR(1000),
  landing_page VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_status_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_status_check CHECK (status IN (
  'acquisition_initiated', 'under_review', 'buyer_qualification', 'awaiting_buyer_information',
  'nda_required', 'nda_completed', 'private_demo_scheduled', 'technical_due_diligence',
  'commercial_negotiation', 'agreement_preparation', 'agreement_pending_signature', 'payment_pending',
  'development_completion', 'handover_preparation', 'acquisition_completed', 'declined', 'withdrawn', 'closed'
));
ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_buyer_type_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_buyer_type_check CHECK (buyer_type IN (
  'individual_entrepreneur', 'company', 'investor', 'software_agency', 'startup', 'institution',
  'government_public_organization', 'ngo_nonprofit', 'other'
));
ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_acquisition_type_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_acquisition_type_check CHECK (acquisition_type IN (
  'full_application_acquisition', 'exclusive_commercial_license', 'non_exclusive_commercial_license',
  'white_label_acquisition', 'strategic_partnership', 'custom_deployment', 'unsure_guidance'
));
ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_transfer_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_transfer_check CHECK (
  source_code_transfer IN ('yes', 'no', 'need_guidance') AND ip_branding_transfer IN ('yes', 'no', 'need_guidance')
);
ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_completion_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_completion_check CHECK (completion_requirement IN (
  'complete_before_handover', 'complete_to_requirements', 'acquire_current_state', 'technical_consultation'
));
ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_support_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_support_check CHECK (support_requirement IN ('yes', 'no', 'possibly', 'need_support_options'));
ALTER TABLE application_acquisition_requests DROP CONSTRAINT IF EXISTS acquisition_requests_timeline_check;
ALTER TABLE application_acquisition_requests ADD CONSTRAINT acquisition_requests_timeline_check CHECK (acquisition_timeline IN ('immediately', 'within_30_days', '1_3_months', '3_6_months', 'exploring_options', 'flexible'));

ALTER TABLE application_acquisition_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS acquisition_requests_admin_inbox
  ON application_acquisition_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS acquisition_requests_product
  ON application_acquisition_requests(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS acquisition_requests_country
  ON application_acquisition_requests(buyer_country, created_at DESC);

CREATE TABLE IF NOT EXISTS commercial_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(80) NOT NULL,
  product_slug VARCHAR(255),
  page_path VARCHAR(1000) NOT NULL,
  referrer VARCHAR(1000),
  utm_source VARCHAR(240),
  utm_medium VARCHAR(240),
  utm_campaign VARCHAR(240),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE commercial_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS commercial_events_reporting
  ON commercial_events(event_name, created_at DESC);

COMMIT;
