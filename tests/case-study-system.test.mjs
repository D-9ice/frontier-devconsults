import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('case studies link to one authoritative source and migrate records without duplication', async () => {
  const migration = await read('supabase/migrations/202609120020_case_study_system.sql');
  assert.match(migration, /case_studies_one_source/);
  assert.match(migration, /project_id UUID UNIQUE REFERENCES public\.projects/);
  assert.match(migration, /app_id UUID UNIQUE REFERENCES public\.apps/);
  assert.match(migration, /NOT EXISTS \(\s*SELECT 1 FROM public\.case_studies c WHERE c\.slug = lower\(a\.slug\)/s);
  assert.match(migration, /case_studies_client_sale_guard/);
  assert.match(migration, /REVOKE ALL ON public\.case_studies FROM PUBLIC, anon, authenticated/);
});

test('public evidence is approval-controlled and testimonials require verified permission', async () => {
  const model = await read('lib/case-studies.ts');
  assert.match(model, /item\.status === 'approved_for_publication'/);
  assert.match(model, /item\.publicationPermission && item\.verificationState === 'verified'/);
  assert.match(model, /includeDrafts \? mapped\.evidence : filterPublicEvidence/);
  assert.match(model, /Client projects require explicit authorization/);
});

test('public case study pages use structured records and ownership-safe calls to action', async () => {
  const listing = await read('app/projects/page.tsx');
  const detail = await read('app/projects/[slug]/page.tsx');
  assert.match(listing, /listCaseStudies\(false\)/);
  assert.match(listing, /caseStudyAcquisitionEnabled\(item\)/);
  assert.match(listing, /Request a similar build/);
  assert.match(detail, /getPublicCaseStudyBySlug/);
  assert.match(detail, /SoftwareApplication/);
  assert.match(detail, /CreativeWork/);
  assert.match(detail, /item\.sectionOrder/);
  assert.doesNotMatch(detail, /aggregateRating|reviewRating/);
});

test('admin publisher reuses guards, media upload, evidence states and section ordering', async () => {
  const listRoute = await read('app/api/admin/case-studies/route.ts');
  const updateRoute = await read('app/api/admin/case-studies/[id]/route.ts');
  const editor = await read('components/admin/CaseStudyManager.tsx');
  assert.match(listRoute, /requireAdmin\(request\)/);
  assert.match(listRoute, /requireAdminMutation\(request\)/);
  assert.match(updateRoute, /requireAdminMutation\(request\)/);
  assert.match(editor, /<MediaUpload/);
  assert.match(editor, /bucket="project-media"/);
  assert.match(editor, /approved_for_publication/);
  assert.match(editor, /publicationPermission/);
  assert.match(editor, /moveSection/);
});

test('sitemap sources public case-study routes from the publication model', async () => {
  const sitemap = await read('app/sitemap.ts');
  assert.match(sitemap, /listCaseStudies\(false\)/);
  assert.match(sitemap, /caseStudyRoutes/);
});
