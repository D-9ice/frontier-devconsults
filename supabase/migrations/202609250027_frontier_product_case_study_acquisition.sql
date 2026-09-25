-- Frontier-owned Projects & Case Studies are commercial products.
-- Keep the commercial state editable from Projects Manager -> Case Study Details.
BEGIN;

UPDATE public.case_studies
SET
  commercial_state = 'available_for_acquisition',
  client_commercial_authorized = FALSE,
  updated_at = NOW()
WHERE ownership_type = 'frontier_product'
  AND commercial_state <> 'available_for_acquisition';

COMMIT;
