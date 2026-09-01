export type ApplicationFilters = { search: string; kind: string; lifecycle: string; availability: string };
export type FilterableApplication = { name: string; category: string; summary?: string; description?: string; features: string[]; technologies: string[]; solutionKind: string; lifecycle: string; availability: string };
export function filterApplications<T extends FilterableApplication>(apps: T[], filters: ApplicationFilters): T[] {
  const query = filters.search.trim().toLowerCase();
  return apps.filter((app) => (!query || [app.name, app.category, app.summary || app.description || '', ...app.features, ...app.technologies].join(' ').toLowerCase().includes(query)) && (filters.kind === 'all' || app.solutionKind === filters.kind) && (filters.lifecycle === 'all' || app.lifecycle === filters.lifecycle) && (filters.availability === 'all' || app.availability === filters.availability));
}
export function resultCountLabel(count: number) { return `${count} ${count === 1 ? 'solution' : 'solutions'} found`; }
