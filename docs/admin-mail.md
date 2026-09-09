# Private business mail

`/admin/mail` is accessible from the admin dashboard. It uses the existing admin session, not the monitoring read token. All API requests require admin authentication; replies also require same-origin validation and the existing shared database rate limiter (20 attempts/hour, fail closed).

The server reads Resend using the existing `RESEND_MAIL_API_KEY` (Full access). `ADMIN_SESSION_SECRET` signs short-lived reply tickets. No new credentials or migration are required. Existing Gmail forwarding is unchanged.

## Capabilities and limits

- Inbox and sent lists paginate through Resend, scoped to `info@frontier-devconsults.com`. Sent includes forwarding and automated messages from that address. Refresh the list to update delivery status.
- Plain text is displayed without executing email HTML or loading remote images. HTML-only mail must be read via the original email download.
- Authenticated original `.eml` downloads preserve attachments, up to 10 MB. Temporary provider URLs are not exposed to the browser. Downloads remain untrusted files.
- Replies go only to the displayed Reply-To (or From), never Reply All. Ambiguous recipients are refused. The business sender is fixed; thread headers reference the original message.
- Drafts are not persisted. Once sending is attempted, the UI locks the content and retries use the same provider idempotency key. Tickets expire after 23 hours, before Resend's 24-hour idempotency window. After an uncertain result, inspect Sent before creating a new draft; a newly opened reply is a new operation and can duplicate an earlier send.
- Accepted does not mean delivered. Sent shows the provider's last event.
- This is a provider-backed interface, **not a permanent mailbox archive**. Retention and quotas remain subject to the Resend plan. Gmail forwarding remains the separate retained copy of incoming mail. No historical migration, deletion, read/unread state, search, new-message composer, or outgoing attachment uploads are included.

## Validation and activation

Run `npx tsc --noEmit` and `node --test tests/admin-mail.test.mjs tests/mail-forwarding.test.mjs`.

After deployment approval: log in as admin, open Business Mail, confirm the prior test email is visible, download its original, and send one explicitly confirmed reply to the test sender. Verify delivery in that inbox and the Sent status; confirm a new incoming email still forwards to Gmail. Unauthenticated mail API access must return 401. No live reply is sent by the automated tests.

API references: [received list](https://resend.com/docs/api-reference/emails/list-received-emails), [sent list](https://resend.com/docs/api-reference/emails/list-emails), [threaded replies](https://resend.com/docs/dashboard/receiving/reply-to-emails).
