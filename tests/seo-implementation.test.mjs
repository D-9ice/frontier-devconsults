import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('homepage has Ghana-first commercial metadata and truthful organization schema', async () => {
  const layout = await read('app/layout.tsx');
  const home = await read('app/page.tsx');
  assert.match(layout, /Custom Software & Embedded Systems Development \| Accra, Ghana/);
  assert.match(layout, /lang="en-GH"/);
  assert.match(layout, /canonical: '\/'/);
  assert.doesNotMatch(layout, /['"]front['"]|['"]dev['"]/i);
  assert.match(home, /ProfessionalService/);
  for (const phrase of ['Ghana', 'Africa', 'Worldwide', 'Custom software development', 'Embedded systems', 'IoT engineering']) assert.equal(home.includes(phrase), true, phrase);
  assert.match(home, /<h1[^>]*>[\s\S]*Custom Software &amp; Embedded Systems Development/);
  assert.doesNotMatch(home, /Transforming ideas into production-ready applications from our Accra office/);
  assert.match(home, /Mobile apps, web platforms, AI integrations, and engineering solutions—from planning and implementation through validation and deployment/);
  assert.doesNotMatch(home, /<h1[^>]*whitespace-nowrap/);
});

test('indexable static pages have self-referencing canonicals and private utility pages are noindex', async () => {
  const pages = [
    ['app/about/page.tsx', '/about'], ['app/contact/layout.tsx', '/contact'], ['app/request-build/layout.tsx', '/request-build'],
    ['app/privacy/page.tsx', '/privacy'], ['app/terms/page.tsx', '/terms'],
  ];
  for (const [path, canonical] of pages) assert.equal((await read(path)).includes(`canonical: '${canonical}'`), true, path);
  assert.match(await read('app/admin/layout.tsx'), /index: false/);
  assert.match(await read('app/offline/layout.tsx'), /index: false/);
});

test('commercial service clusters have landing pages, internal links, schema, and sitemap entries', async () => {
  const slugs = ['custom-software-development-ghana', 'flutter-mobile-app-development-ghana', 'web-application-development-ghana', 'ai-integration-africa', 'embedded-iot-engineering'];
  const route = await read('app/services/[slug]/page.tsx');
  const services = await read('app/services/page.tsx');
  const sitemap = await read('app/sitemap.ts');
  for (const slug of slugs) {
    assert.equal(route.includes(`'${slug}'`), true, `${slug} route`);
    assert.equal(services.includes(`/services/${slug}`), true, `${slug} internal link`);
    assert.equal(sitemap.includes(`'${slug}'`), true, `${slug} sitemap`);
  }
  assert.match(route, /'@type': 'Service'/);
  assert.match(route, /'@type': 'BreadcrumbList'/);
  assert.match(route, /alternates: \{ canonical \}/);
});

test('SEO operations document separates code delivery from owner-account activation', async () => {
  const operations = await read('docs/seo-operations.md');
  for (const item of ['Google Search Console', 'Bing Webmaster Tools', 'Google Business Profile', 'Core Web Vitals', 'Publishing cadence']) assert.equal(operations.includes(item), true, item);
  assert.match(operations, /cannot be completed from source code alone/);
});
