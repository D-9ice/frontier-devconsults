import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('specialized service has approved positioning, integrated scope and truthful examples', async () => {
  const page = await read('app/services/custom-specialized-solutions/page.tsx');
  assert.match(page, /We Don&apos;t Just Build Software\. We Build the Systems Software Controls\./);
  assert.match(page, /Electronics\. Electrical Engineering\. Embedded Intelligence\. Software\. One Integrated Solution\./);
  for (const phrase of ['Electronics & PCB Engineering', 'Electrical & Energy Systems', 'Embedded Intelligence', 'Control & Automation', 'Monitoring & Diagnostics', 'Connected & IoT Systems', 'Retrofit & Modernization', 'Industrial & OEM Support']) assert.equal(page.includes(phrase), true, phrase);
  assert.match(page, /Representative Capability/);
  assert.match(page, /not claims that each system is a completed client case study/);
  assert.match(page, /Safety, compliance, and certification/);
});

test('specialized project intake is secure, validated, attributable and idempotent', async () => {
  const form = await read('components/SpecializedProjectForm.tsx');
  const route = await read('app/api/specialized-projects/route.ts');
  const validation = await read('lib/specialized-requests.ts');
  const migration = await read('supabase/migrations/202609070015_custom_specialized_solutions.sql');
  assert.match(form, /Need Frontier Assessment/);
  assert.match(form, /utmSource/);
  assert.match(form, /privacyAcknowledged/);
  assert.doesNotMatch(form, /type="file"/);
  assert.match(route, /requireSameOrigin/);
  assert.match(route, /validatePublicSubmission/);
  assert.match(route, /eq\('idempotency_key'/);
  assert.match(validation, /FDC-SPEC-/);
  assert.match(migration, /idempotency_key UUID NOT NULL UNIQUE/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
});

test('specialized request administration is authenticated and workflow complete', async () => {
  const list = await read('app/api/admin/specialized-requests/route.ts');
  const update = await read('app/api/admin/specialized-requests/[id]/route.ts');
  const page = await read('app/admin/(protected)/specialized-requests/page.tsx');
  assert.match(list, /requireAdmin\(request\)/);
  assert.match(update, /requireAdminMutation\(request\)/);
  for (const phrase of ['Status', 'Feasibility', 'Consultation', 'Assigned follow-up', 'Internal notes', 'Complete technical intake']) assert.equal(page.includes(phrase), true, phrase);
});

test('specialized service is discoverable without displacing digital products', async () => {
  const home = await read('app/page.tsx');
  const services = await read('app/services/page.tsx');
  const footer = await read('components/Footer.tsx');
  const sitemap = await read('app/sitemap.ts');
  for (const source of [home, services, footer, sitemap]) assert.match(source, /\/services\/custom-specialized-solutions/);
  assert.match(home, /Explore Digital Products/);
  assert.match(home, /Building Digital Excellence/);
});

test('specialized analytics and legal disclosures are present', async () => {
  const events = await read('app/api/commercial-events/route.ts');
  const privacy = await read('app/privacy/page.tsx');
  const terms = await read('app/terms/page.tsx');
  for (const event of ['specialized_solution_page_view', 'specialized_solution_cta_click', 'specialized_project_form_started', 'specialized_project_form_submitted']) assert.equal(events.includes(event), true, event);
  assert.match(privacy, /specialized-engineering/);
  assert.match(terms, /not a certification, statutory approval, final safety determination/i);
});
