-- Apply before deploying the matching admin login route.
-- Five failed attempts within 15 minutes lock the client IP for 15 minutes.

CREATE TABLE IF NOT EXISTS admin_login_throttles (
  ip_hash TEXT PRIMARY KEY CHECK (ip_hash ~ '^[a-f0-9]{64}$'),
  failure_count INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  window_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_throttles_updated_at
  ON admin_login_throttles(updated_at);

ALTER TABLE admin_login_throttles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE admin_login_throttles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE admin_login_throttles TO service_role;

CREATE OR REPLACE FUNCTION begin_admin_login_attempt(p_ip_hash TEXT)
RETURNS TABLE (allowed BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  throttle admin_login_throttles%ROWTYPE;
  current_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
  next_failure_count INTEGER;
  next_lock TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_ip_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid admin login throttle key';
  END IF;

  DELETE FROM admin_login_throttles
  WHERE updated_at < current_time - INTERVAL '24 hours';

  INSERT INTO admin_login_throttles (
    ip_hash,
    failure_count,
    window_started_at,
    updated_at
  )
  VALUES (p_ip_hash, 0, current_time, current_time)
  ON CONFLICT (ip_hash) DO NOTHING;

  SELECT *
  INTO throttle
  FROM admin_login_throttles
  WHERE ip_hash = p_ip_hash
  FOR UPDATE;

  IF throttle.locked_until IS NOT NULL AND throttle.locked_until > current_time THEN
    RETURN QUERY
    SELECT FALSE, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (throttle.locked_until - current_time)))::INTEGER);
    RETURN;
  END IF;

  IF throttle.window_started_at <= current_time - INTERVAL '15 minutes' THEN
    next_failure_count := 1;
  ELSE
    next_failure_count := throttle.failure_count + 1;
  END IF;

  IF next_failure_count >= 5 THEN
    next_lock := current_time + INTERVAL '15 minutes';
  ELSE
    next_lock := NULL;
  END IF;

  UPDATE admin_login_throttles
  SET
    failure_count = next_failure_count,
    window_started_at = CASE
      WHEN throttle.window_started_at <= current_time - INTERVAL '15 minutes' THEN current_time
      ELSE throttle.window_started_at
    END,
    locked_until = next_lock,
    last_attempt_at = current_time,
    updated_at = current_time
  WHERE ip_hash = p_ip_hash;

  -- The current attempt is still allowed. If it succeeds, the route clears this
  -- provisional failure; otherwise retry_after_seconds activates the lockout.
  IF next_lock IS NOT NULL THEN
    RETURN QUERY
    SELECT TRUE, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (next_lock - current_time)))::INTEGER);
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 0;
END;
$$;

CREATE OR REPLACE FUNCTION clear_admin_login_throttle(p_ip_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_ip_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid admin login throttle key';
  END IF;

  DELETE FROM admin_login_throttles WHERE ip_hash = p_ip_hash;
END;
$$;

REVOKE ALL ON FUNCTION begin_admin_login_attempt(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION clear_admin_login_throttle(TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION begin_admin_login_attempt(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION clear_admin_login_throttle(TEXT) TO service_role;

COMMENT ON TABLE admin_login_throttles IS
  'HMAC-hashed client IP counters for temporary admin login lockouts.';
