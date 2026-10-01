import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const PRODUCTION_ORIGINS = new Set([
  "https://frontier-universal-treadmill-console.vercel.app",
  "https://agyekum-treadmill-console.vercel.app",
]);

function isAllowedOrigin(origin: string) {
  if (PRODUCTION_ORIGINS.has(origin)) return true;
  return /^https:\/\/frontier-universal-treadmill-co-[a-z0-9-]+-frontier-devconsults\.vercel\.app$/i.test(origin);
}

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = isAllowedOrigin(origin)
    ? origin
    : "https://frontier-universal-treadmill-console.vercel.app";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

const encoder = new TextEncoder();

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeadersFor(req) });
}

function normalizeSecret(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 86400000);
}

function randomToken(bytes = 32) {
  const raw = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...raw))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") || "";
    if (!isAllowedOrigin(origin)) {
      return new Response("Forbidden", { status: 403, headers: corsHeadersFor(req) });
    }
    return new Response("ok", { headers: corsHeadersFor(req) });
  }
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!secretKey || !supabaseUrl) return json(req, { error: "Licensing service unavailable" }, 503);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid request body" }, 400);
  }

  const action = String(body.action || "");
  const installationId = String(body.installationId || "").trim();
  if (!installationId || installationId.length < 12 || installationId.length > 160) {
    return json(req, { error: "Invalid installation identifier" }, 400);
  }

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const identityHash = await sha256Hex(`${forwarded}|${installationId}|${userAgent}`);

  const recentFailureCount = async (eventType: string) => {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("treadmill_license_events")
      .select("*", { count: "exact", head: true })
      .eq("identity_hash", identityHash)
      .eq("event_type", eventType)
      .eq("success", false)
      .gte("created_at", since);
    return count || 0;
  };

  const logEvent = async (
    eventType: string,
    success: boolean,
    details: Record<string, unknown>,
    licenseId?: string | null,
    activationId?: string | null,
  ) => {
    await admin.from("treadmill_license_events").insert({
      license_id: licenseId || null,
      activation_id: activationId || null,
      installation_id: installationId,
      event_type: eventType,
      success,
      identity_hash: identityHash,
      details,
    });
  };

  const validateLicense = (license: any) => {
    const now = new Date();
    if (!license || license.status !== "active") return "License is not active";
    if (license.valid_from && new Date(license.valid_from) > now) return "License is not active yet";
    if (license.expires_at && new Date(license.expires_at) <= now) return "License has expired";
    return null;
  };

  if (action === "activate") {
    if (await recentFailureCount("license_activate") >= 10) {
      return json(req, { error: "Too many failed activation attempts. Try again later." }, 429);
    }

    const licenseKey = normalizeSecret(body.licenseKey);
    if (licenseKey.length < 16 || licenseKey.length > 120) {
      await logEvent("license_activate", false, { reason: "invalid_format" });
      return json(req, { error: "Invalid license key" }, 401);
    }

    const licenseHash = await sha256Hex(licenseKey);
    const { data: license, error: licenseError } = await admin
      .from("treadmill_licenses")
      .select("*")
      .eq("license_key_hash", licenseHash)
      .maybeSingle();

    if (licenseError || !license) {
      await logEvent("license_activate", false, { reason: "not_found" });
      return json(req, { error: "License key not recognized" }, 401);
    }

    const invalidReason = validateLicense(license);
    if (invalidReason) {
      await logEvent("license_activate", false, { reason: invalidReason }, license.id);
      return json(req, { error: invalidReason }, 403);
    }

    let { data: activation } = await admin
      .from("treadmill_license_activations")
      .select("*")
      .eq("license_id", license.id)
      .eq("installation_id", installationId)
      .maybeSingle();

    if (!activation) {
      const { count } = await admin
        .from("treadmill_license_activations")
        .select("*", { count: "exact", head: true })
        .eq("license_id", license.id)
        .eq("status", "active");

      if ((count || 0) >= license.max_installations) {
        await logEvent("license_activate", false, { reason: "activation_limit" }, license.id);
        return json(req, { error: "License activation limit reached. Contact Frontier DevConsults." }, 409);
      }

      const { data: created, error: createError } = await admin
        .from("treadmill_license_activations")
        .insert({
          license_id: license.id,
          installation_id: installationId,
          hardware_device_id: body.hardwareDeviceId ? String(body.hardwareDeviceId) : null,
          status: "active",
          app_version: body.appVersion ? String(body.appVersion) : null,
          metadata: { platform: body.platform || null },
        })
        .select("*")
        .single();

      if (createError || !created) return json(req, { error: "Activation could not be created" }, 500);
      activation = created;
    } else {
      if (activation.status !== "active") {
        await logEvent("license_activate", false, { reason: "activation_inactive" }, license.id, activation.id);
        return json(req, { error: "This installation has been deactivated" }, 403);
      }

      const { data: updated } = await admin
        .from("treadmill_license_activations")
        .update({
          last_validated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          hardware_device_id: body.hardwareDeviceId ? String(body.hardwareDeviceId) : activation.hardware_device_id,
          app_version: body.appVersion ? String(body.appVersion) : activation.app_version,
        })
        .eq("id", activation.id)
        .select("*")
        .single();

      if (updated) activation = updated;
    }

    const now = new Date();
    const revalidateAt = addDays(now, license.revalidate_days);
    const offlineGraceUntil = addDays(revalidateAt, license.offline_grace_days);
    const hardExpiry = license.expires_at ? new Date(license.expires_at) : null;
    const effectiveGrace = hardExpiry && hardExpiry < offlineGraceUntil ? hardExpiry : offlineGraceUntil;

    await logEvent("license_activate", true, { license_type: license.license_type }, license.id, activation.id);

    return json(req, {
      ok: true,
      activation: {
        activationId: activation.id,
        licenseId: license.id,
        installationId,
        customerName: license.customer_name,
        licenseType: license.license_type,
        expiresAt: license.expires_at,
        revalidateAt: revalidateAt.toISOString(),
        offlineGraceUntil: effectiveGrace.toISOString(),
        brandProfile: license.brand_profile || {},
        modules: license.modules || [],
        engineeringAvailable: true,
      },
    });
  }

  if (action === "validate") {
    const licenseId = String(body.licenseId || "");
    const activationId = String(body.activationId || "");
    if (!licenseId || !activationId) return json(req, { error: "Missing activation identity" }, 400);

    const { data: license } = await admin
      .from("treadmill_licenses")
      .select("*")
      .eq("id", licenseId)
      .maybeSingle();

    const { data: activation } = await admin
      .from("treadmill_license_activations")
      .select("*")
      .eq("id", activationId)
      .eq("license_id", licenseId)
      .eq("installation_id", installationId)
      .maybeSingle();

    const invalidReason = validateLicense(license);
    if (invalidReason || !activation || activation.status !== "active") {
      await logEvent("license_validate", false, { reason: invalidReason || "activation_invalid" }, licenseId || null, activationId || null);
      return json(req, { error: invalidReason || "Activation is no longer valid" }, 403);
    }

    await admin
      .from("treadmill_license_activations")
      .update({ last_validated_at: new Date().toISOString(), last_seen_at: new Date().toISOString() })
      .eq("id", activation.id);

    const now = new Date();
    const revalidateAt = addDays(now, license.revalidate_days);
    const offlineGraceUntil = addDays(revalidateAt, license.offline_grace_days);
    const hardExpiry = license.expires_at ? new Date(license.expires_at) : null;
    const effectiveGrace = hardExpiry && hardExpiry < offlineGraceUntil ? hardExpiry : offlineGraceUntil;

    await logEvent("license_validate", true, {}, license.id, activation.id);

    return json(req, {
      ok: true,
      activation: {
        activationId: activation.id,
        licenseId: license.id,
        installationId,
        customerName: license.customer_name,
        licenseType: license.license_type,
        expiresAt: license.expires_at,
        revalidateAt: revalidateAt.toISOString(),
        offlineGraceUntil: effectiveGrace.toISOString(),
        brandProfile: license.brand_profile || {},
        modules: license.modules || [],
        engineeringAvailable: true,
      },
    });
  }

  if (action === "engineering-auth") {
    if (await recentFailureCount("engineering_auth") >= 8) {
      return json(req, { error: "Too many failed engineering login attempts. Try again later." }, 429);
    }

    const licenseId = String(body.licenseId || "");
    const activationId = String(body.activationId || "");
    const serviceCode = normalizeSecret(body.serviceCode);

    const { data: license } = await admin
      .from("treadmill_licenses")
      .select("*")
      .eq("id", licenseId)
      .maybeSingle();

    const { data: activation } = await admin
      .from("treadmill_license_activations")
      .select("*")
      .eq("id", activationId)
      .eq("license_id", licenseId)
      .eq("installation_id", installationId)
      .maybeSingle();

    const invalidReason = validateLicense(license);
    if (invalidReason || !activation || activation.status !== "active") {
      await logEvent("engineering_auth", false, { reason: invalidReason || "activation_invalid" }, licenseId || null, activationId || null);
      return json(req, { error: invalidReason || "Active license required" }, 403);
    }

    const codeHash = await sha256Hex(serviceCode);
    if (!serviceCode || codeHash !== license.engineering_code_hash) {
      await logEvent("engineering_auth", false, { reason: "invalid_service_code" }, license.id, activation.id);
      return json(req, { error: "Invalid Frontier engineering credential" }, 401);
    }

    const rawToken = randomToken(40);
    const tokenHash = await sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await admin
      .from("treadmill_engineering_sessions")
      .insert({
        license_id: license.id,
        activation_id: activation.id,
        token_hash: tokenHash,
        installation_id: installationId,
        expires_at: expiresAt.toISOString(),
      });

    await logEvent("engineering_auth", true, {}, license.id, activation.id);

    return json(req, {
      ok: true,
      engineeringSession: {
        token: rawToken,
        expiresAt: expiresAt.toISOString(),
      },
    });
  }

  if (action === "engineering-validate") {
    const token = String(body.token || "");
    if (!token) return json(req, { error: "Missing engineering session" }, 400);
    const tokenHash = await sha256Hex(token);

    const { data: session } = await admin
      .from("treadmill_engineering_sessions")
      .select("id, license_id, activation_id, installation_id, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .eq("installation_id", installationId)
      .maybeSingle();

    if (!session || session.revoked_at || new Date(session.expires_at) <= new Date()) {
      return json(req, { error: "Engineering session expired or invalid" }, 401);
    }
    return json(req, { ok: true, expiresAt: session.expires_at });
  }

  if (action === "engineering-revoke") {
    const token = String(body.token || "");
    if (!token) return json(req, { ok: true });
    const tokenHash = await sha256Hex(token);
    await admin
      .from("treadmill_engineering_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", tokenHash)
      .eq("installation_id", installationId);
    return json(req, { ok: true });
  }

  return json(req, { error: "Unknown licensing action" }, 400);
});
