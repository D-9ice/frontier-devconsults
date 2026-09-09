# Incoming mail forwarding

Endpoint: `POST /api/webhooks/resend`. Subscribe only to `email.received`.

Production configuration (never put credentials in Git or chat):
- `RESEND_MAIL_API_KEY`: dedicated Resend key allowed to retrieve received mail and send mail.
- `RESEND_WEBHOOK_SECRET`: signing secret from this webhook.
- Existing `EMAIL_FROM`: verified business sender.
- Existing `EMAIL_TO`: fixed external owner mailbox; no fallback destination.

Deploy after setting credentials. Preserve the existing `RESEND_API_KEY` and notification configuration.
Create the webhook at `https://www.frontier-devconsults.com/api/webhooks/resend`.
Confirm the destination privately before activation. Send a fresh labelled test,
verify webhook HTTP 200, and confirm receipt in Gmail with the original.eml attachment.
Test a small attachment and replay the same event within 23 hours: only one forward
should arrive. Provider acceptance is not proof of inbox delivery.

Forwarding is limited to info@frontier-devconsults.com. Signatures and timestamps
are checked before API access. Original mail is attached as EML (including original
attachments); plain text is shown in the forwarding body. No HTML is executed by
our application. Treat all incoming content and attachments as untrusted.

Resend idempotency prevents duplicates for 24 hours; mail older than 23 hours is
rejected for manual review instead of risking duplicate sends. Failed attempts
return non-2xx for provider retries. This is not an indefinite durable queue:
inspect failed webhook attempts in Resend. Raw messages over 10 MiB require
manual retrieval from Resend and will not be forwarded automatically. The handler
does not delete originals. Provider retention and free-plan quotas still apply;
receiving and forwarding both consume quota. No historical backfill is performed.

Business-address replies, spam classification, and a hosted mailbox are not part
of this handler. Gmail replies are not configured to send as the business address.
