BEGIN;

-- Security/audit records share the protected monitoring queue. Browser roles remain denied.
CREATE INDEX IF NOT EXISTS monitoring_security_time
  ON public.monitoring_events (created_at DESC)
  WHERE kind = 'security';

-- Enquiry alerts retain only the fields needed for owner notification and follow-up.
-- Full authoritative records remain in their RLS-protected business tables.
CREATE OR REPLACE FUNCTION public.monitoring_enquiry_saved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb:=to_jsonb(NEW); typ text; alert_details jsonb;
BEGIN
 typ:=CASE TG_TABLE_NAME WHEN 'contact_submissions' THEN 'contact' WHEN 'build_requests' THEN 'build' WHEN 'application_acquisition_requests' THEN 'acquisition' ELSE 'specialized' END;
 alert_details:=CASE typ
  WHEN 'contact' THEN jsonb_build_object('name',r->'name','email',r->'email','phone',r->'phone','message',r->'message')
  WHEN 'build' THEN jsonb_build_object('name',r->'name','email',r->'email','phone',r->'phone','company',r->'company','project_type',r->'project_type','budget',r->'budget','timeline',r->'timeline','description',r->'description','features',r->'features','reference_links',r->'reference_links')
  WHEN 'acquisition' THEN jsonb_build_object('reference_number',r->'reference_number','product_name',r->'product_name','buyer_full_name',r->'buyer_full_name','buyer_company',r->'buyer_company','buyer_email',r->'buyer_email','buyer_country',r->'buyer_country','acquisition_type',r->'acquisition_type','acquisition_timeline',r->'acquisition_timeline')
  ELSE jsonb_build_object('reference_number',r->'reference_number','full_name',r->'full_name','email',r->'email','company',r->'company','country',r->'country','project_types',r->'project_types','project_description',r->'project_description','timeline',r->'timeline')
 END;
 INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,is_test)
 VALUES('saved:'||TG_TABLE_NAME||':'||(r->>'id'),'enquiry_saved','New '||typ||' enquiry',jsonb_strip_nulls(alert_details),typ,r->>'id',coalesce(r->>'name',r->>'buyer_full_name',r->>'full_name','') LIKE '[MONITORING TEST]%')
 ON CONFLICT(event_key) DO NOTHING;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 RAISE WARNING 'monitoring enqueue failed for %',TG_TABLE_NAME;
 RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.monitoring_reconcile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE started timestamptz;
BEGIN
 SELECT started_at INTO started FROM monitoring_settings WHERE id=true;
 INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,created_at,is_test)
 SELECT 'saved:contact_submissions:'||r.id,'enquiry_saved','New contact enquiry',jsonb_strip_nulls(jsonb_build_object('name',r.name,'email',r.email,'phone',r.phone,'message',r.message)),'contact',r.id::text,r.created_at,r.name LIKE '[MONITORING TEST]%'
 FROM contact_submissions r WHERE r.created_at>=started ON CONFLICT(event_key) DO NOTHING;
 INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,created_at,is_test)
 SELECT 'saved:build_requests:'||r.id,'enquiry_saved','New build enquiry',jsonb_strip_nulls(jsonb_build_object('name',r.name,'email',r.email,'phone',r.phone,'company',r.company,'project_type',r.project_type,'budget',r.budget,'timeline',r.timeline,'description',r.description,'features',r.features,'reference_links',r.reference_links)),'build',r.id::text,r.created_at,r.name LIKE '[MONITORING TEST]%'
 FROM build_requests r WHERE r.created_at>=started ON CONFLICT(event_key) DO NOTHING;
 INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,created_at,is_test)
 SELECT 'saved:application_acquisition_requests:'||r.id,'enquiry_saved','New acquisition enquiry',jsonb_strip_nulls(jsonb_build_object('reference_number',r.reference_number,'product_name',r.product_name,'buyer_full_name',r.buyer_full_name,'buyer_company',r.buyer_company,'buyer_email',r.buyer_email,'buyer_country',r.buyer_country,'acquisition_type',r.acquisition_type,'acquisition_timeline',r.acquisition_timeline)),'acquisition',r.id::text,r.created_at,r.buyer_full_name LIKE '[MONITORING TEST]%'
 FROM application_acquisition_requests r WHERE r.created_at>=started ON CONFLICT(event_key) DO NOTHING;
 INSERT INTO monitoring_events(event_key,kind,subject,details,record_type,record_id,created_at,is_test)
 SELECT 'saved:specialized_engineering_requests:'||r.id,'enquiry_saved','New specialized enquiry',jsonb_strip_nulls(jsonb_build_object('reference_number',r.reference_number,'full_name',r.full_name,'email',r.email,'company',r.company,'country',r.country,'project_types',r.project_types,'project_description',r.project_description,'timeline',r.timeline)),'specialized',r.id::text,r.created_at,r.full_name LIKE '[MONITORING TEST]%'
 FROM specialized_engineering_requests r WHERE r.created_at>=started ON CONFLICT(event_key) DO NOTHING;
END $$;

REVOKE ALL ON FUNCTION public.monitoring_enquiry_saved(), public.monitoring_reconcile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.monitoring_reconcile() TO service_role;

COMMIT;
