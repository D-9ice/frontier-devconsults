import 'server-only';
import { createHash } from 'node:crypto';
import { allow } from '@/lib/monitoring';

const DEFAULT_LIMIT = 12;

export async function allowAssistantRequest(address: string, session: string) {
  const limit = boundedInteger(process.env.OPENAI_ASSISTANT_RATE_LIMIT, DEFAULT_LIMIT, 2, 100);
  const ipKey = createHash('sha256').update(address).digest('hex').slice(0, 24);
  const sessionKey = createHash('sha256').update(session).digest('hex').slice(0, 24);
  const [ipAllowed, sessionAllowed] = await Promise.all([
    allow(`assistant:ip:${ipKey}`, limit, 600),
    allow(`assistant:session:${sessionKey}`, Math.max(2, Math.floor(limit / 2)), 600),
  ]);
  return ipAllowed && sessionAllowed;
}

export function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value); return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
