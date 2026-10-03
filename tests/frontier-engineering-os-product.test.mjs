import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Frontier Engineering OS replaces standalone AI PCB Matrix while preserving its autonomous PCB vision', async () => {
  const migration = await read('supabase/migrations/202610030029_frontier_engineering_os_product_and_case_study.sql');
  const config = await read('next.config.ts');

  assert.match(migration, /name = 'Frontier Engineering OS'/);
  assert.match(migration, /slug = 'frontier-engineering-os'/);
  assert.match(migration, /The All-Inclusive Engineering Workbench/);
  assert.match(migration, /AI PCB Matrix/);
  assert.match(migration, /Autonomous PCB Design Intelligence/);
  assert.match(migration, /natural-language/);
  assert.match(migration, /production-ready PCB/);
  assert.match(migration, /physical hardware has not yet been fabricated, calibrated or certified/i);
  assert.match(migration, /Simulator-generated engineering cases are permanently excluded from AI-training eligibility/);
  assert.match(migration, /available_for_licensing/);

  assert.match(config, /source: '\/app-store\/pcb-matrix'/);
  assert.match(config, /destination: '\/app-store\/frontier-engineering-os'/);
  assert.match(config, /source: '\/projects\/pcb-matrix'/);
  assert.match(config, /destination: '\/projects\/frontier-engineering-os'/);
});
