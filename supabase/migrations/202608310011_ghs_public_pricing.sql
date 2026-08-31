-- Public website pricing is displayed only in Ghana cedis. Preserve all owner-maintained
-- packages and service amounts while updating the conversion metadata used to calculate
-- their GHS planning estimates.
UPDATE pricing_settings
SET
  settings = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(settings, '{exchangeRate}', '11.25'::jsonb, true),
            '{currencyCode}', '"GHS"'::jsonb, true
          ),
          '{currencySymbol}', '"GH₵"'::jsonb, true
        ),
        '{exchangeRateEffectiveAt}', '"2026-08-28T00:00:00.000Z"'::jsonb, true
      ),
      '{exchangeRateSourceLabel}', '"Bank of Ghana daily interbank mid-rate"'::jsonb, true
    ),
    '{note}', '"All Ghana cedi prices are planning estimates. Final cost depends on the confirmed project scope and requirements."'::jsonb, true
  ) || jsonb_build_object('updatedAt', '2026-08-31T00:00:00.000Z'),
  updated_at = NOW()
WHERE key = 'default';
