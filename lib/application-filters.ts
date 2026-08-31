import type { AppRecord } from '@/lib/apps';

export type ApplicationFilters = { search: string; kind: string; lifecycle: string; availability: string };
export function filterApplications(apps: AppRecord[], filters: ApplicationFilters) {
  const query = filters.search.trim().toLowerCase();
  return apps.filter((app) => (!query || [app.name, app.category, app.description, ...app.features, ...app.technologies].join(' ').toLowerCase().includes(query)) && (filters.kind === 'all' || app.solutionKind === filters.kind) && (filters.lifecycle === 'all' || app.lifecycle === filters.lifecycle) && (filters.availability === 'all' || app.availability === filters.availability));
}
export function resultCountLabel(count: number) { return `${count} ${count === 1 ? 'solution' : 'solutions'} found`; }
