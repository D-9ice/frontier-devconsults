import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const baseUrl = (process.env.PUBLIC_SITE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : 'google-chrome');
const screenshotDir = process.env.SCREENSHOT_DIR || '';
const profile = await mkdtemp(path.join(os.tmpdir(), 'frontier-ui-audit-'));
const browser = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

let stderr = '';
const endpoint = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Chrome did not expose DevTools. ${stderr}`)), 15_000);
  browser.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) { clearTimeout(timer); resolve(match[1]); }
  });
  browser.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Chrome exited early with ${code}. ${stderr}`)); });
});

const socket = new WebSocket(endpoint);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let sequence = 0;
const pending = new Map();
const events = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    return;
  }
  events.push(message);
});

function send(method, params = {}, sessionId) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
  return result.result.value;
}

async function navigate(url) {
  await send('Page.navigate', { url }, sessionId);
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (await evaluate('document.readyState === "complete"')) { await delay(500); return; }
    await delay(100);
  }
  throw new Error(`Timed out loading ${url}`);
}

async function screenshot(name) {
  if (!screenshotDir) return;
  await mkdir(screenshotDir, { recursive: true });
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
  await writeFile(path.join(screenshotDir, `${name}.png`), Buffer.from(result.data, 'base64'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const attached = await send('Target.attachToTarget', { targetId, flatten: true });
const sessionId = attached.sessionId;
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Log.enable', {}, sessionId);

try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false }, sessionId);
  await navigate(`${baseUrl}/app-store`);
  const catalogue = await evaluate(`(async () => {
    for (let top = 0; top < document.documentElement.scrollHeight; top += Math.max(320, innerHeight * 0.75)) {
      scrollTo(0, top); await new Promise((resolve) => setTimeout(resolve, 120));
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    const images = [...document.querySelectorAll('img[data-app-artwork]')];
    const fallbacks = [...document.querySelectorAll('[data-app-artwork-fallback]')];
    const cards = [...new Set([...document.querySelectorAll('[data-app-card]')].map((item) => item.dataset.appCard))];
    return {
      cards,
      uniqueArtwork: [...new Set(images.map((image) => image.dataset.appArtwork))],
      failed: images.filter((image) => image.naturalWidth <= 0).map((image) => image.dataset.appArtwork),
      fallbacks: fallbacks.map((item) => item.dataset.appArtworkFallback),
      optimized: images.map((image) => ({ name: image.dataset.appArtwork, src: image.currentSrc, width: image.naturalWidth, type: image.src.endsWith('.webp') ? 'webp' : image.src.endsWith('.png') ? 'png' : 'other' })),
    };
  })()`);
  assert(catalogue.cards.length === 18, `Expected 18 unique app cards, found ${catalogue.cards.length}.`);
  assert(catalogue.uniqueArtwork.length === 18, `Expected 18 unique app artworks, found ${catalogue.uniqueArtwork.length}.`);
  assert(catalogue.failed.length === 0, `Artwork has zero natural width: ${catalogue.failed.join(', ')}`);
  assert(catalogue.fallbacks.length === 0, `Artwork fallbacks rendered: ${catalogue.fallbacks.join(', ')}`);
  assert(catalogue.optimized.every((item) => item.src.includes('/_next/image?url=')), 'At least one app artwork bypassed the Next image optimizer.');
  const png = catalogue.optimized.find((item) => item.type === 'png');
  const webp = catalogue.optimized.find((item) => item.type === 'webp');
  assert(png && webp, 'The catalogue must exercise at least one PNG and one WebP source.');
  for (const sample of [png, webp]) {
    const response = await fetch(sample.src);
    assert(response.ok && response.headers.get('content-type')?.startsWith('image/'), `${sample.type.toUpperCase()} optimizer request failed with ${response.status}.`);
  }
  await screenshot('app-store-1440');

  for (const slug of catalogue.cards) {
    await navigate(`${baseUrl}/app-store/${encodeURIComponent(slug)}`);
    const detail = await evaluate(`(() => {
      const image = document.querySelector('img[data-app-artwork][data-app-artwork-surface="detail"]');
      return { image: Boolean(image), width: image?.naturalWidth || 0, fallback: Boolean(document.querySelector('[data-app-artwork-fallback]')) };
    })()`);
    assert(detail.image && detail.width > 0 && !detail.fallback, `Detail artwork failed for ${slug}.`);
  }

  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 }, sessionId);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
    await navigate(`${baseUrl}/app-store`);
    const layout = await evaluate(`(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }))()`);
    assert(!layout.overflow, `Horizontal overflow at ${width}px.`);
    assert(layout.reducedMotion, `Reduced-motion preference was not applied at ${width}px.`);
    await screenshot(`app-store-${width}`);
  }

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, sessionId);
  await navigate(baseUrl);
  const widgets = await evaluate(`(() => {
    const first = document.querySelector('[aria-label^="Open WhatsApp"]')?.getBoundingClientRect();
    const second = document.querySelector('[aria-label="Open Frontier Assistant"]')?.getBoundingClientRect();
    const overlap = first && second && !(first.right <= second.left || second.right <= first.left || first.bottom <= second.top || second.bottom <= first.top);
    return { present: Boolean(first && second), overlap: Boolean(overlap) };
  })()`);
  assert(widgets.present && !widgets.overlap, 'Floating widgets are missing or overlap at 390px.');
  const focus = await evaluate(`(async () => {
    const launcher = document.querySelector('[aria-label="Open Frontier Assistant"]');
    launcher?.click(); await new Promise((resolve) => setTimeout(resolve, 100));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));
    return document.activeElement === launcher;
  })()`);
  assert(focus, 'Assistant focus did not return to its launcher after Escape.');

  const siteErrors = events.filter((event) => event.method === 'Runtime.exceptionThrown' || (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error'));
  assert(siteErrors.length === 0, `Browser reported ${siteErrors.length} site error(s).`);
  console.log(`Production UI passed: 18 card artworks, 18 detail artworks, PNG/WebP optimization, six responsive widths, reduced motion, widget spacing, and assistant focus at ${baseUrl}.`);
  if (screenshotDir) console.log(`Screenshots: ${screenshotDir}`);
} finally {
  try { await send('Browser.close'); } catch { browser.kill('SIGTERM'); }
  socket.close();
  if (browser.exitCode === null) {
    await Promise.race([
      new Promise((resolve) => browser.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
