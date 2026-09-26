import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('Google and Bing verification use optional genuine server environment values', async () => {
  const [layout, example] = await Promise.all([read('app/layout.tsx'), read('.env.example')]);
  assert.match(layout, /GOOGLE_SITE_VERIFICATION\?\.trim\(\)/);
  assert.match(layout, /BING_SITE_VERIFICATION\?\.trim\(\)/);
  assert.match(layout, /'msvalidate\.01'/);
  assert.doesNotMatch(layout, /google-site-verification=[A-Za-z0-9_-]+/);
  assert.match(example, /^GOOGLE_SITE_VERIFICATION=$/m);
  assert.match(example, /^BING_SITE_VERIFICATION=$/m);
});

test('sitemap uses the canonical HTTPS origin and includes static and dynamic public routes', async () => {
  const [site, sitemap] = await Promise.all([read('lib/site-url.ts'), read('app/sitemap.ts')]);
  assert.match(site, /SITE_ORIGIN = 'https:\/\/frontier-devconsults\.com'/);
  for (const route of ['/privacy', '/terms', '/contact', '/request-build', '/services', '/projects', '/app-store', '/licenses/g-tube']) {
    assert.equal(sitemap.includes(`\`${'${baseUrl}'}${route}\``), true, route);
  }
  assert.match(sitemap, /listApps\(false\)/);
  assert.match(sitemap, /listCaseStudies\(false\)/);
  assert.match(sitemap, /appStoreLastModified/);
  assert.match(sitemap, /projectsLastModified/);
  assert.match(sitemap, /homeLastModified/);
  assert.doesNotMatch(sitemap, /\$\{baseUrl\}\/(?:admin|api|acquire|offline|upwork-portfolio)/);
  assert.doesNotMatch(sitemap, /https:\/\/www\.|localhost/);
});

test('legacy case-study URLs redirect directly to canonical App Store products', async () => {
  const config = await read('next.config.ts');
  for (const slug of ['ai-chitect', 'digital-susu-box', 'family-tree', 'frontier-electronics', 'my-cash-manager', 'scripture-alive', 'livesource-technologies']) {
    assert.equal(config.includes(`'${slug}'`), true, slug);
  }
  assert.match(config, /destination: `https:\/\/frontier-devconsults\.com\/app-store\/\$\{slug\}`/);
});

test('robots permits public crawling, protects private routes, and references the production sitemap', async () => {
  const [robots, vercel] = await Promise.all([read('app/robots.ts'), read('vercel.json')]);
  assert.match(robots, /allow: '\/'/);
  assert.match(robots, /'\/admin\/'/);
  assert.match(robots, /'\/api\/'/);
  assert.match(robots, /\$\{SITE_ORIGIN\}\/sitemap\.xml/);
  assert.equal(JSON.parse(vercel).rewrites, undefined);
  await assert.rejects(access(new URL('public/robots.txt', root)));
});

test('IndexNow is server-only, validates its key, exposes verification, and limits duplicate submissions', async () => {
  const [indexNow, keyRoute, adminRoute, example] = await Promise.all([
    read('lib/indexnow.ts'), read('app/indexnow-key.txt/route.ts'), read('app/api/admin/indexnow/route.ts'), read('.env.example'),
  ]);
  assert.match(indexNow, /import 'server-only'/);
  assert.match(indexNow, /\^\[A-Za-z0-9-\]\{8,128\}\$/);
  assert.match(indexNow, /keyLocation: `\$\{SITE_ORIGIN\}\/indexnow-key\.txt`/);
  assert.match(indexNow, /DEBOUNCE_MS = 5 \* 60 \* 1000/);
  assert.match(indexNow, /\[200, 202\]\.includes\(response\.status\)/);
  assert.match(keyRoute, /getIndexNowKey/);
  assert.match(keyRoute, /'X-Robots-Tag': 'noindex'/);
  assert.match(adminRoute, /requireAdminMutation/);
  assert.match(adminRoute, /submitIndexNow/);
  assert.match(example, /^INDEXNOW_KEY=$/m);
  assert.doesNotMatch(example, /NEXT_PUBLIC_INDEXNOW/);
});

test('publication routes notify IndexNow only after successful public changes', async () => {
  const paths = [
    'app/api/admin/apps/route.ts', 'app/api/admin/apps/[id]/route.ts',
    'app/api/admin/projects/route.ts', 'app/api/admin/projects/[id]/route.ts',
    'app/api/admin/case-studies/route.ts', 'app/api/admin/case-studies/[id]/route.ts',
  ];
  for (const path of paths) assert.match(await read(path), /submitIndexNow/, path);
  for (const path of paths.filter((path) => path.includes('[id]'))) assert.match(await read(path), /hasMeaningfulPublicChange|DELETE/, path);
});

test('structured data uses canonical production URLs and legitimate schema types', async () => {
  const files = await Promise.all([
    read('app/page.tsx'), read('app/services/[slug]/page.tsx'),
    read('app/services/custom-specialized-solutions/page.tsx'), read('app/app-store/[slug]/page.tsx'),
    read('app/projects/[slug]/page.tsx'), read('app/projects/page.tsx'), read('app/app-store/page.tsx'),
  ]);
  const joined = files.join('\n');
  for (const type of ['Organization', 'WebSite', 'Service', 'SoftwareApplication', 'BreadcrumbList', 'CollectionPage', 'ItemList']) assert.equal(joined.includes(`'${type}'`), true, type);
  assert.match(joined, /dateModified/);
  assert.doesNotMatch(joined, /https:\/\/www\.frontier-devconsults\.com|localhost/);
  assert.doesNotMatch(joined, /aggregateRating|reviewCount|award/);
});
