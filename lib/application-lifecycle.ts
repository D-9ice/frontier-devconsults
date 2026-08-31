export const lifecycles = ['live', 'in_development', 'planning', 'archived'] as const;
export type Lifecycle = typeof lifecycles[number];

export function normalizeLifecycle(value: unknown): Lifecycle {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['published', 'live', 'production', 'released'].includes(normalized)) return 'live';
  if (['development', 'in_development', 'in_progress'].includes(normalized)) return 'in_development';
  if (['archived', 'retired'].includes(normalized)) return 'archived';
  return 'planning';
}

export function legacyStatus(value: Lifecycle) {
  return value === 'live' ? 'Published' : value === 'in_development' ? 'Development' : value === 'archived' ? 'Archived' : 'Planning';
}
