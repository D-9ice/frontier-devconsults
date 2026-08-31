-- Additive public-presentation metadata. Existing upload fields and records remain valid.
ALTER TABLE apps ADD COLUMN IF NOT EXISTS solution_kind VARCHAR(40) NOT NULL DEFAULT 'other';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS availability VARCHAR(24) NOT NULL DEFAULT 'by_enquiry';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS primary_action VARCHAR(24) NOT NULL DEFAULT 'automatic';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS show_in_projects BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS show_in_upwork_portfolio BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS show_in_products BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS commercial_modes TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS starting_price_usd_minor BIGINT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS price_visibility VARCHAR(16) NOT NULL DEFAULT 'enquire';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS demo_url VARCHAR(500);
ALTER TABLE apps ADD COLUMN IF NOT EXISTS technologies TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS client_problem TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS solution_summary TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS responsibilities TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS challenges TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS outcomes JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS confidentiality_note TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS deployment_options TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS support_summary TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS customization_available BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS license_terms_url VARCHAR(500);

ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_solution_kind_check;
ALTER TABLE apps ADD CONSTRAINT apps_solution_kind_check CHECK (solution_kind IN ('mobile_application','web_application','website','ai_platform','engineering_solution','engineering_service','client_project','other'));
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_availability_check;
ALTER TABLE apps ADD CONSTRAINT apps_availability_check CHECK (availability IN ('available','coming_soon','by_enquiry','unavailable'));
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_primary_action_check;
ALTER TABLE apps ADD CONSTRAINT apps_primary_action_check CHECK (primary_action IN ('automatic','download','visit_live','view_details','request_demo','request_quote','join_waitlist','none'));
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_price_visibility_check;
ALTER TABLE apps ADD CONSTRAINT apps_price_visibility_check CHECK (price_visibility IN ('show','from','enquire'));
ALTER TABLE apps DROP CONSTRAINT IF EXISTS apps_starting_price_check;
ALTER TABLE apps ADD CONSTRAINT apps_starting_price_check CHECK (starting_price_usd_minor IS NULL OR starting_price_usd_minor >= 0);

CREATE INDEX IF NOT EXISTS apps_public_surfaces ON apps(visibility, show_in_projects, show_in_products, show_in_upwork_portfolio, sort_order);

-- Rollback: revert application code first. These additive nullable/defaulted columns can remain
-- safely unused; dropping them later would delete owner-entered metadata and requires approval.
