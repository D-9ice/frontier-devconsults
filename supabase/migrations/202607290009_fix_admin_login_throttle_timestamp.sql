-- Correct the timestamp variable name in the login-attempt function.
-- PostgreSQL treats CURRENT_TIME as a built-in time-with-time-zone expression.

CREATE OR REPLACE FUNCTION begin_admin_login_attempt(p_ip_hash TEXT)
RETURNS TABLE (allowed BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  throttle admin_login_throttles%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := clock_timestamp();
  next_failure_count INTEGER;
  next_lock TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_ip_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid admin login throttle key';
  END IF;

  DELETE FROM admin_login_throttles
  WHERE updated_at < v_now - INTERVAL '24 hours';

  INSERT INTO admin_login_throttles (
    ip_hash,
    failure_count,
    window_started_at,
    updated_at
  )
  VALUES (p_ip_hash, 0, v_now, v_now)
  ON CONFLICT (ip_hash) DO NOTHING;

  SELECT *
  INTO throttle
  FROM admin_login_throttles
  WHERE ip_hash = p_ip_hash
  FOR UPDATE;

  IF throttle.locked_until IS NOT NULL AND throttle.locked_until > v_now THEN
    RETURN QUERY
    SELECT FALSE, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (throttle.locked_until - v_now)))::INTEGER);
    RETURN;
  END IF;

  IF throttle.window_started_at <= v_now - INTERVAL '15 minutes' THEN
    next_failure_count := 1;
  ELSE
    next_failure_count := throttle.failure_count + 1;
  END IF;

  IF next_failure_count >= 5 THEN
    next_lock := v_now + INTERVAL '15 minutes';
  ELSE
    next_lock := NULL;
  END IF;

  UPDATE admin_login_throttles
  SET
    failure_count = next_failure_count,
    window_started_at = CASE
      WHEN throttle.window_started_at <= v_now - INTERVAL '15 minutes' THEN v_now
      ELSE throttle.window_started_at
    END,
    locked_until = next_lock,
    last_attempt_at = v_now,
    updated_at = v_now
  WHERE ip_hash = p_ip_hash;

  -- The current attempt is still allowed. If it succeeds, the route clears this
  -- provisional failure; otherwise retry_after_seconds activates the lockout.
  IF next_lock IS NOT NULL THEN
    RETURN QUERY
    SELECT TRUE, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (next_lock - v_now)))::INTEGER);
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 0;
END;
$$;

REVOKE ALL ON FUNCTION begin_admin_login_attempt(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION begin_admin_login_attempt(TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
