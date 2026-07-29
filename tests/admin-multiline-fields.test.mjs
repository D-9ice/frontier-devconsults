import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const adminEditors = [
  {
    file: 'app/admin/(protected)/projects/page.tsx',
    fields: ['technologies', 'features'],
  },
  {
    file: 'app/admin/(protected)/app-store/page.tsx',
    fields: ['features', 'requirements', 'screenshotUrls'],
  },
];

for (const editor of adminEditors) {
  test(`${editor.file} preserves newlines while typing and cleans values on save`, async () => {
    const source = await readFile(editor.file, 'utf8');

    assert.match(
      source,
      /function preserveLines\(value: string\) \{ return value\.split\('\\n'\); \}/,
      'typing must preserve trailing blank lines so Enter can move the cursor',
    );
    assert.match(
      source,
      /function cleanLines\(values: string\[\]\) \{ return values\.map\(\(item\) => item\.trim\(\)\)\.filter\(Boolean\); \}/,
      'saved values must still be trimmed and empty entries removed',
    );

    for (const field of editor.fields) {
      assert.match(
        source,
        new RegExp(`update\\('${field}', preserveLines\\(value\\)\\)`),
        `${field} must preserve newlines while editing`,
      );
      assert.match(
        source,
        new RegExp(`${field}: cleanLines\\(form\\.${field}\\)`),
        `${field} must be normalized before saving`,
      );
    }
  });
}
