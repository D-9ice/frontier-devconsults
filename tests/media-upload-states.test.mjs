import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('shared media uploader exposes progress, completion, failure, and retry states', async () => {
  const source = await readFile('components/admin/media-upload.tsx', 'utf8');

  assert.match(source, /type UploadPhase = 'idle' \| 'preparing' \| 'uploading' \| 'complete' \| 'error'/);
  assert.match(source, /request\.upload\.onprogress/);
  assert.match(source, /setPhase\('preparing'\)/);
  assert.match(source, /setPhase\('uploading'\)/);
  assert.match(source, /setPhase\('complete'\)/);
  assert.match(source, /setPhase\('error'\)/);
  assert.match(source, /retryFileRef = useRef<File \| null>\(null\)/);
  assert.match(source, />Retry upload/);
  assert.match(source, /role="progressbar"/);
  assert.match(source, /aria-live="assertive"/);
});

test('all admin media forms use the shared uploader', async () => {
  const files = [
    'app/admin/(protected)/projects/page.tsx',
    'app/admin/(protected)/app-store/page.tsx',
    'app/admin/(protected)/hero-media/page.tsx',
  ];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /import \{ MediaUpload \} from '@\/components\/admin\/media-upload'/);
    assert.match(source, /<MediaUpload /);
  }
});
