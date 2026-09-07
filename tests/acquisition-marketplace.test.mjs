import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('digital product pages expose only owner-enabled acquisition opportunities', async () => {
  const presentation = await read('lib/application-presentation.ts');
  const detail = await read('app/app-store/[slug]/page.tsx');
  const acquire = await read('app/acquire/[slug]/page.tsx');
  assert.match(presentation, /isAcquisitionEnabled/);
  assert.match(presentation, /showInProducts/);
  assert.match(detail, /Acquire This Application/);
  assert.match(detail, /Already implemented/);
  assert.match(detail, /Planned roadmap/);
  assert.match(acquire, /!isAcquisitionEnabled\(app\)/);
  assert.match(acquire, /<AcquisitionForm app=\{app\}/);
});

test('acquisition workflow is persisted server-side with idempotency and references', async () => {
  const migration = await read('supabase/migrations/202609070014_digital_products_acquisition_marketplace.sql');
  const route = await read('app/api/acquisitions/route.ts');
  const validation = await read('lib/acquisitions.ts');
  assert.match(migration, /CREATE TABLE IF NOT EXISTS application_acquisition_requests/);
  assert.match(migration, /idempotency_key UUID NOT NULL UNIQUE/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(route, /eq\('idempotency_key'/);
  assert.match(route, /validatePublicSubmission/);
  assert.match(validation, /FDC-ACQ-/);
});

test('admin acquisition inbox uses authenticated read and same-origin mutation guards', async () => {
  const listRoute = await read('app/api/admin/acquisitions/route.ts');
  const updateRoute = await read('app/api/admin/acquisitions/[id]/route.ts');
  const page = await read('app/admin/(protected)/acquisitions/page.tsx');
  assert.match(listRoute, /requireAdmin\(request\)/);
  assert.match(updateRoute, /requireAdminMutation\(request\)/);
  for (const text of ['Buyer qualification', 'NDA', 'Private demo', 'Negotiation', 'Private internal notes']) assert.equal(page.includes(text), true, text);
});

test('marketplace positioning, attribution and payment presentation are present', async () => {
  const home = await read('app/page.tsx');
  const catalogue = await read('app/app-store/page.tsx');
  const acquisitionLink = await read('components/AcquisitionLink.tsx');
  const form = await read('components/AcquisitionForm.tsx');
  const footer = await read('components/Footer.tsx');
  assert.match(home, /Build from Scratch — or Acquire What’s Already Built/);
  assert.match(catalogue, /Digital Products &amp; Acquisition Opportunities/);
  assert.match(acquisitionLink, /URLSearchParams\(window\.location\.search\)/);
  assert.match(form, /utmSource/);
  assert.match(footer, /Bank Payment/);
});

test('legal pages distinguish an inquiry from a completed transfer', async () => {
  const privacy = await read('app/privacy/page.tsx');
  const terms = await read('app/terms/page.tsx');
  assert.match(privacy, /application acquisition and licensing inquiries/i);
  assert.match(privacy, /Data Retention/);
  assert.match(terms, /does not itself create a purchase agreement/i);
  assert.match(terms, /separate written agreement/i);
});
