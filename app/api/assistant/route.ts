import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { assistantInstructions, buildAssistantContext } from '@/lib/assistant-instructions';
import { allowAssistantRequest, boundedInteger } from '@/lib/assistant-rate-limit';
import { sameOrigin, validAssistantSession, validateAssistantMessages } from '@/lib/assistant-safety';
import { listApps } from '@/lib/apps';
import { getPricingSettings } from '@/lib/pricing-store';
import { clientIp, readBoundedJson, sourceHash } from '@/lib/request-security';
import { recordSecurityEvent } from '@/lib/security-monitoring';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const address = clientIp(request);
  const session = request.headers.get('x-frontier-session');
  if (!sameOrigin(request.headers.get('origin'), request.url)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!validAssistantSession(session)) return NextResponse.json({ error: 'Invalid assistant session.' }, { status: 400 });
  if (!await allowAssistantRequest(address, session!)) {
    await recordSecurityEvent(request, { category: 'assistant-rate-limit', severity: 'high', result: 'blocked', alert: true });
    return NextResponse.json({ error: 'Too many assistant requests. Please wait a few minutes and try again.' }, { status: 429 });
  }
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'The assistant is temporarily unavailable.' }, { status: 503 });
  const parsed = await readBoundedJson(request, { maxBytes: 16 * 1024, allowedKeys: ['messages'] });
  if (!parsed.ok) return parsed.response;
  const messages = validateAssistantMessages(parsed.value);
  if (!messages) return NextResponse.json({ error: 'Messages must be a short text conversation.' }, { status: 400 });
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const [apps, pricing] = await Promise.all([listApps(false), getPricingSettings()]);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-5.6-luna';
    const response = await openai.responses.create({
      model, instructions: `${assistantInstructions}\n\nAPPROVED PUBLIC WEBSITE CONTEXT:\n${buildAssistantContext(apps, pricing)}`,
      input: messages.map((message) => ({ role: message.role, content: message.content })),
      reasoning: { effort: reasoningEffort(process.env.OPENAI_REASONING_EFFORT) },
      max_output_tokens: boundedInteger(process.env.OPENAI_ASSISTANT_MAX_OUTPUT_TOKENS, 500, 100, 2000), store: false,
      safety_identifier: createHash('sha256').update(sourceHash(request)).digest('hex').slice(0, 32),
    }, { signal: controller.signal });
    const answer = response.output_text?.trim();
    if (!answer) return NextResponse.json({ error: 'The assistant could not produce a response.' }, { status: 502 });
    return NextResponse.json({ answer }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    console.error('Assistant request failed', { status: status || 'internal', type: error instanceof Error ? error.name : 'unknown' });
    return NextResponse.json({ error: status === 429 ? 'The assistant is busy right now. Please try again later.' : 'The assistant is temporarily unavailable.' }, { status: status === 429 ? 429 : 502 });
  } finally { clearTimeout(timeout); }
}

function reasoningEffort(value: string | undefined): 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max' { return ['none', 'low', 'medium', 'high', 'xhigh', 'max'].includes(value || '') ? value as any : 'low'; }
