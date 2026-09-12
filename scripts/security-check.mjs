import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const textFiles = tracked.filter((file) => !/\.(?:png|jpe?g|gif|webp|ico|woff2?|mp4|webm|pdf|zip)$/i.test(file));
const failures = [];
const report = (file, message) => failures.push(`${file}: ${message}`);

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key material'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/, 'OpenAI-style API key'],
  [/\bre_[A-Za-z0-9_]{20,}\b/, 'Resend-style API key'],
];

for (const file of textFiles) {
  const content = readFileSync(file, 'utf8');
  if (file !== 'scripts/security-check.mjs') for (const [pattern, label] of secretPatterns) if (pattern.test(content)) report(file, `possible ${label}`);
  if (/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE|SERVICE_ROLE|API_KEY)/.test(content)) report(file, 'sensitive environment variable uses the public prefix');
  if (/Access-Control-Allow-Origin['"\s:,]+\*/.test(content)) report(file, 'wildcard CORS policy');
  if (file.startsWith('.github/workflows/')) {
    for (const match of content.matchAll(/^\s*-?\s*uses:\s*([^\s]+)@([^\s#]+)/gm)) {
      if (!/^[0-9a-f]{40}$/.test(match[2])) report(file, `action ${match[1]} is not pinned to a full commit SHA`);
    }
  }
}

const routeFiles = tracked.filter((file) => file.startsWith('app/api/admin/') && file.endsWith('/route.ts'));
for (const file of routeFiles) {
  if (['app/api/admin/login/route.ts', 'app/api/admin/logout/route.ts', 'app/api/admin/session/route.ts'].includes(file)) continue;
  const content = readFileSync(file, 'utf8');
  if (!/requireAdmin(?:Mutation)?\(/.test(content)) report(file, 'admin API route has no server-side administrator guard');
}

const apiFiles = tracked.filter((file) => file.startsWith('app/api/') && file.endsWith('/route.ts'));
for (const file of apiFiles) {
  const content = readFileSync(file, 'utf8');
  if (/request\.json\(\)/.test(content)) report(file, 'unbounded JSON parser is used');
}

if (failures.length) {
  console.error(`Security checks failed (${failures.length}):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`Security checks passed across ${textFiles.length} tracked text files and ${apiFiles.length} API routes.`);
