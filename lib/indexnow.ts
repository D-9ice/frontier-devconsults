import 'server-only';

import { SITE_HOST, SITE_ORIGIN } from '@/lib/site-url';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEBOUNCE_MS = 5 * 60 * 1000;
const PUBLIC_PREFIXES = ['/services/', '/app-store/', '/projects/'];
const PRIVATE_PREFIXES = ['/admin', '/api', '/acquire', '/acquisition', '/offline', '/upwork-portfolio'];
const STATIC_PUBLIC_PATHS = new Set([
  '/', '/about', '/app-store', '/contact', '/pricing', '/privacy', '/projects',
  '/request-build', '/services', '/services/custom-specialized-solutions', '/terms',
]);

type IndexNowResult = {
  status: 'disabled' | 'skipped' | 'submitted' | 'failed';
  submitted: number;
  httpStatus?: number;
};

const globalCache = globalThis as typeof globalThis & { __frontierIndexNowSubmissions?: Map<string, number> };
const recentSubmissions = globalCache.__frontierIndexNowSubmissions ??= new Map<string, number>();

export function getIndexNowKey() {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

export function normalizeIndexableUrl(value: string) {
  try {
    const url = new URL(value, `${SITE_ORIGIN}/`);
    if (url.protocol !== 'https:' || url.host !== SITE_HOST || url.search || url.hash) return null;
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : '/';
    if (PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return null;
    if (!STATIC_PUBLIC_PATHS.has(path) && !PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix) && path.length > prefix.length)) return null;
    return `${SITE_ORIGIN}${path === '/' ? '' : path}`;
  } catch {
    return null;
  }
}

function comparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !['createdAt', 'updatedAt', 'publishedAt'].includes(key))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => [key, comparable(item)]));
}

export function hasMeaningfulPublicChange(before: unknown, after: unknown) {
  return JSON.stringify(comparable(before)) !== JSON.stringify(comparable(after));
}

export async function submitIndexNow(values: string[]): Promise<IndexNowResult> {
  const key = getIndexNowKey();
  if (!key) return { status: 'disabled', submitted: 0 };

  const now = Date.now();
  const urls = [...new Set(values.map(normalizeIndexableUrl).filter((value): value is string => Boolean(value)))]
    .filter((url) => now - (recentSubmissions.get(url) || 0) >= DEBOUNCE_MS)
    .slice(0, 100);
  if (!urls.length) return { status: 'skipped', submitted: 0 };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        keyLocation: `${SITE_ORIGIN}/indexnow-key.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(6_000),
      cache: 'no-store',
    });
    if (![200, 202].includes(response.status)) {
      console.error('IndexNow submission rejected.', { status: response.status, urlCount: urls.length });
      return { status: 'failed', submitted: 0, httpStatus: response.status };
    }
    urls.forEach((url) => recentSubmissions.set(url, now));
    console.info('IndexNow submission accepted.', { status: response.status, urlCount: urls.length });
    return { status: 'submitted', submitted: urls.length, httpStatus: response.status };
  } catch (error) {
    console.error('IndexNow submission failed without blocking publication.', error instanceof Error ? error.message : 'Unknown error');
    return { status: 'failed', submitted: 0 };
  }
}
