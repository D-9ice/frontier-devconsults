import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

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
  const safeBranch = chrome.slice(chrome.indexOf('if (safe)'), chrome.indexOf("return <><AdminShortcut"));
  for (const pattern of ['mailto:', 'tel:', 'wa.me', 'whatsappwidget', 'assistantwidget', 'visitortracker']) assert.equal(safeBranch.toLowerCase().includes(pattern), false, pattern);
  assert.match(safeBranch, /continue all pre-contract communication and contracting through Upwork/i);
});

test('assistant defaults are server-only and bounded', async () => {
  const route = await read('app/api/assistant/route.ts'); const env = await read('.env.example');
  assert.match(route, /gpt-5\.6-luna/); assert.match(route, /store: false/); assert.match(route, /max_output_tokens/);
  assert.equal(env.includes('NEXT_PUBLIC_OPENAI'), false); assert.match(env, /^OPENAI_API_KEY=/m);
});

test('application migration preserves legacy records with safe defaults', async () => {
  const migration = await read('supabase/migrations/202608300010_application_presentation_metadata.sql');
  const apps = await read('lib/apps.ts');
  assert.match(migration, /ADD COLUMN IF NOT EXISTS show_in_upwork_portfolio BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.equal(/DELETE\s+FROM\s+apps/i.test(migration), false);
  assert.match(apps, /input\.solutionKind \|\| 'other'/);
  assert.match(apps, /input\.showInProducts \|\| false/);
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
  const admin = await read('app/admin/(protected)/app-store/page.tsx');
  assert.match(detail, /releaseMetadataMatches\(app\)/);
  assert.match(detail, /Download temporarily unavailable while release metadata is being verified/);
  assert.match(detail, /releaseReady && app\.version/);
  assert.match(admin, /Artwork needed/);
});

test('public pricing is Ghana-cedi-only and does not advertise USD amounts', async () => {
  const pricingPage = await read('app/pricing/page.tsx');
  const pricingUi = await read('components/CurrencyPricing.tsx');
  const catalogue = await read('components/AppCatalogue.tsx');
  const detail = await read('app/app-store/[slug]/page.tsx');
  const publicPricing = `${pricingPage}\n${pricingUi}\n${catalogue}\n${detail}`;
  assert.match(pricingPage, /Ghana cedi pricing/);
  assert.match(pricingUi, /Prices shown in Ghana cedis/);
  assert.equal(/formatUsd|currency === 'USD'|USD is the/.test(publicPricing), false);
  assert.match(catalogue, /Commercial terms by enquiry/);
  assert.match(detail, /Commercial terms by enquiry/);
});

test('GHS pricing migration preserves owner-maintained package data', async () => {
  const migration = await read('supabase/migrations/202608310011_ghs_public_pricing.sql');
  assert.match(migration, /UPDATE pricing_settings/);
  assert.match(migration, /Bank of Ghana daily interbank mid-rate/);
  assert.match(migration, /WHERE key = 'default'/);
  assert.equal(/DELETE\s+FROM|DROP\s+TABLE/i.test(migration), false);
  assert.equal(/'\{tiers\}'|'\{developmentServices\}'|'\{additionalServices\}'/.test(migration), false);
});
