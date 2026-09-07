-- Dedicated Custom Specialized Solutions technical-intake workflow.
BEGIN;

CREATE TABLE IF NOT EXISTS specialized_engineering_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number VARCHAR(64) NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  country VARCHAR(120) NOT NULL,
  company VARCHAR(240),
  phone VARCHAR(80),
  website VARCHAR(500),
  job_title VARCHAR(160),
  project_types TEXT[] NOT NULL,
  current_system_state TEXT[] NOT NULL DEFAULT '{}',
  project_description TEXT NOT NULL,
  equipment_type VARCHAR(240),
  operating_voltage VARCHAR(120),
  power_level VARCHAR(120),
  motor_type VARCHAR(160),
  battery_type VARCHAR(160),
  existing_controller VARCHAR(240),
  existing_communication_interface VARCHAR(240),
  sensor_count VARCHAR(80),
  device_count VARCHAR(80),
  environment VARCHAR(500),
  control_requirements TEXT[] NOT NULL DEFAULT '{}',
  monitoring_requirements TEXT[] NOT NULL DEFAULT '{}',
  interface_requirements TEXT[] NOT NULL DEFAULT '{}',
  connectivity_requirements TEXT[] NOT NULL DEFAULT '{}',
  development_scope TEXT[] NOT NULL DEFAULT '{}',
  timeline VARCHAR(40),
  budget_range VARCHAR(64),
  additional_information TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  privacy_acknowledged BOOLEAN NOT NULL,
  status VARCHAR(48) NOT NULL DEFAULT 'new',
  internal_notes TEXT NOT NULL DEFAULT '',
  assigned_follow_up VARCHAR(200),
  feasibility_status VARCHAR(40) NOT NULL DEFAULT 'not_reviewed',
  consultation_status VARCHAR(40) NOT NULL DEFAULT 'not_requested',
  utm_source VARCHAR(240),
  utm_medium VARCHAR(240),
  utm_campaign VARCHAR(240),
  utm_content VARCHAR(240),
  utm_term VARCHAR(240),
  referrer VARCHAR(1000),
  landing_page VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT specialized_project_types_required CHECK (cardinality(project_types) > 0),
  CONSTRAINT specialized_attachments_array CHECK (jsonb_typeof(attachments) = 'array'),
  CONSTRAINT specialized_privacy_required CHECK (privacy_acknowledged = TRUE)
);

ALTER TABLE specialized_engineering_requests DROP CONSTRAINT IF EXISTS specialized_request_status_check;
ALTER TABLE specialized_engineering_requests ADD CONSTRAINT specialized_request_status_check CHECK (status IN (
  'new', 'under_review', 'technical_assessment', 'clarification_required',
  'consultation_scheduled', 'feasibility_review', 'proposal_preparation', 'proposal_sent',
  'negotiation', 'approved', 'development', 'deployment', 'completed', 'declined', 'archived'
));
ALTER TABLE specialized_engineering_requests DROP CONSTRAINT IF EXISTS specialized_feasibility_status_check;
ALTER TABLE specialized_engineering_requests ADD CONSTRAINT specialized_feasibility_status_check CHECK (feasibility_status IN ('not_reviewed', 'feasible', 'needs_assessment', 'not_feasible'));
ALTER TABLE specialized_engineering_requests DROP CONSTRAINT IF EXISTS specialized_consultation_status_check;
ALTER TABLE specialized_engineering_requests ADD CONSTRAINT specialized_consultation_status_check CHECK (consultation_status IN ('not_requested', 'requested', 'scheduled', 'completed'));

ALTER TABLE specialized_engineering_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS specialized_requests_created_at ON specialized_engineering_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS specialized_requests_status ON specialized_engineering_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS specialized_requests_country ON specialized_engineering_requests(country, created_at DESC);
CREATE INDEX IF NOT EXISTS specialized_requests_project_types ON specialized_engineering_requests USING GIN(project_types);

COMMIT;
