# Frontier DevConsults - Final Completion Checklist

Audit date: 2026-07-20

This checklist reflects the current repository. It separates working features from placeholder screens and the remaining work needed before the site can be treated as a complete, secure, admin-managed production application.

## Current Working Foundation

- [x] Public marketing site, responsive navigation, portfolio pages, pricing page, contact page, and Request a Build section exist.
- [x] Desktop and mobile hero images are separate public assets.
- [x] Public price display can read `pricing_settings` through `lib/pricing-store.ts`; it falls back to default values when Supabase is unavailable.
- [x] Admin pricing editor and its GET/PUT API routes exist.
- [x] Contact and embedded Request a Build forms call API routes.
- [x] Contact submissions, build requests, visitor tracking, apps, projects, and pricing SQL schemas are documented in `SUPABASE_SETUP.md`.
- [x] Vercel deployment configuration and PWA assets are present.
- [x] The legacy dashboard implementation note was reconciled and removed because it no longer reflects the current build.
  - Supabase/PostgreSQL is in use; Prisma is not required for this architecture.
  - Signed HTTP-only admin sessions and protected admin APIs are implemented.
  - Custom visitor tracking exists; it does not require Google or Vercel Analytics to function.
  - Project CRUD APIs and editor are implemented; App Store CRUD APIs are implemented but its editor remains to be connected.
  - Homepage featured-project data, dashboard aggregation, and email delivery remain active checklist items. Hero media and media upload completion testing remain active checklist items.

## Priority 1 - Secure the Admin and Supabase Boundary

- [x] Replace the current local-storage-only admin token with real server-side authentication.
  - Evidence: admin pages only check whether `localStorage.admin_token` exists.
  - Evidence: `app/api/admin/pricing/route.ts` accepts any non-empty `x-admin-token` header.
  - Recommended: use Supabase Auth with an admin role, or a server-signed HTTP-only session cookie.
  - Completion test: a visitor cannot call any admin API or open an admin page by adding an arbitrary browser value.

- [x] Add server-only Supabase credentials for protected writes.
  - Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel and local development only; never expose it with a `NEXT_PUBLIC_` prefix.
  - Use a server-side Supabase client for admin CRUD, uploads, submission management, and settings writes.
  - Completion test: browser clients use only the anon key; privileged writes occur only after verified admin authentication.

- [x] Replace permissive pricing RLS policies in `SUPABASE_SETUP.md`.
  - Current documented policies allow anon inserts and updates to `pricing_settings`.
  - Keep public read access only if the public pricing route needs it; restrict writes to the server/admin role.
  - Completion test: unauthenticated SQL/API requests cannot change prices.

- [x] Verify every required table exists in the live Supabase project and apply migrations in a tracked order.
  - The security, pricing history, project, and app migrations were applied through the live Supabase SQL Editor on 2026-07-20.
  - Required baseline: `admin_credentials`, `contact_submissions`, `build_requests`, `visitors`, `apps`, `projects`, and `pricing_settings`.
  - Store schema changes as versioned SQL migrations in the repository rather than only in dashboard history.
  - Completion test: a new environment can be created from migrations without manual reconstruction.

- [x] Apply `202607210005_submission_management.sql` in the live Supabase SQL Editor.
  - This adds private submission notes plus archive metadata and indexes used by the admin inbox.

## Priority 2 - Connect Pricing Fully to Supabase

- [x] Confirm the live `pricing_settings` table contains a valid settings record and that public pricing reads it.
  - Confirmed on 2026-07-20 through the live public pricing API after an admin save. The homepage has no visible pricing cards; public pricing is displayed on `/pricing`.
- [x] Change the admin pricing API to use verified admin authentication and the server-only Supabase client.
- [x] Remove the production reliance on `data/pricing-settings.json`.
  - The local JSON fallback is useful for development but Vercel serverless storage is not durable for admin-edited production data.
- [x] Add save history/audit metadata: editor identity, saved timestamp, previous value, and rollback option.
- [x] Add validation for exchange rate, rounding, and every minimum/maximum USD price.
- [x] Connect Request a Build budget options to live Ghana cedi pricing settings.
- [ ] Completion test: edit a price in the live admin dashboard, refresh the public Pricing page, and verify the new GHS result persists after a redeploy.

## Priority 3 - Project CRUD

- [x] Create a production project model and migration.
  - Extend the currently documented `projects` table with: slug, sort order, featured flag, visibility, status, color, technologies, features, logo/media references, live URL, download URL, created/updated metadata, and optional publish date.
- [x] Build authenticated admin APIs for project list, create, read, update, publish/unpublish, reorder, and delete actions.
- [x] Replace `app/admin/projects/page.tsx` placeholder cards and hard-coded counts with live data, edit form, confirmation dialog, and empty/loading/error states.
- [x] Replace hard-coded project entries in `app/projects/page.tsx` and the featured-project entries in `app/page.tsx` with database-driven content.
  - `app/projects/page.tsx` renders published Supabase projects. The homepage renders up to six published projects marked featured, while both retain the existing catalogue as a fallback until managed projects are available.
- [x] Preserve a deliberate fallback or seed dataset so the public site is never blank on first deployment.
- [ ] Completion test: create a project in admin, add a logo and details, publish it, reorder it, edit it, unpublish it, and delete it; verify the public pages reflect each operation.

## Priority 4 - App Store CRUD

- [x] Complete the `apps` model with the fields the public App Store actually uses: slug, icon, screenshots, features, requirements, version, size, rating, downloads, category, status, featured flag, sort order, Play Store URL, direct download URL, and visibility.
- [x] Build authenticated admin APIs for app create/read/update/publish/unpublish/delete and ordering.
- [x] Connect `app/admin/app-store/page.tsx` form controls, edit/remove buttons, counters, and app list to those APIs.
  - Current state: the form is explicitly a demonstration and does not submit or upload files.
- [x] Replace hard-coded app data in `app/app-store/page.tsx` with database content.
  - The page retains its existing catalogue only until the first published managed app is available, preventing an empty public App Store during the transition.
- [x] Add validation for URLs, ratings, permitted statuses, and required published fields.
- [ ] Completion test: add an app with its icon and store link in admin, publish it, then confirm it appears correctly on the public App Store after refresh and redeploy.

## Priority 5 - Image and Video Uploads

- [x] Create Supabase Storage buckets and policies.
  - Suggested buckets: `project-media`, `app-media`, and `site-media`.
  - Allow public read only for intentionally public assets.
  - Restrict upload, replacement, and deletion to authenticated admin server routes.
- [x] Build a reusable authenticated upload API.
  - Validate MIME type, file size, filename, and image/video dimensions before upload.
  - Generate unique paths and return storage URLs plus asset metadata.
  - Add delete/replace behavior that removes orphaned files safely.
- [x] Add image handling for project logos, project gallery images, app icons, app screenshots, and office media.
- [x] Add video handling with poster images, autoplay/mute controls where appropriate, file-size limits, and a fallback image.
- [ ] Add upload progress, preview, replace, remove, retry, and clear error messages in admin forms.
- [ ] Completion test: upload a valid image and video, publish content that uses them, replace each asset, delete unused assets, and confirm invalid files are rejected.

## Priority 6 - Hero Background CRUD (Images and Videos)

- [x] Create a `site_settings` or dedicated `hero_media` table for the homepage hero.
  - Required fields: desktop media URL/type, mobile media URL/type, desktop poster image, mobile poster image, alt text, overlay strength, focal position, enabled flag, revision number, updated timestamp, and editor identity.
- [ ] Build a dedicated Hero Media section in the admin dashboard.
  - Upload or select desktop and mobile assets separately.
  - Support image and video media types.
  - Show device previews before publish.
  - Provide draft, publish, revert, and restore-default actions.
- [x] Update `app/page.tsx` to load the published hero settings from Supabase while retaining the current local hero images as a safe fallback.
- [x] Preserve the existing responsive rules: wide desktop media on desktop and portrait media on mobile.
- [x] Configure safe video behavior: muted, plays inline, no blocking download, poster fallback, and image fallback for reduced-data/reduced-motion environments.
- [ ] Invalidate or version PWA/runtime caches when hero media changes so mobile visitors do not keep seeing old images.
- [ ] Completion test: publish a new desktop image, mobile image, desktop video, and mobile video in turn; verify each appears on the correct device and can be rolled back without code deployment.

## Priority 7 - Submissions and Dashboard Data

- [x] Build authenticated admin APIs to list contact submissions and build requests, filter/search them, mark them responded, save private notes, archive/restore, and delete them.
- [x] Connect `app/admin/submissions/page.tsx` to live Supabase data.
- [x] Connect dashboard submission, pending request, project, app, and visitor statistics to protected Supabase queries.
- [x] Add recent activity derived from submissions and app/project updates.
- [x] Make contact/build storage failures visible to the visitor.
- [x] Connect the standalone `/request-build` page to `/api/request-build`.
- [ ] Completion test: submit both forms, confirm database records, view them in admin, mark one responded, and confirm dashboard counts update.

## Priority 8 - Email Delivery and Forwarding

- [ ] Decide how `info@frontier-devconsults.com` is hosted and forwarded to `frontierdevconsults@gmail.com`.
  - This requires email/DNS configuration with the domain's email provider, Google Workspace, or a forwarding service. It cannot be completed by website code alone.
  - Configure MX/SPF/DKIM/DMARC records and a forward/alias rule from `info@frontier-devconsults.com` to `frontierdevconsults@gmail.com`.
  - Completion test: send an ordinary external email to `info@frontier-devconsults.com` and confirm it arrives at the Gmail inbox.

- [x] Add transactional form notification implementation through Resend.
  - Add a verified sending domain and `RESEND_API_KEY` to Vercel and local environment configuration.
  - Send notification emails to `frontierdevconsults@gmail.com` for contact forms and build requests.
  - Use the client's address as `replyTo`; do not send directly from an unverified visitor address.
  - Send an optional acknowledgement to the client.
  - Completion test: submit each form and verify the Gmail notification, reply-to behavior, client acknowledgement, and Supabase record.

- [ ] Add spam and abuse controls before enabling public email delivery.
  - [x] Server-side validation and best-effort per-instance rate limiting are active.
  - [x] Browser honeypot fields reject common automated form submissions.
  - [ ] Add Turnstile/reCAPTCHA for distributed production protection.
  - Completion test: repeated automated submissions are blocked without affecting a normal client submission.

## Priority 9 - Admin Settings and Operations

- [ ] Replace disabled, hard-coded controls in `app/admin/settings/page.tsx` with real settings only where appropriate.
  - Website contact destination, public contact details, and hero settings can live in a protected settings table.
  - Secrets such as email API keys must remain Vercel environment variables, not editable database fields.
- [ ] Show true Supabase connection health instead of assuming success whenever `/api/track-visitor` returns JSON.
- [ ] Add admin audit logs for price changes, publish/unpublish actions, media changes, and deletions.
- [ ] Add backups/export for apps, projects, settings, submissions, and media references.
- [ ] Completion test: an administrator can identify the current configuration, review changes, and recover a deleted/published record safely.

## Priority 10 - Final Quality and Launch Checks

- [ ] Test all CRUD operations on desktop and mobile with real Supabase data.
- [ ] Test all public pages after a new app, project, price, or hero media item is published.
- [ ] Test uploads on slow mobile data and verify file-size/error handling.
- [ ] Test email delivery, forwarding, spam protection, and reply behavior.
- [ ] Test admin access after logout, browser refresh, expired session, and invalid token attempts.
- [ ] Run `npm run build` before every production deployment and resolve new security/dependency warnings.
- [ ] Verify Vercel environment variables for Production, Preview, and Development.
- [ ] Verify PWA cache refresh after visual/media changes.
- [ ] Create a staging/preview deployment workflow before making major public content changes.

## Recommended Implementation Order

1. Secure admin authentication and server-only Supabase access.
2. Apply tracked Supabase migrations and storage bucket policies.
3. Finish pricing persistence and submission management.
4. Add project and app CRUD with image uploads.
5. Add hero image/video CRUD with previews and rollback.
6. Configure email forwarding and transactional notifications.
7. Replace dashboard placeholders with live data, then complete launch testing.

## Definition of Complete

The app is complete when an authenticated administrator can safely manage projects, apps, prices, hero image/video media, and submissions from the dashboard; changes persist in Supabase; public pages update without code edits; client enquiries are stored and delivered to `frontierdevconsults@gmail.com`; and no admin write, upload, or secret is exposed to unauthenticated visitors.
