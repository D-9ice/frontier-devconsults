# Frontier DevConsults security hardening report

Date: 2026-09-09

Scope: the Next.js website and admin APIs, Supabase data/storage access,
Resend webhook and mail flows, monitoring, and GitHub Actions delivery controls.
Only vulnerabilities found in this implementation are listed below.

## Remediated vulnerabilities

### High — admin authentication could fail open during a database error

- **Risk:** a Supabase query failure was treated like a missing credential and
  could fall back to an environment bootstrap password.
- **Remediation:** database errors now fail closed; the fallback is permitted
  only when the credential row is genuinely absent or still a placeholder.
  Password comparison is constant-time, the minimum changed password length is
  12 characters, bcrypt cost is 12, password changes revoke the current
  session, and optional TOTP MFA is enforced whenever configured.
- **Affected files:** `app/api/admin/login/route.ts`,
  `app/api/admin/change-password/route.ts`, `lib/admin-auth.ts`, `lib/totp.ts`,
  `components/AdminShortcut.tsx`,
  `app/admin/(protected)/dashboard/page.tsx`.

### High — direct media uploads trusted client-declared file metadata

- **Risk:** a signed upload could be published using a spoofed content type,
  misleading name, or unexpected file content.
- **Remediation:** upload requests now use canonical server-generated names,
  exact allowlisted types and sizes, storage metadata verification, bounded
  byte-range inspection, file-signature validation for every supported format,
  and deletion of rejected objects before they can be published.
- **Affected files:** `lib/admin-media.ts`, `app/api/admin/media/route.ts`,
  `components/admin/media-upload.tsx`.

### High — project links accepted unsafe URL schemes

- **Risk:** a stored project link could use a script or other non-web scheme and
  execute when an administrator-published link was selected.
- **Remediation:** all stored project links must now parse as absolute HTTP or
  HTTPS URLs; text and list lengths are bounded.
- **Affected file:** `lib/projects.ts`.

### High — abuse controls were isolated to individual server processes

- **Risk:** process-local rate limits could be bypassed across serverless
  instances or lost on restart.
- **Remediation:** public forms, assistant sessions, commercial telemetry, and
  monitoring telemetry now use the protected Supabase allowance function with
  hashed source identifiers. High-rate abuse creates a deduplicated security
  alert.
- **Affected files:** `lib/form-protection.ts`,
  `lib/assistant-rate-limit.ts`, `lib/request-security.ts`,
  `lib/security-monitoring.ts`, and the related public API routes under
  `app/api/`.

### Medium — request bodies and accepted fields were not consistently bounded

- **Risk:** unbounded JSON parsing and ignored extra fields increased denial of
  service, parser abuse, and mass-assignment exposure.
- **Remediation:** security-sensitive routes now require JSON, reject oversized
  or malformed bodies, enforce exact top-level field allowlists, validate UUIDs
  where applicable, and apply field/list limits before persistence.
- **Affected files:** `lib/request-security.ts` and the modified routes under
  `app/api/`.

### Medium — public form preflight advertised wildcard cross-origin access

- **Risk:** wildcard CORS conflicted with the intended same-origin browser
  boundary.
- **Remediation:** contact and build submissions require the production origin;
  their preflight responses return the validated origin and never `*`.
- **Affected files:** `app/api/contact/route.ts`,
  `app/api/request-build/route.ts`.

### Medium — monitoring alerts retained unnecessary copies of enquiry rows

- **Risk:** duplicating nearly complete business records into monitoring events
  increased personal-data exposure and retention.
- **Remediation:** database triggers and reconciliation now copy only the fields
  necessary to identify and action each enquiry. Full records remain in their
  RLS-protected source tables. Logged security events are pruned after 90 days.
- **Affected files:**
  `supabase/migrations/202609090019_security_hardening.sql`,
  `lib/monitoring.ts`.

### Medium — security-relevant failures lacked structured audit events

- **Risk:** login failures, authorization probes, webhook signature failures,
  and rate abuse were harder to correlate and alert on.
- **Remediation:** structured, privacy-minimized events now include timestamp,
  category, route, method, severity, source hash, correlation ID, actor/result,
  and bounded resource metadata. High/critical events are deduplicated and sent
  through the existing owner-alert channel; controlled test events are labelled.
- **Affected files:** `lib/security-monitoring.ts`, `lib/admin-auth.ts`,
  `lib/submission-format.ts`, `components/admin/MonitoringPanel.tsx`, and the
  modified authentication, monitoring, mail, media, assistant, and webhook
  routes.

### Medium — response-header ownership was conflicting and incomplete

- **Risk:** Vercel and Next.js supplied conflicting frame policies, while
  several browser isolation and capability restrictions were absent.
- **Remediation:** Next.js is now the single header authority. CSP blocks object
  embedding and inline script attributes; admin APIs are non-cacheable; frame,
  MIME, referrer, HSTS, opener/resource isolation, cross-domain policy, and
  browser capability restrictions are set consistently.
- **Affected files:** `next.config.js`, `next.config.ts`, `vercel.json`.

### Medium — CI dependencies and security checks were insufficiently protected

- **Risk:** mutable action tags and the lack of a required security gate exposed
  the delivery pipeline to dependency drift and silent regressions.
- **Remediation:** GitHub Actions are pinned to immutable commit SHAs. A
  least-privilege security workflow runs on pull requests, main-branch pushes,
  manual dispatch, and daily schedule; it checks secrets, route guards, bounded
  parsing, CORS, dependency advisories, tests, types, and production builds. A
  failed non-PR run sends a sanitized owner alert through Resend.
- **Affected files:** `.github/workflows/monitoring.yml`,
  `.github/workflows/security.yml`, `scripts/security-check.mjs`,
  `scripts/security-ci-alert.mjs`, `package.json`, `package-lock.json`.

## Validation

- `npm run check:security` passed across 232 tracked text files and all 34 API
  routes. The scanner rejects credential-like literals, public secret variable
  names, wildcard CORS, mutable GitHub Actions, missing admin route guards, and
  unbounded `request.json()` calls.
- `npx tsc --noEmit` passed.
- `node --test tests/security-hardening.test.mjs
  tests/media-upload-states.test.mjs` passed 10/10 focused tests covering origin,
  body and field limits, admin guards, sessions and MFA, upload signatures, URL
  validation, webhook verification, AI boundaries, database grants, headers,
  and CI pinning.
- The complete `tests/*.test.mjs` suite passed 72/72 tests.
- `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities after
  refreshing the lockfile.
- `npx next build --webpack` completed the production build, including all 48
  static pages and every dynamic/API route. The default Turbopack command could
  not run in the restricted validation environment because its CSS helper was
  denied permission to bind an internal local port; no source error was reported.
- `git diff --check` passed.

## Owner/provider actions required for activation

1. Apply `supabase/migrations/202609090019_security_hardening.sql` to production
   before deploying the application changes.
2. Generate a strong base32 TOTP secret, store it as `ADMIN_TOTP_SECRET` in the
   Vercel Production environment, add the same secret to the owner's
   authenticator, then test login in a separate private window. Do not enable it
   until both copies are ready.
3. Verified on 2026-09-12: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, and
   `MONITORING_JOB_TOKEN` are configured as GitHub Actions secrets so scheduled
   or main-branch security-gate failures can alert the owner.
4. Make the security workflow a required protected-branch check and require MFA
   on GitHub, Vercel, Supabase, Resend, and the owner mailbox.
5. Confirm Supabase backups or point-in-time recovery, then perform and record a
   quarterly isolated restore rehearsal using `docs/security-operations.md`.
6. After deployment, run one labelled controlled alert test and verify security
   headers, admin re-authentication, inbound webhook delivery, and owner alert
   delivery from the production providers.
