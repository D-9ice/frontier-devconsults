export type AssistantMessage = { role: 'user' | 'assistant'; content: string };

export function validateAssistantMessages(value: unknown): AssistantMessage[] | null {
  if (!value || typeof value !== 'object' || !('messages' in value) || !Array.isArray(value.messages) || value.messages.length < 1 || value.messages.length > 8) return null;
  if (Object.keys(value).some((key) => key !== 'messages')) return null;
  const messages: AssistantMessage[] = [];
  for (const item of value.messages) {
    if (!item || typeof item !== 'object' || Object.keys(item).some((key) => !['role', 'content'].includes(key))) return null;
    const role = 'role' in item ? item.role : null; const content = 'content' in item ? item.content : null;
    if (!['user', 'assistant'].includes(String(role)) || typeof content !== 'string' || !content.trim() || content.length > 2000) return null;
    messages.push({ role: role as AssistantMessage['role'], content: content.trim() });
  }
  if (messages.at(-1)?.role !== 'user' || messages.reduce((sum, message) => sum + message.content.length, 0) > 6000) return null;
  return messages;
}

export function validAssistantSession(value: string | null) { return Boolean(value && /^[a-f0-9-]{20,80}$/i.test(value)); }

export function sameOrigin(origin: string | null, requestUrl: string) {
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(requestUrl).origin; } catch { return false; }
}
