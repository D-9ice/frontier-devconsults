import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('client maintenance sync is signed, replay-protected, and quarterly', async () => {
  const [sync, api, migration, env, page] = await Promise.all([
    read('lib/client-maintenance.ts'),
    read('app/api/admin/client-maintenance/route.ts'),
    read('supabase/migrations/202609230022_client_maintenance.sql'),
    read('.env.example'),
    read('app/admin/(protected)/client-maintenance/page.tsx'),
  ]);

  assert.match(sync, /createHmac\('sha256'/);
  assert.match(sync, /MAX_SKEW_SECONDS\s*=\s*300/);
  assert.match(sync, /claimMaintenanceNonce/);
  assert.match(migration, /client_maintenance_sync_nonces/);
  assert.match(api, /addCalendarMonths\(completedAt, 3\)/);
  assert.match(api, /interval_months:\s*3/);
  assert.match(env, /^CLIENT_MAINTENANCE_SYNC_SECRET=/m);
  assert.equal(env.includes('NEXT_PUBLIC_CLIENT_MAINTENANCE_SYNC_SECRET'), false);
  assert.match(page, /Quarterly Maintenance Schedule/);
  assert.match(page, /Record Completed Service/);
});
