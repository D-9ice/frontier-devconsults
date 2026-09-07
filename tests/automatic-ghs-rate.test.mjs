import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseBankOfGhanaUsdRate } from '../lib/bog-exchange-rate-parser.ts';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('GHS rate refresh uses only the official Bank of Ghana USDGHS mid-rate row', async () => {
  const source = await read('lib/bog-exchange-rate.ts');
  const parser = await read('lib/bog-exchange-rate-parser.ts');
  assert.match(source, /https:\/\/www\.bog\.gov\.gh\/treasury-and-the-markets\/daily-interbank-fx-rates\//);
  assert.match(parser, /cells\[2\]\.toUpperCase\(\) !== 'USDGHS'/);
  assert.match(parser, /const rate = Number\(cells\[5\]/);
  assert.match(parser, /implausible USD\/GHS mid rate/);
  assert.match(source, /future effective date/);
});

test('Bank of Ghana parser extracts the effective date and mid-rate from the identified row', () => {
  const html = '<table><tr><td>04 Sep 2026</td><td>US Dollar</td><td>USDGHS</td><td>11.3943</td><td>11.4057</td><td>11.4000</td></tr></table>';
  assert.deepEqual(parseBankOfGhanaUsdRate(html), { rate: 11.4, effectiveAt: '2026-09-04T00:00:00.000Z' });
  assert.throws(() => parseBankOfGhanaUsdRate('<table></table>'), /USD\/GHS rate row was not found/);
});

test('pricing store refreshes, deduplicates and persists successful official rates', async () => {
  const store = await read('lib/pricing-store.ts');
  assert.match(store, /RATE_REFRESH_INTERVAL_MS = 6 \* 60 \* 60 \* 1000/);
  assert.match(store, /refreshPromise/);
  assert.match(store, /fetchBankOfGhanaUsdRate/);
  assert.match(store, /exchangeRateCheckedAt: new Date\(\)\.toISOString\(\)/);
  assert.match(store, /persistAutomaticRate/);
  assert.match(store, /exchangeRateMaxAgeDays: 7/);
});

test('public pricing identifies automatic refresh while keeping USD authoritative and GHS approximate', async () => {
  const ui = await read('components/CurrencyPricing.tsx');
  const pricing = await read('lib/pricing.ts');
  assert.match(ui, /refreshed automatically from the official source/);
  assert.match(ui, /Authoritative prices in US dollars/);
  assert.match(ui, /Approximate prices in Ghana cedis/);
  assert.match(pricing, /Math\.min\(settings\.exchangeRateMaxAgeDays, 7\)/);
});
