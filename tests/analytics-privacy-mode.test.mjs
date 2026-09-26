import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('privacy-minimized first-party analytics no longer requires banner consent', async () => {
  const tracker = await read('components/VisitorTracker.tsx');
  const route = await read('app/api/track-visitor/route.ts');
  const chrome = await read('components/SiteChrome.tsx');

  assert.doesNotMatch(tracker, /frontier-analytics-consent.*granted/);
  assert.match(tracker, /frontier-first-party-opt-out/);
  assert.match(tracker, /navigator\.doNotTrack/);
  assert.doesNotMatch(route, /body\.consent !== true/);
  assert.doesNotMatch(chrome, /<AnalyticsConsentBanner \/>/);
});

test('GA4 uses advanced consent mode with storage denied by default', async () => {
  const ga = await read('components/GoogleAnalytics.tsx');
  const commercial = await read('components/CommercialEvent.tsx');

  assert.match(ga, /'consent', 'default'/);
  assert.match(ga, /analytics_storage: analyticsStorageGranted\(\) \? 'granted' : 'denied'/);
  assert.match(ga, /ad_storage: 'denied'/);
  assert.match(ga, /ad_user_data: 'denied'/);
  assert.match(ga, /ad_personalization: 'denied'/);
  assert.match(ga, /googletagmanager\.com\/gtag\/js/);
  assert.doesNotMatch(commercial, /frontier-analytics-consent.*granted/);
  assert.match(commercial, /frontier-first-party-opt-out/);
});
