import 'server-only';

const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_LIMIT = 12;

export function allowAssistantRequest(address: string) {
  const now = Date.now();
  const limit = boundedInteger(process.env.OPENAI_ASSISTANT_RATE_LIMIT, DEFAULT_LIMIT, 2, 100);
  const recent = (attempts.get(address) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= limit) { attempts.set(address, recent); return false; }
  recent.push(now); attempts.set(address, recent); return true;
}

export function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value); return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
