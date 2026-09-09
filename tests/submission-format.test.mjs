import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync('lib/submission-format.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { module, exports: module.exports });
const { splitContactMessage, splitBuildDescription, formatEnquiryNotification } = module.exports;

test('contact submissions render a subject and complete message instead of raw JSON', () => {
  assert.deepEqual({ ...splitContactMessage('Subject: Mobile Application\n\nFirst line\nSecond line') }, { subject: 'Mobile Application', message: 'First line\nSecond line' });
  const output = formatEnquiryNotification('contact', { name: 'Isaac', email: 'isaac@example.com', message: 'Subject: Mobile Application\n\nBuild this app.' }, '2026-09-09T10:00:00Z', 'https://example.com/admin');
  assert.match(output, /New Send Us a Message submission/);
  assert.match(output, /Subject: Mobile Application/);
  assert.match(output, /Message:\nBuild this app\./);
  assert.doesNotMatch(output, /"name"|\{|\}/);
});

test('build requests render labeled project information', () => {
  assert.deepEqual({ ...splitBuildDescription('Storefront\n\nBuild it.\n\nPreferred start: Soon') }, { projectName: 'Storefront', description: 'Build it.\n\nPreferred start: Soon' });
  const output = formatEnquiryNotification('build', { name: 'Ava', email: 'ava@example.com', description: 'Storefront\n\nBuild it.' }, 'now', 'https://example.com/admin');
  assert.match(output, /New Request a Build submission/);
  assert.match(output, /Project: Storefront/);
  assert.match(output, /Project details:\nBuild it\./);
});

test('other owner alerts retain their supplied subject and structured details', () => {
  const output = formatEnquiryNotification(null, { subject: 'Daily monitoring summary', views24h: 3 }, 'now', 'https://example.com/admin');
  assert.match(output, /^Daily monitoring summary/);
  assert.match(output, /"views24h": 3/);
});
