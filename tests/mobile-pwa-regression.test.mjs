import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('mobile clients always use the dedicated hero asset and current Projects source', async () => {
  const home = await read('app/page.tsx');
  const hero = await read('lib/hero-media.ts');
  const projects = await read('app/projects/page.tsx');

  assert.match(hero, /mobileMediaUrl: '\/images\/frontier-hero-mobile\.png'/);
  assert.match(hero, /desktopMediaUrl: '\/images\/frontier-hero\.png'/);
  assert.match(home, /mobileMediaUrl/);
  assert.match(home, /sm:hidden/);
  assert.match(home, /hidden h-full w-full object-cover sm:block/);
  assert.match(projects, /listCaseStudies\(false\)/);
  assert.doesNotMatch(projects, /MacSunny.*Lotto.*C-ZAN/s);
});

test('service worker cannot serve stale page or RSC content to mobile/PWA clients', async () => {
  const sw = await read('public/sw.js');
  const installer = await read('components/PWAInstaller.tsx');
  const tsConfig = await read('next.config.ts');
  const jsConfig = await read('next.config.js');

  assert.match(sw, /frontier-devconsults-v4/);
  assert.doesNotMatch(sw, /PRECACHE_ASSETS/);
  assert.match(sw, /request\.mode === 'navigate'/);
  assert.match(sw, /request\.destination === 'document'/);
  assert.match(sw, /url\.searchParams\.has\('_rsc'\)/);
  assert.match(sw, /request\.destination === 'image'/);
  assert.match(installer, /updateViaCache: 'none'/);
  assert.match(installer, /registration\.update\(\)/);
  assert.match(tsConfig, /source: '\/sw\.js'/);
  assert.match(tsConfig, /no-cache, no-store/);
  assert.match(jsConfig, /source: '\/sw\.js'/);
  assert.match(jsConfig, /no-cache, no-store/);
});
