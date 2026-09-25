import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Projects Manager is the authoritative source for public case studies', async () => {
  const [baseMigration, correction] = await Promise.all([
    read('supabase/migrations/202609120020_case_study_system.sql'),
    read('supabase/migrations/202609240025_restore_projects_manager_authority.sql'),
  ]);
  assert.match(baseMigration, /project_id UUID UNIQUE REFERENCES public\.projects/);
  assert.match(baseMigration, /REVOKE ALL ON public\.case_studies FROM PUBLIC, anon, authenticated/);
  assert.match(correction, /case_studies_projects_manager_only/);
  assert.match(correction, /CHECK \(project_id IS NOT NULL AND app_id IS NULL\)/);
  assert.match(correction, /DELETE FROM public\.case_studies/);
  assert.match(correction, /app_id = NULL/);
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
  assert.doesNotMatch(listing, /AcquisitionLink|caseStudyAcquisitionEnabled|listApps/);
  assert.match(listing, /Acquire This Application/);
  assert.match(listing, /Request a Similar Build/);
  assert.match(listing, /item\.commercialState !== 'not_for_sale'/);
  assert.match(detail, /Acquire this application or request a similar build/);
  assert.doesNotMatch(detail, /AcquisitionLink|listApps/);
  assert.match(detail, /getPublicCaseStudyBySlug/);
  assert.match(detail, /SoftwareApplication/);
  assert.match(detail, /CreativeWork/);
  assert.match(detail, /item\.sectionOrder/);
  assert.doesNotMatch(detail, /aggregateRating|reviewRating/);
});

test('admin case-study details are project-only and retain evidence controls', async () => {
  const listRoute = await read('app/api/admin/case-studies/route.ts');
  const updateRoute = await read('app/api/admin/case-studies/[id]/route.ts');
  const editor = await read('components/admin/CaseStudyManager.tsx');
  assert.match(listRoute, /requireAdmin\(request\)/);
  assert.match(listRoute, /requireAdminMutation\(request\)/);
  assert.match(updateRoute, /requireAdminMutation\(request\)/);
  assert.doesNotMatch(listRoute, /listApps/);
  assert.match(editor, /Existing project/);
  assert.doesNotMatch(editor, /Frontier products/);
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
