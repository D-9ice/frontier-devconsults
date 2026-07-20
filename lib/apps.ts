import 'server-only';

import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export const appStatuses = ['Published', 'Development', 'Planning'] as const;
export type AppStatus = typeof appStatuses[number];
export type AppVisibility = 'draft' | 'published';

export type AppRecord = {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  version: string;
  size: string | null;
  rating: number | null;
  downloads: string | null;
  description: string;
  features: string[];
  requirements: string[];
  iconUrl: string | null;
  screenshotUrls: string[];
  videoUrl: string | null;
  playStoreLink: string | null;
  downloadLink: string | null;
  status: AppStatus;
  visibility: AppVisibility;
  featured: boolean;
  sortOrder: number;
};

function ensureServer() {
  if (!isSupabaseServerConfigured() || !supabaseServer) throw new Error('Secure Supabase server access is not configured.');
  return supabaseServer;
}

function mapApp(row: Record<string, unknown>): AppRecord {
  return {
    id: String(row.id), name: String(row.name), slug: typeof row.slug === 'string' ? row.slug : null,
    category: String(row.category), version: String(row.version), size: typeof row.size === 'string' ? row.size : null,
    rating: typeof row.rating === 'number' ? row.rating : Number.isFinite(Number(row.rating)) ? Number(row.rating) : null,
    downloads: typeof row.downloads === 'string' ? row.downloads : null, description: String(row.description),
    features: Array.isArray(row.features) ? row.features.map(String) : [], requirements: Array.isArray(row.requirements) ? row.requirements.map(String) : [],
    iconUrl: typeof row.icon_url === 'string' ? row.icon_url : null, screenshotUrls: Array.isArray(row.screenshot_urls) ? row.screenshot_urls.map(String) : [],
    videoUrl: typeof row.video_url === 'string' ? row.video_url : null, playStoreLink: typeof row.play_store_link === 'string' ? row.play_store_link : null,
    downloadLink: typeof row.download_link === 'string' ? row.download_link : null, status: appStatuses.includes(row.status as AppStatus) ? row.status as AppStatus : 'Planning',
    visibility: row.visibility === 'published' ? 'published' : 'draft', featured: Boolean(row.featured), sortOrder: Number(row.sort_order || 0),
  };
}

function row(input: Omit<AppRecord, 'id'>) {
  return {
    name: input.name.trim(), slug: input.slug?.trim() || null, category: input.category.trim(), version: input.version.trim(), size: input.size?.trim() || null,
    rating: input.rating, downloads: input.downloads?.trim() || null, description: input.description.trim(), features: input.features, requirements: input.requirements,
    icon_url: input.iconUrl?.trim() || null, screenshot_urls: input.screenshotUrls, video_url: input.videoUrl?.trim() || null,
    play_store_link: input.playStoreLink?.trim() || null, download_link: input.downloadLink?.trim() || null, status: input.status,
    visibility: input.visibility, featured: input.featured, sort_order: input.sortOrder,
    published_at: input.visibility === 'published' ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
  };
}

export function validateApp(input: Partial<Omit<AppRecord, 'id'>>) {
  if (!input.name?.trim() || !input.category?.trim() || !input.version?.trim() || !input.description?.trim()) return 'Name, category, version, and description are required.';
  if (!appStatuses.includes(input.status as AppStatus)) return 'Choose a valid app status.';
  if (!['draft', 'published'].includes(input.visibility as string)) return 'Choose a valid visibility.';
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) return 'Sort order must be a non-negative whole number.';
  if (input.rating !== null && input.rating !== undefined && (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5)) return 'Rating must be between 0 and 5.';
  return null;
}

export async function listApps(includeDrafts = true) {
  const client = ensureServer();
  let query = client.from('apps').select('*').order('sort_order').order('updated_at', { ascending: false });
  if (!includeDrafts) query = query.eq('visibility', 'published');
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((item) => mapApp(item));
}

export async function createApp(input: Omit<AppRecord, 'id'>) {
  const { data, error } = await ensureServer().from('apps').insert(row(input)).select('*').single();
  if (error) throw error;
  return mapApp(data);
}

export async function updateApp(id: string, input: Omit<AppRecord, 'id'>) {
  const { data, error } = await ensureServer().from('apps').update(row(input)).eq('id', id).select('*').single();
  if (error) throw error;
  return mapApp(data);
}

export async function deleteApp(id: string) {
  const { error } = await ensureServer().from('apps').delete().eq('id', id);
  if (error) throw error;
}
