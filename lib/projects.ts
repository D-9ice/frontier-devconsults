import 'server-only';

import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export const projectStatuses = ['Production', 'Development', 'Planning'] as const;
export const projectColors = ['blue', 'green', 'purple', 'orange', 'pink', 'yellow'] as const;

export type ProjectStatus = typeof projectStatuses[number];
export type ProjectColor = typeof projectColors[number];
export type ProjectVisibility = 'draft' | 'published';

export type Project = {
  id: string;
  title: string;
  slug: string | null;
  category: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  featured: boolean;
  sortOrder: number;
  description: string;
  technologies: string[];
  features: string[];
  logoUrl: string | null;
  liveLink: string | null;
  downloadLink: string | null;
  color: ProjectColor;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
  publishedAt?: string | null;
};

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: typeof row.slug === 'string' ? row.slug : null,
    category: String(row.category),
    status: projectStatuses.includes(row.status as ProjectStatus) ? row.status as ProjectStatus : 'Planning',
    visibility: row.visibility === 'published' ? 'published' : 'draft',
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order || 0),
    description: String(row.description),
    technologies: Array.isArray(row.technologies) ? row.technologies.map(String) : [],
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    logoUrl: typeof row.logo_url === 'string' ? row.logo_url : null,
    liveLink: typeof row.live_link === 'string' ? row.live_link : null,
    downloadLink: typeof row.download_link === 'string' ? row.download_link : null,
    color: projectColors.includes(row.color as ProjectColor) ? row.color as ProjectColor : 'blue',
    publishedAt: typeof row.published_at === 'string' ? row.published_at : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toRow(input: ProjectInput) {
  return {
    title: input.title.trim(),
    slug: input.slug?.trim() || null,
    category: input.category.trim(),
    status: input.status,
    visibility: input.visibility,
    featured: input.featured,
    sort_order: input.sortOrder,
    description: input.description.trim(),
    technologies: input.technologies,
    features: input.features,
    logo_url: input.logoUrl?.trim() || null,
    live_link: input.liveLink?.trim() || null,
    download_link: input.downloadLink?.trim() || null,
    color: input.color,
    published_at: input.visibility === 'published' ? input.publishedAt || new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function ensureServer() {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    throw new Error('Secure Supabase server access is not configured.');
  }

  return supabaseServer;
}

export function validateProjectInput(input: Partial<ProjectInput>) {
  if (!input.title?.trim() || !input.category?.trim() || !input.description?.trim()) {
    return 'Title, category, and description are required.';
  }
  if (!projectStatuses.includes(input.status as ProjectStatus)) return 'Choose a valid project status.';
  if (!['draft', 'published'].includes(input.visibility as string)) return 'Choose a valid visibility.';
  if (!projectColors.includes(input.color as ProjectColor)) return 'Choose a valid project color.';
  if (typeof input.sortOrder !== 'number' || !Number.isInteger(input.sortOrder) || input.sortOrder < 0) return 'Sort order must be a non-negative whole number.';
  return null;
}

export async function listProjects(includeDrafts = true) {
  const client = ensureServer();
  let query = client.from('projects').select('*').order('sort_order').order('updated_at', { ascending: false });
  if (!includeDrafts) query = query.eq('visibility', 'published');
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => mapProject(row));
}

export async function createProject(input: ProjectInput) {
  const client = ensureServer();
  const { data, error } = await client.from('projects').insert(toRow(input)).select('*').single();
  if (error) throw error;
  return mapProject(data);
}

export async function updateProject(id: string, input: ProjectInput) {
  const client = ensureServer();
  const { data, error } = await client.from('projects').update(toRow(input)).eq('id', id).select('*').single();
  if (error) throw error;
  return mapProject(data);
}

export async function deleteProject(id: string) {
  const client = ensureServer();
  const { error } = await client.from('projects').delete().eq('id', id);
  if (error) throw error;
}
