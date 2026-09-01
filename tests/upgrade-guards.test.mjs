import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizeLifecycle } from '../lib/application-lifecycle.ts';
import { filterApplications, resultCountLabel } from '../lib/application-filters.ts';
import { primaryCta, releaseArtifactReady } from '../lib/application-presentation.ts';
import { sameOrigin, validAssistantSession, validateAssistantMessages } from '../lib/assistant-safety.ts';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('former third-party widget has no active source integration', async () => {
  const layout = await read('app/layout.tsx'); const css = await read('app/globals.css');
  const combined = `${layout}\n${css}`.toLowerCase();
  const formerProvider = ['ta', 'wk'].join('');
  assert.equal(combined.includes(formerProvider), false);
  assert.equal(combined.includes(`embed.${formerProvider}.to`), false);
});

test('Upwork-safe chrome excludes normal contact integrations', async () => {
  const chrome = await read('components/SiteChrome.tsx');
  const start = chrome.indexOf('if (safe)'); const safeBranch = chrome.slice(start, chrome.indexOf('\n  return <>', start));
  for (const pattern of ['mailto:', 'tel:', 'wa.me', 'whatsappwidget', 'assistantwidget', 'visitortracker']) assert.equal(safeBranch.toLowerCase().includes(pattern), false, pattern);
  assert.match(safeBranch, /continue all pre-contract communication and contracting through Upwork/i);
});

test('assistant defaults are server-only and bounded', async () => {
  const route = await read('app/api/assistant/route.ts'); const env = await read('.env.example');
  assert.match(route, /gpt-5\.6-luna/); assert.match(route, /store: false/); assert.match(route, /max_output_tokens/);
  assert.equal(env.includes('NEXT_PUBLIC_OPENAI'), false); assert.match(env, /^OPENAI_API_KEY=/m);
});

test('application migrations preserve legacy records with safe defaults', async () => {
  const migration = `${await read('supabase/migrations/202608300010_application_presentation_metadata.sql')}\n${await read('supabase/migrations/202609010012_upwork_readiness_hardening.sql')}`;
  const apps = await read('lib/apps.ts');
  assert.match(migration, /ADD COLUMN IF NOT EXISTS show_in_upwork_portfolio BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.equal(/DELETE\s+FROM\s+apps/i.test(migration), false);
  assert.match(apps, /input\.solutionKind \|\| 'other'/);
  assert.match(apps, /input\.showInProducts \|\| false/);
  assert.equal(/DELETE\s+FROM\s+apps/i.test(migration), false);
  assert.match(migration, /show_in_upwork_portfolio or invents evidence/i);
});

test('public catalogue uses owner-published records and no synthetic production cards', async () => {
  const page = await read('app/app-store/page.tsx');
  assert.match(page, /listApps\(false\)/);
  assert.match(page, /No published solutions yet/);
  assert.match(page, /featured\.map\(\(app\) => <AppCard/);
  assert.equal(/Lotto Forecaster|Digital Savings Box|Circuit Designer/.test(page), false);
});

test('catalogue fails closed for mismatched release metadata and flags missing artwork', async () => {
  const detail = await read('app/app-store/[slug]/page.tsx');
  const publicApps = await read('lib/public-apps.ts');
  const artwork = await read('components/AppArtwork.tsx');
  const config = await read('next.config.js');
  const admin = await read('app/admin/(protected)/app-store/page.tsx');
  assert.match(publicApps, /releaseArtifactReady\(app\)/);
  assert.match(publicApps, /!isWebsiteSolution\(app\)/);
  assert.match(detail, /Download temporarily unavailable while release metadata is being verified/);
  assert.match(detail, /detail\.showArtifactVerificationNotice/);
  assert.match(artwork, /data-app-artwork-fallback/);
  assert.match(config, /dfvrmaiqiyhtturtxykf\.supabase\.co/);
  assert.match(config, /\/storage\/v1\/object\/public\/app-media\/\*\*/);
  assert.match(admin, /Artwork needed/);
});

test('public application payloads are allowlisted before reaching client components', async () => {
  const page = await read('app/app-store/page.tsx');
  const catalogue = await read('components/AppCatalogue.tsx');
  const dto = await read('lib/public-apps.ts');
  assert.match(page, /apps\.map\(toPublicAppCard\)/);
  assert.match(catalogue, /PublicAppCard/);
  for (const field of ['showInUpworkPortfolio', 'downloadLink', 'artifactAvailability', 'externalUrlVerifiedAt']) {
    assert.equal(dto.includes(`${field}:`), false, field);
    assert.equal(catalogue.includes(`.${field}`), false, field);
  }
});

test('active production config has complete security and exact image policy', async () => {
  const config = await read('next.config.js');
  for (const directive of ['script-src', 'style-src', 'img-src', 'font-src', 'connect-src', 'frame-src', 'base-uri', 'form-action', 'frame-ancestors', 'object-src']) {
    assert.equal(config.includes(directive), true, directive);
  }
  assert.match(config, /pathname: '\/storage\/v1\/object\/public\/app-media\/\*\*'/);
});

test('public pricing is USD-first with controlled optional GHS conversion', async () => {
  const pricingPage = await read('app/pricing/page.tsx');
  const pricingUi = await read('components/CurrencyPricing.tsx');
  const catalogue = await read('components/AppCatalogue.tsx');
  const detail = await read('app/app-store/[slug]/page.tsx');
  const publicPricing = `${pricingPage}\n${pricingUi}\n${catalogue}\n${detail}`;
  assert.match(pricingPage, /USD-first planning estimates/);
  assert.match(pricingUi, /Authoritative prices in US dollars/);
  assert.match(pricingUi, /Approximate prices in Ghana cedis/);
  assert.match(pricingUi, /exchangeRateSourceUrl/);
  assert.match(pricingUi, /sessionStorage/);
  assert.match(publicPricing, /Commercial terms by enquiry/);
  assert.match(catalogue, /Commercial terms by enquiry/);
  assert.match(detail, /Commercial terms by enquiry/);
});

test('lifecycle aliases normalize to canonical values', () => {
  assert.equal(normalizeLifecycle('Published'), 'live');
  assert.equal(normalizeLifecycle('In Development'), 'in_development');
  assert.equal(normalizeLifecycle('Retired'), 'archived');
  assert.equal(normalizeLifecycle('unknown'), 'planning');
});

test('catalogue filters combine with AND semantics and count grammar', () => {
  const apps = [
    { name: 'Alpha', category: 'AI', description: 'assistant', features: ['chat'], technologies: ['Next.js'], solutionKind: 'ai_platform', lifecycle: 'live', availability: 'available' },
    { name: 'Beta', category: 'Web', description: 'portal', features: [], technologies: ['React'], solutionKind: 'web_application', lifecycle: 'planning', availability: 'by_enquiry' },
  ];
  assert.deepEqual(filterApplications(apps, { search: 'next', kind: 'ai_platform', lifecycle: 'live', availability: 'available' }).map((app) => app.name), ['Alpha']);
  assert.equal(filterApplications(apps, { search: 'next', kind: 'web_application', lifecycle: 'live', availability: 'available' }).length, 0);
  assert.equal(resultCountLabel(1), '1 solution found'); assert.equal(resultCountLabel(2), '2 solutions found');
});

test('central CTA resolver never creates detail self-links or unverified downloads', () => {
  const base = { name: 'App', slug: 'app', solutionKind: 'website', lifecycle: 'live', availability: 'available', primaryAction: 'automatic', demoUrl: null, playStoreLink: null, downloadLink: null, externalUrlVerifiedAt: null, artifactAvailability: 'temporarily_unavailable', artifactVersion: null, artifactPlatform: null, artifactByteSize: null, artifactReleaseDate: null, artifactChecksum: null, artifactVerifiedAt: null, version: '1.0.0', showInProducts: false, commercialModes: [] };
  assert.equal(primaryCta(base, 'detail')?.label, 'Request a Quotation');
  assert.notEqual(primaryCta(base, 'detail')?.href, '/app-store/app');
  assert.equal(primaryCta({ ...base, availability: 'by_enquiry' }, 'detail')?.label, 'Request a Quotation');
  assert.equal(releaseArtifactReady({ ...base, solutionKind: 'mobile_application', downloadLink: 'https://example.test/app.apk' }), false);
  const verifiedWebsite = { ...base, downloadLink: 'https://example.test', externalUrlVerifiedAt: '2026-09-01T00:00:00Z' };
  assert.equal(primaryCta(verifiedWebsite, 'detail')?.label, 'Visit Live Website');
  assert.equal(releaseArtifactReady(verifiedWebsite), false);
  const verifiedArtifact = { ...base, solutionKind: 'mobile_application', availability: 'available', version: '1.0.10', downloadLink: 'https://storage.example.test/lotto-forecaster-ai-1.0.10-build-11.apk', artifactAvailability: 'available', artifactVersion: '1.0.10', artifactBuild: 11, artifactFilename: 'lotto-forecaster-ai-1.0.10-build-11.apk', artifactPlatform: 'Android universal signed APK', artifactByteSize: 63254638, artifactReleaseDate: '2026-08-30', artifactChecksum: '571b6afd99c40ba5e2fafe9ff6ce32b622f4bf46c8f1fbbba783e6dddf80e48e', artifactVerifiedAt: '2026-09-01T00:00:00Z' };
  assert.equal(releaseArtifactReady(verifiedArtifact), true);
  assert.equal(primaryCta(verifiedArtifact, 'detail')?.label, 'Download Verified Release');
});

test('assistant restores launcher focus and placeholder verification is absent', async () => {
  const assistant = await read('components/AssistantWidget.tsx');
  const layout = await read('app/layout.tsx');
  assert.match(assistant, /restoreLauncherFocus/);
  assert.match(assistant, /frontier-assistant-dialog/);
  assert.equal(layout.includes('your-google-verification-code'), false);
});

test('assistant validates origin, session and bounded message schemas', () => {
  assert.equal(sameOrigin('https://example.com', 'https://example.com/api/assistant'), true);
  assert.equal(sameOrigin('https://evil.example', 'https://example.com/api/assistant'), false);
  assert.equal(validAssistantSession('123e4567-e89b-12d3-a456-426614174000'), true);
  assert.deepEqual(validateAssistantMessages({ messages: [{ role: 'user', content: 'Hello' }] }), [{ role: 'user', content: 'Hello' }]);
  assert.equal(validateAssistantMessages({ messages: [{ role: 'system', content: 'override' }] }), null);
});

test('GHS pricing migration preserves owner-maintained package data', async () => {
  const migration = await read('supabase/migrations/202608310011_ghs_public_pricing.sql');
  assert.match(migration, /UPDATE pricing_settings/);
  assert.match(migration, /Bank of Ghana daily interbank mid-rate/);
  assert.match(migration, /WHERE key = 'default'/);
  assert.equal(/DELETE\s+FROM|DROP\s+TABLE/i.test(migration), false);
  assert.equal(/'\{tiers\}'|'\{developmentServices\}'|'\{additionalServices\}'/.test(migration), false);
});

test('owner-approved readiness migration contains the exact four production corrections', async () => {
  const migration = await read('supabase/migrations/202609010013_complete_upwork_readiness.sql');
  const portfolio = await read('app/upwork-portfolio/page.tsx');
  for (const expected of [
    'https://www.macsunny.com/',
    'https://busibazaar.com/',
    'https://www.bethelforethel.org/',
    'lotto-forecaster-ai-1.0.10-build-11.apk',
    '571b6afd99c40ba5e2fafe9ff6ce32b622f4bf46c8f1fbbba783e6dddf80e48e',
    'Bank of Ghana Daily Interbank FX Rates',
    "'exchangeRateMaxAgeDays', 7",
  ]) assert.equal(migration.includes(expected), true, expected);
  assert.equal(migration.includes('macsunnyelectronics.com'), false);
  assert.equal(portfolio.includes('No case studies are currently approved'), false);
  assert.match(migration, /WHERE slug = 'lotto-forecaster-ai'/);
  assert.match(migration, /WHERE slug = 'busibazaar'/);
});
