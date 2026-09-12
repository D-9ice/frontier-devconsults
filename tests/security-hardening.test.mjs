import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('public mutation routes enforce origin, bounded JSON and distributed abuse controls', async () => {
  for (const file of ['contact', 'request-build', 'acquisitions', 'specialized-projects']) {
    const source = await read(`app/api/${file}/route.ts`);
    assert.match(source, /requireSameOrigin\(request\)/, file);
    assert.match(source, /readBoundedJson\(request/, file);
    assert.match(source, /await validatePublicSubmission\(request/, file);
  }
  const formProtection = await read('lib/form-protection.ts');
  assert.match(formProtection, /await allow\(`public-form:/);
  assert.doesNotMatch(formProtection, /new Map/);
  const cors = `${await read('app/api/contact/route.ts')}\n${await read('app/api/request-build/route.ts')}`;
  assert.doesNotMatch(cors, /Access-Control-Allow-Origin['"\s:,]+\*/);
});

test('request parsing rejects oversize, malformed, non-object and unexpected-field payloads', async () => {
  const source = await read('lib/request-security.ts');
  assert.match(source, /Request body is too large/);
  assert.match(source, /Invalid JSON body/);
  assert.match(source, /JSON body must be an object/);
  assert.match(source, /Request contains unsupported fields/);
  assert.match(source, /Content-Type must be application\/json/);
});

test('admin APIs are server guarded and state-changing requests require same-origin authorization', async () => {
  const root = new URL('../app/api/admin/', import.meta.url);
  const walk = async (directory) => {
    const routes = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) routes.push(...await walk(new URL(`${entry.name}/`, directory)));
      else if (entry.name === 'route.ts') routes.push(new URL(entry.name, directory));
    }
    return routes;
  };
  const routes = await walk(root);
  for (const url of routes) {
    const path = url.pathname;
    const source = await readFile(url, 'utf8');
    if (path.endsWith('/login/route.ts') || path.endsWith('/logout/route.ts') || path.endsWith('/session/route.ts')) continue;
    assert.match(source, /requireAdmin(?:Mutation)?\(request\)/, path);
    if (/export (?:async )?function (?:POST|PUT|PATCH|DELETE)/.test(source)) assert.match(source, /requireAdminMutation\(request\)/, path);
  }
  const auth = await read('lib/admin-auth.ts');
  for (const value of ["httpOnly: true", "sameSite: 'strict'", "secure: process.env.NODE_ENV === 'production'", 'expiresAt - session.issuedAt']) assert.match(auth, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('administrator login is throttled, fail-closed, MFA-capable and rotates session state', async () => {
  const login = await read('app/api/admin/login/route.ts');
  const change = await read('app/api/admin/change-password/route.ts');
  const totp = await read('lib/totp.ts');
  assert.match(login, /begin_admin_login_attempt/);
  assert.match(login, /if \(error\) throw error/);
  assert.match(login, /adminMfaConfigured\(\).*verifyAdminTotp/);
  assert.match(change, /newPassword\.length < 12/);
  assert.match(change, /clearAdminSession\(response\)/);
  assert.match(totp, /timingSafeEqual/);
});

test('file uploads use canonical names and post-upload signature and size verification', async () => {
  const server = await read('lib/admin-media.ts');
  const route = await read('app/api/admin/media/route.ts');
  const client = await read('components/admin/media-upload.tsx');
  assert.match(server, /crypto\.randomUUID\(\).*extension/);
  for (const signature of ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']) assert.match(server, new RegExp(signature.replace('/', '\\/')));
  assert.match(server, /actualSize !== input\.size/);
  assert.match(server, /matchesSignature/);
  assert.match(server, /remove\(\[input\.path\]\)/);
  assert.match(route, /export async function PATCH/);
  assert.match(client, /setPhase\('verifying'\)/);
});

test('unsafe URL schemes, webhook forgery and user-controlled AI tools are constrained', async () => {
  const projects = await read('lib/projects.ts');
  const apps = await read('lib/apps.ts');
  const webhook = await read('lib/mail-forwarding.ts');
  const assistant = await read('app/api/assistant/route.ts');
  assert.match(projects, /\['http:', 'https:'\]/);
  assert.match(apps, /\['http:', 'https:'\]/);
  assert.match(webhook, /timingSafeEqual/);
  assert.match(webhook, /Math\.abs\(now \/ 1000 - Number\(stamp\)\) > 300/);
  assert.match(assistant, /store: false/);
  assert.doesNotMatch(assistant, /\btools\s*:/);
});

test('database policies, security headers, audit events and CI security checks are enforced', async () => {
  const migration = await read('supabase/migrations/202609090019_security_hardening.sql');
  const priorMigration = await read('supabase/migrations/202609080017_monitoring.sql');
  const headers = await read('next.config.js');
  const ci = await read('.github/workflows/security.yml');
  assert.match(priorMigration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(priorMigration, /REVOKE ALL .* FROM anon,authenticated/);
  assert.match(migration, /monitoring_security_time/);
  assert.match(migration, /jsonb_build_object/);
  for (const header of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options']) assert.match(headers, new RegExp(header));
  assert.match(ci, /npm audit --omit=dev --audit-level=high/);
  assert.match(ci, /npm run check:security/);
  assert.doesNotMatch(ci, /uses: [^\n]+@v\d/);
});
