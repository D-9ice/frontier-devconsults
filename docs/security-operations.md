# Security operations and recovery

This runbook covers the Frontier DevConsults production website, admin area,
Supabase data and storage, Resend mail, and GitHub/Vercel delivery pipeline.
Never paste secrets, customer message bodies, email contents, or raw access
tokens into tickets, alerts, chat, or build logs.

## Alert triage

1. Open **Admin > Monitoring & owner alerts** and locate the event by its
   correlation ID. CI failures also appear in the GitHub Actions run linked by
   the sanitized owner alert.
2. Record the UTC timestamp, category, severity, route, result, source hash,
   deployment commit, and relevant provider request IDs. Preserve provider
   logs before their retention window expires.
3. Confirm whether the event is an approved controlled security test. Test
   records are explicitly labelled and must not be treated as real incidents.
4. For a suspected compromise, stop further changes, preserve evidence, and
   contain the narrowest affected component. Do not delete logs or customer
   records during investigation.
5. Escalate high or critical events immediately to the owner. Rotate only the
   credentials that may have been exposed, then verify all dependent services.

## Containment and credential rotation

- **Admin sessions:** rotate `ADMIN_SESSION_SECRET` in Vercel and redeploy.
  This invalidates all existing admin cookies. Verify login and TOTP after the
  deployment.
- **Admin password:** use the protected dashboard password-change control. A
  successful change signs out the current session and requires a new login.
- **Admin MFA:** rotate `ADMIN_TOTP_SECRET`, update the owner's authenticator,
  redeploy, and immediately confirm login in a separate private window before
  ending the existing session.
- **Supabase:** rotate the service-role key in Supabase, update
  `SUPABASE_SERVICE_ROLE_KEY` in Vercel and GitHub Actions, and redeploy. Never
  expose a service-role key through a `NEXT_PUBLIC_` variable.
- **Resend:** revoke the affected API key or webhook signing secret, replace
  `RESEND_MAIL_API_KEY` or `RESEND_WEBHOOK_SECRET`, and verify one labelled
  inbound and outbound test.
- **Monitoring:** rotate `MONITORING_JOB_TOKEN` and `MONITORING_READ_TOKEN` in
  every configured caller and provider before redeploying.
- **GitHub/Vercel:** revoke compromised personal tokens or sessions, review
  account and team access, require MFA, and remove unknown applications or
  deploy keys.

## Recovery

1. Identify the last known-good commit and deployment in GitHub and Vercel.
2. Restore application code by deploying that immutable commit. Do not reset
   or rewrite Git history as an incident-response shortcut.
3. For data loss or corruption, use the Supabase project's configured backup
   or point-in-time recovery procedure. Restore into an isolated project first,
   validate row counts and representative records, then approve the production
   cutover.
4. Reapply and verify required migrations, RLS, table grants, storage policies,
   and bucket upload limits after any database restore.
5. Run the security gate, normal tests, type check, and production build. Then
   verify headers, admin authentication, same-origin form enforcement, inbound
   webhook verification, mail delivery, and monitoring alerts in production.
6. Document the cause, containment, affected data, recovery point, verification
   evidence, and preventive action. Notify affected parties when legally or
   contractually required.

## Controlled alert test

Use the monitoring endpoint's `securityTest` flag only from an authorized
operator environment. Keep the token in an environment variable and never
place it in shell history, source files, or screenshots. A successful test must
create a clearly labelled high-severity monitoring record and an owner alert;
it must not contain customer data.

## Required provider controls

- Require MFA for GitHub, Vercel, Supabase, Resend, and the owner's mailbox.
- Protect the production branch with required security workflow checks and
  review. Restrict workflow and deployment permissions to least privilege.
- Configure Supabase backups or point-in-time recovery appropriate to the data
  retention requirement and rehearse restoration at least quarterly.
- Keep Vercel production secrets out of preview/development unless required;
  review access quarterly and after any staff or contractor change.
- Review Dependabot/security advisories and the scheduled security workflow;
  remediate high and critical issues before deployment.
