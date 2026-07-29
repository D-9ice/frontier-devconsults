import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const guardedRoutes = [
  {
    file: 'app/api/admin/pricing/route.ts',
    handlers: { GET: 'requireAdmin', PUT: 'requireAdminMutation' },
  },
  {
    file: 'app/api/admin/projects/route.ts',
    handlers: { GET: 'requireAdmin', POST: 'requireAdminMutation' },
  },
  {
    file: 'app/api/admin/hero-media/route.ts',
    handlers: { GET: 'requireAdmin', PUT: 'requireAdminMutation' },
  },
];

function getHandlerSource(source, method) {
  const start = source.indexOf(`export async function ${method}`);
  assert.notEqual(start, -1, `${method} handler is missing`);

  const nextHandler = source.indexOf('export async function ', start + 1);
  return source.slice(start, nextHandler === -1 ? source.length : nextHandler);
}

for (const route of guardedRoutes) {
  test(`${route.file} uses the correct read/write guards`, async () => {
    const source = await readFile(route.file, 'utf8');

    for (const [method, guard] of Object.entries(route.handlers)) {
      const handler = getHandlerSource(source, method);
      assert.match(handler, new RegExp(`\\b${guard}\\(request\\)`));

      if (guard === 'requireAdmin') {
        assert.doesNotMatch(handler, /\brequireAdminMutation\(request\)/);
      }
    }
  });
}
