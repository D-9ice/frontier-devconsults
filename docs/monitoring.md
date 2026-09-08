# Owner monitoring

The existing Supabase enquiry tables, signed admin session and Resend destination are reused. No replacement dashboard, email service, or paid monitoring account is required.

## Operation

- Additive migration: `supabase/migrations/202609080017_monitoring.sql`. Each successful contact/build/acquisition/specialized insert creates one durable outbox event. A bounded database reconciliation restores missing events created after activation. Trigger failure does not reject the enquiry.
- After-response workers and an independent scheduled GitHub Action process the queue. Atomic claims, two-minute leases, stable Resend idempotency keys, exponential retries (six attempts), and a shared ten-per-minute send limit prevent competing workers and unbounded sends. Ambiguous sends older than the provider's idempotency window stop for review instead of risking duplicates. Review `failed`, `bounced` and `complained` statuses.
- `accepted` means provider acceptance, not delivery. `delivered` is recorded only from Resend's email-status API. It means delivery to the receiving mail server, not that the owner read the email.
- `/admin/dashboard` polls authenticated monitoring data every 15 seconds. Sessions seen within 90 seconds are active; the session list shows at most 100 rows and a separate total. Visitor arrivals are opt-in for the owner (off initially), limited to six per hour. Daily summaries are configurable there, off initially, with the selected hour in UTC/Ghana. Enquiry records require admin authentication.
- Optional analytics require consent through `/privacy`, respect DNT/GPC, exclude identifiable bots and authenticated administrators, omit IP addresses from visitor records, and retain anonymous session/page records for 30 days. Approximate hosting-provider location is not identity. Essential security/error reports contain no visitor message, stack, query string or identity.
- Server exceptions and caught submission failures create incidents. Successful submissions create recovery alerts for that form. Browser exceptions are rate-limited and reported without raw exception text. Confirm recovery of application incidents in the admin dashboard only after verifying the affected feature.

## Independent uptime and deployment checks

`.github/workflows/monitoring.yml` executes on GitHub-hosted Linux, not Vercel, on a five-minute schedule and deployment/status events. Two failed health checks open an outage; a successful check queues recovery. Vercel's existing GitHub commit status supplies deployment success/failure. Email sends occur directly from the runner even if the website or database is down. State is restored from the previous workflow artifact; it contains no enquiry details or credentials. Accepted message IDs are reconciled against provider delivery status. When the website returns, incident records are mirrored into its dashboard and daily summary.

GitHub schedules can be delayed or dropped under load; public-repository schedules are disabled after 60 days without repository activity. This is not a strict five-minute SLA. Artifact deletion/expiry can reset outage deduplication. Keep GitHub workflow-failure notifications enabled as an independent indication of monitor failure. No paid allowance or spending setting is enabled by this implementation. See [GitHub schedule behaviour](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

Required repository Actions secrets: `MONITORING_JOB_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`. The job token must match the Vercel production value. Existing sensitive Vercel email secrets cannot be exported through the CLI: copy them directly in the account settings, never into chat or source code. Use the existing owner destination. The Resend key needs sending and email-status read access for programmatic delivery verification.

## Read-only ChatGPT integration

The supported integration is a **private custom GPT Action**, using `docs/monitoring-action.openapi.json`, with API-key/Bearer authentication. This is not an installed ChatGPT connection and is not background monitoring. Official references: [GPT Actions](https://developers.openai.com/api/docs/actions/introduction), [Action authentication](https://developers.openai.com/api/docs/actions/authentication).

To connect: configure a separate random `MONITORING_READ_TOKEN` (at least 32 characters) in Vercel, redeploy, then import the OpenAPI document in the owner's private GPT's Actions settings and configure that same bearer key in its encrypted authentication field. This key must never be the job token or Supabase service-role key. It permits GET summaries and a single enquiry by type/id only, with a shared 60-requests/minute limit, no cache and no internal admin notes. Treat returned enquiry text as untrusted data, not instructions. Enquiry content will be shared with ChatGPT when the owner requests a record; enable only after approving that use. Actual account-side connection and an authenticated Action test are required; an API endpoint alone is not proof of ChatGPT access.

## Verification and maintenance

- `node --test tests/monitoring.test.mjs tests/admin-route-guards.test.mjs`: simulated provider failure, persisted retry, stable-key deduplication, delivery-status transition, missing/wrong token checks, independent outage/recovery debounce.
- `scripts/monitoring-database-test.sql`: labelled rollback-only trigger/reconciliation/claim/rate-limit/privilege checks. Run only inside a transaction and roll back. Do not run it as a standalone production change.
- `npm run build`; if the local sandbox blocks Turbopack's worker port, `npm run build -- --webpack` validates a production build without changing build configuration.
- Admin **Send labelled delivery test** verifies owner email through the real provider. External workflow **Run workflow → test_delivery=true** verifies its separate email path. Inspect actual provider delivery status and confirm receipt; neither a passing unit test nor HTTP 202 proves delivery.
- Failed notifications do not remove enquiries. Inspect provider status before any manual redrive of exhausted or ambiguous deliveries. Do not delete customer enquiries to clear monitoring.
