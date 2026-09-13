BEGIN;

CREATE TABLE IF NOT EXISTS public.monitoring_whatsapp_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.monitoring_events(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','retry','accepted','sent','delivered','read','failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  lease_token uuid,
  provider_id text,
  last_error text,
  accepted_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS monitoring_whatsapp_provider_id
  ON public.monitoring_whatsapp_deliveries(provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS monitoring_whatsapp_delivery_due
  ON public.monitoring_whatsapp_deliveries(status,next_attempt_at);

ALTER TABLE public.monitoring_whatsapp_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.monitoring_whatsapp_deliveries FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.monitoring_whatsapp_deliveries TO service_role;

CREATE OR REPLACE FUNCTION public.monitoring_whatsapp_reconcile()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  INSERT INTO monitoring_whatsapp_deliveries(event_id)
  SELECT e.id
  FROM monitoring_events e
  JOIN monitoring_settings s ON s.id=true
  WHERE e.created_at >= greatest(s.started_at,now()-interval '24 hours')
    AND e.kind IN ('enquiry_saved','incident','recovery','security','test','visitor_arrival','summary')
  ON CONFLICT(event_id) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION public.monitoring_whatsapp_claim()
RETURNS TABLE (
  delivery_id uuid,event_id uuid,lease_token uuid,attempts integer,
  subject text,details jsonb,record_type text,record_id text,created_at timestamptz,is_test boolean
) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE monitoring_whatsapp_deliveries
  SET status='failed',last_error='WhatsApp lease expired after the final attempt.',lease_until=NULL,updated_at=now()
  WHERE status='sending' AND lease_until<now() AND attempts>=6;

  UPDATE monitoring_whatsapp_deliveries
  SET status='failed',last_error='WhatsApp delivery remained uncertain for 24 hours.',lease_until=NULL,updated_at=now()
  WHERE status IN ('retry','sending') AND created_at<now()-interval '24 hours';

  RETURN QUERY
  WITH claimed AS (
    SELECT d.id
    FROM monitoring_whatsapp_deliveries d
    WHERE (d.status IN ('pending','retry') OR (d.status='sending' AND d.lease_until<now()))
      AND d.next_attempt_at<=now() AND d.attempts<6
    ORDER BY d.created_at
    FOR UPDATE SKIP LOCKED LIMIT 1
  ), updated AS (
    UPDATE monitoring_whatsapp_deliveries d
    SET status='sending',lease_until=now()+interval '2 minutes',lease_token=gen_random_uuid(),attempts=d.attempts+1,updated_at=now()
    FROM claimed c WHERE d.id=c.id
    RETURNING d.*
  )
  SELECT u.id,u.event_id,u.lease_token,u.attempts,e.subject,e.details,e.record_type,e.record_id,e.created_at,e.is_test
  FROM updated u JOIN monitoring_events e ON e.id=u.event_id;
END $$;

REVOKE ALL ON FUNCTION public.monitoring_whatsapp_reconcile(),public.monitoring_whatsapp_claim() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.monitoring_whatsapp_reconcile(),public.monitoring_whatsapp_claim() TO service_role;

COMMIT;
