import 'server-only';

const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_LIMIT = 12;

export function allowAssistantRequest(address: string, session: string) {
  const now = Date.now();
  const limit = boundedInteger(process.env.OPENAI_ASSISTANT_RATE_LIMIT, DEFAULT_LIMIT, 2, 100);
  const ipKey = `ip:${address}`; const sessionKey = `session:${session}`;
  const ipRecent = (attempts.get(ipKey) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  const sessionRecent = (attempts.get(sessionKey) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (ipRecent.length >= limit || sessionRecent.length >= Math.max(2, Math.floor(limit / 2))) { attempts.set(ipKey, ipRecent); attempts.set(sessionKey, sessionRecent); return false; }
  ipRecent.push(now); sessionRecent.push(now); attempts.set(ipKey, ipRecent); attempts.set(sessionKey, sessionRecent); return true;
}

export function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value); return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
