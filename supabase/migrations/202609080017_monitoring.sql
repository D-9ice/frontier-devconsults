BEGIN;
CREATE TABLE IF NOT EXISTS public.monitoring_settings (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), visitor_alerts boolean NOT NULL DEFAULT false,
 summary_enabled boolean NOT NULL DEFAULT false, summary_hour integer NOT NULL DEFAULT 8 CHECK(summary_hour BETWEEN 0 AND 23),
 updated_at timestamptz NOT NULL DEFAULT now(), started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.monitoring_settings(id) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.monitoring_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_key text UNIQUE NOT NULL, kind text NOT NULL,
 subject text NOT NULL, details jsonb NOT NULL DEFAULT '{}', record_type text, record_id text,
 created_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'pending',
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_until timestamptz, lease_token uuid, provider_id text, last_error text, delivered_at timestamptz,
 resolved_at timestamptz, is_test boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS monitoring_delivery_due ON public.monitoring_events(status,next_attempt_at);
CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
 id uuid PRIMARY KEY, first_seen timestamptz NOT NULL DEFAULT now(), last_seen timestamptz NOT NULL DEFAULT now(),
 page text NOT NULL, source text, country text, city text, views integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS monitoring_sessions_active ON public.monitoring_sessions(last_seen);
CREATE TABLE IF NOT EXISTS public.monitoring_views (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL, page text NOT NULL,
 source text, country text, city text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS monitoring_views_time ON public.monitoring_views(created_at);
CREATE TABLE IF NOT EXISTS public.monitoring_limits (key text PRIMARY KEY, used integer NOT NULL, expires_at timestamptz NOT NULL);
ALTER TABLE public.monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.monitoring_settings,public.monitoring_events,public.monitoring_sessions,public.monitoring_views,public.monitoring_limits FROM anon,authenticated;
GRANT ALL ON public.monitoring_settings,public.monitoring_events,public.monitoring_sessions,public.monitoring_views,public.monitoring_limits TO service_role;

CREATE OR REPLACE FUNCTION public.monitoring_allow(p_key text,p_max integer,p_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO monitoring_limits(key,used,expires_at) VALUES(p_key,1,now()+make_interval(secs=>p_seconds))
 ON CONFLICT(key) DO UPDATE SET used=CASE WHEN monitoring_limits.expires_at<now() THEN 1 ELSE monitoring_limits.used+1 END,
 expires_at=CASE WHEN monitoring_limits.expires_at<now() THEN now()+make_interval(secs=>p_seconds) ELSE monitoring_limits.expires_at END RETURNING used INTO n;
 RETURN n<=p_max;
END $$;
CREATE OR REPLACE FUNCTION public.monitoring_claim()
RETURNS SETOF public.monitoring_events LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE monitoring_events SET status='failed',last_error='Lease expired after final attempt; inspect provider before manual retry.' WHERE status='sending' AND lease_until<now() AND attempts>=6;
 UPDATE monitoring_events SET status='failed',last_error='Delivery uncertain after 24 hours; inspect provider before manual retry.' WHERE status IN ('retry','sending') AND created_at<now()-interval '24 hours';
 RETURN QUERY UPDATE monitoring_events SET status='sending',lease_until=now()+interval '2 minutes',lease_token=gen_random_uuid(),attempts=attempts+1
 WHERE id=(SELECT id FROM monitoring_events WHERE (status IN ('pending','retry') OR (status='sending' AND lease_until<now())) AND next_attempt_at<=now() AND attempts<6 ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1)
 RETURNING *;
END $$;
CREATE OR REPLACE FUNCTION public.monitoring_enquiry_saved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb:=to_jsonb(NEW); typ text;
BEGIN
 typ:=CASE TG_TABLE_NAME WHEN 'contact_submissions' THEN 'contact' WHEN 'build_requests' THEN 'build' WHEN 'application_acquisition_requests' THEN 'acquisition' ELSE 'specialized' END;
 INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,is_test)
 VALUES('saved:'||TG_TABLE_NAME||':'||(r->>'id'),'enquiry_saved','New '||typ||' enquiry',r-'internal_notes',typ,r->>'id',coalesce(r->>'name',r->>'buyer_full_name',r->>'full_name','') LIKE '[MONITORING TEST]%')
 ON CONFLICT(event_key) DO NOTHING;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 -- Enquiry remains authoritative even if queue storage is unavailable. Worker reconciles missed records.
 RAISE WARNING 'monitoring enqueue failed for %',TG_TABLE_NAME;
 RETURN NEW;
END $$;
CREATE TRIGGER monitoring_contact_saved AFTER INSERT ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.monitoring_enquiry_saved();
CREATE TRIGGER monitoring_build_saved AFTER INSERT ON public.build_requests FOR EACH ROW EXECUTE FUNCTION public.monitoring_enquiry_saved();
CREATE TRIGGER monitoring_acquisition_saved AFTER INSERT ON public.application_acquisition_requests FOR EACH ROW EXECUTE FUNCTION public.monitoring_enquiry_saved();
CREATE TRIGGER monitoring_specialized_saved AFTER INSERT ON public.specialized_engineering_requests FOR EACH ROW EXECUTE FUNCTION public.monitoring_enquiry_saved();
REVOKE ALL ON FUNCTION public.monitoring_allow(text,integer,integer),public.monitoring_claim(),public.monitoring_enquiry_saved() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.monitoring_allow(text,integer,integer),public.monitoring_claim() TO service_role;
CREATE OR REPLACE FUNCTION public.monitoring_reconcile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE tbl text; typ text; started timestamptz;
BEGIN
 SELECT started_at INTO started FROM monitoring_settings WHERE id=true;
 FOREACH tbl IN ARRAY ARRAY['contact_submissions','build_requests','application_acquisition_requests','specialized_engineering_requests'] LOOP
  typ:=CASE tbl WHEN 'contact_submissions' THEN 'contact' WHEN 'build_requests' THEN 'build' WHEN 'application_acquisition_requests' THEN 'acquisition' ELSE 'specialized' END;
  EXECUTE format('INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,created_at,is_test)
   SELECT ''saved:''||$1||'':''||r.id::text,''enquiry_saved'',''New ''||$2||'' enquiry'',to_jsonb(r)-''internal_notes'',$2,r.id::text,r.created_at,
   coalesce(to_jsonb(r)->>''name'',to_jsonb(r)->>''buyer_full_name'',to_jsonb(r)->>''full_name'','''') LIKE ''[MONITORING TEST]%%''
   FROM %I r WHERE r.created_at >= $3 AND NOT EXISTS(SELECT 1 FROM monitoring_events e WHERE e.event_key=''saved:''||$1||'':''||r.id::text)
   ORDER BY r.created_at LIMIT 100 ON CONFLICT(event_key) DO NOTHING',tbl) USING tbl,typ,started;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.monitoring_reconcile() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.monitoring_reconcile() TO service_role;
COMMIT;
