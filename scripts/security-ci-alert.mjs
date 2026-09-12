const required = ['RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'];
if (!required.every((name) => process.env[name])) {
  console.error('Security gate alert configuration is incomplete.');
  process.exit(1);
}

const runId = process.env.GITHUB_RUN_ID || 'unknown';
const runAttempt = process.env.GITHUB_RUN_ATTEMPT || '1';
const repository = process.env.GITHUB_REPOSITORY || 'unknown';
const server = process.env.GITHUB_SERVER_URL || 'https://github.com';
const timestamp = new Date().toISOString();
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': `security-gate/${runId}/${runAttempt}`,
  },
  body: JSON.stringify({
    from: process.env.EMAIL_FROM,
    to: [process.env.EMAIL_TO],
    subject: '[HIGH] Frontier security gate failed',
    text: [
      'Frontier DevConsults security gate failure',
      `Timestamp: ${timestamp}`,
      'Category: dependency-or-code-security-gate',
      'Severity: high',
      'Source: GitHub Actions',
      `Correlation ID: ${runId}-${runAttempt}`,
      `Commit: ${(process.env.GITHUB_SHA || 'unknown').slice(0, 40)}`,
      `Review: ${server}/${repository}/actions/runs/${runId}`,
      'No secrets, customer data, or request bodies are included in this alert.',
    ].join('\n'),
  }),
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) throw new Error(`Security alert provider returned HTTP ${response.status}.`);
console.log('Security gate failure alert accepted by provider.');
