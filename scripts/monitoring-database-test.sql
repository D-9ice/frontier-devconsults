-- LABELLED TEST ONLY. Run with the monitoring migration inside the same rollback transaction.
DO $$
DECLARE test_id text; event_id uuid; n integer; claimed public.monitoring_events;
BEGIN
 INSERT INTO public.contact_submissions(name,email,message) VALUES('[MONITORING TEST] rollback enquiry','monitoring-test@example.com','Test only; rolled back, never a customer request') RETURNING id::text INTO test_id;
 SELECT id INTO event_id FROM public.monitoring_events WHERE event_key='saved:contact_submissions:'||test_id;
 IF event_id IS NULL THEN RAISE EXCEPTION 'Saved enquiry did not enqueue'; END IF;
 PERFORM public.monitoring_reconcile();
 SELECT count(*) INTO n FROM public.monitoring_events WHERE event_key='saved:contact_submissions:'||test_id;
 IF n<>1 THEN RAISE EXCEPTION 'Duplicate event'; END IF;
 IF NOT public.monitoring_allow('labelled-rollback-test',1,60) OR public.monitoring_allow('labelled-rollback-test',1,60) THEN RAISE EXCEPTION 'Rate limit failed'; END IF;
 SELECT * INTO claimed FROM public.monitoring_claim();
 IF claimed.id<>event_id OR claimed.attempts<>1 THEN RAISE EXCEPTION 'Queue claim failed'; END IF;
 UPDATE public.monitoring_events SET status='retry',next_attempt_at=now() WHERE id=event_id;
 SELECT * INTO claimed FROM public.monitoring_claim();
 IF claimed.id<>event_id OR claimed.attempts<>2 THEN RAISE EXCEPTION 'Retry claim failed'; END IF;
 IF has_table_privilege('anon','public.monitoring_events','SELECT') OR has_table_privilege('authenticated','public.monitoring_events','SELECT') OR has_function_privilege('anon','public.monitoring_claim()','EXECUTE') THEN RAISE EXCEPTION 'Unauthorized database access'; END IF;
END $$;
