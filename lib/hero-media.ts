import 'server-only';

import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export type MediaType = 'image' | 'video';

export type OfficeMediaItem = {
  url: string;
  type: MediaType;
  posterUrl?: string;
};

export type HeroMediaSettings = {
  desktopMediaUrl: string;
  desktopMediaType: MediaType;
  desktopPosterUrl: string;
  mobileMediaUrl: string;
  mobileMediaType: MediaType;
  mobilePosterUrl: string;
  officeMedia: OfficeMediaItem[];
  altText: string;
  overlayStrength: number;
  desktopFocalPosition: string;
  mobileFocalPosition: string;
  enabled: boolean;
  revision: number;
  updatedAt: string | null;
};

export type HeroMediaRevision = {
  id: string;
  settings: HeroMediaSettings;
  action: 'save' | 'restore';
  editorUsername: string;
  createdAt: string;
};

export const defaultHeroMedia: HeroMediaSettings = {
  desktopMediaUrl: '/images/frontier-hero.png',
  desktopMediaType: 'image',
  desktopPosterUrl: '',
  mobileMediaUrl: '/images/frontier-hero-mobile.png',
  mobileMediaType: 'image',
  mobilePosterUrl: '',
  officeMedia: [],
  altText: 'Frontier DevConsults office workspace',
  overlayStrength: 5,
  desktopFocalPosition: 'center 35%',
  mobileFocalPosition: 'center center',
  enabled: false,
  revision: 0,
  updatedAt: null,
};

function client() {
  if (!isSupabaseServerConfigured() || !supabaseServer) throw new Error('Secure Supabase server access is not configured.');
  return supabaseServer;
}

function mediaType(value: unknown): MediaType {
  return value === 'video' ? 'video' : 'image';
}

function officeMedia(value: unknown): OfficeMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.url !== 'string' || !candidate.url) return [];
    return [{ url: candidate.url, type: mediaType(candidate.type), posterUrl: typeof candidate.posterUrl === 'string' ? candidate.posterUrl : undefined }];
  });
}

function mapSettings(row?: Record<string, unknown> | null): HeroMediaSettings {
  if (!row) return defaultHeroMedia;
  return {
    desktopMediaUrl: typeof row.desktop_media_url === 'string' && row.desktop_media_url ? row.desktop_media_url : defaultHeroMedia.desktopMediaUrl,
    desktopMediaType: mediaType(row.desktop_media_type),
    desktopPosterUrl: typeof row.desktop_poster_url === 'string' ? row.desktop_poster_url : '',
    mobileMediaUrl: typeof row.mobile_media_url === 'string' && row.mobile_media_url ? row.mobile_media_url : defaultHeroMedia.mobileMediaUrl,
    mobileMediaType: mediaType(row.mobile_media_type),
    mobilePosterUrl: typeof row.mobile_poster_url === 'string' ? row.mobile_poster_url : '',
    officeMedia: officeMedia(row.office_media),
    altText: typeof row.alt_text === 'string' && row.alt_text ? row.alt_text : defaultHeroMedia.altText,
    overlayStrength: Number.isInteger(row.overlay_strength) ? Number(row.overlay_strength) : defaultHeroMedia.overlayStrength,
    desktopFocalPosition: typeof row.desktop_focal_position === 'string' ? row.desktop_focal_position : defaultHeroMedia.desktopFocalPosition,
    mobileFocalPosition: typeof row.mobile_focal_position === 'string' ? row.mobile_focal_position : defaultHeroMedia.mobileFocalPosition,
    enabled: Boolean(row.enabled),
    revision: Number(row.revision || 0),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

function validUrl(value: string) {
  return value.startsWith('/') || /^https?:\/\//i.test(value);
}

export function validateHeroMedia(input: Partial<HeroMediaSettings>) {
  if (!input.desktopMediaUrl || !validUrl(input.desktopMediaUrl) || !input.mobileMediaUrl || !validUrl(input.mobileMediaUrl)) return 'Provide valid desktop and mobile media URLs.';
  if (!input.altText?.trim()) return 'Alt text is required.';
  if (!['image', 'video'].includes(input.desktopMediaType || '') || !['image', 'video'].includes(input.mobileMediaType || '')) return 'Choose valid media types.';
  if (!Number.isInteger(input.overlayStrength) || (input.overlayStrength ?? -1) < 0 || (input.overlayStrength ?? 100) > 95) return 'Overlay strength must be between 0 and 95.';
  if (!input.desktopFocalPosition?.trim() || !input.mobileFocalPosition?.trim()) return 'Desktop and mobile focal positions are required.';
  if ((input.officeMedia || []).some((item) => !validUrl(item.url) || !['image', 'video'].includes(item.type))) return 'Office media contains an invalid item.';
  return null;
}

function toRow(settings: HeroMediaSettings, revision: number) {
  return {
    id: 'homepage',
    desktop_media_url: settings.desktopMediaUrl,
    desktop_media_type: settings.desktopMediaType,
    desktop_poster_url: settings.desktopPosterUrl || null,
    mobile_media_url: settings.mobileMediaUrl,
    mobile_media_type: settings.mobileMediaType,
    mobile_poster_url: settings.mobilePosterUrl || null,
    office_media: settings.officeMedia,
    alt_text: settings.altText.trim(),
    overlay_strength: settings.overlayStrength,
    desktop_focal_position: settings.desktopFocalPosition.trim(),
    mobile_focal_position: settings.mobileFocalPosition.trim(),
    enabled: settings.enabled,
    revision,
    updated_by: 'admin',
    updated_at: new Date().toISOString(),
  };
}

export async function getHeroMedia() {
  try {
    const { data, error } = await client().from('hero_media_settings').select('*').eq('id', 'homepage').maybeSingle();
    if (error) throw error;
    return mapSettings(data);
  } catch (error) {
    console.error('Hero media fetch failed:', error);
    return defaultHeroMedia;
  }
}

export async function getHeroMediaRevisions() {
  const { data, error } = await client().from('hero_media_revisions').select('*').order('created_at', { ascending: false }).limit(12);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: String(row.id), settings: mapSettings(row.settings as Record<string, unknown>), action: row.action === 'restore' ? 'restore' : 'save',
    editorUsername: String(row.editor_username || 'admin'), createdAt: String(row.created_at),
  }));
}

export async function saveHeroMedia(settings: HeroMediaSettings, action: 'save' | 'restore' = 'save') {
  const existing = await getHeroMedia();
  const nextRevision = existing.revision + 1;
  const { data, error } = await client().from('hero_media_settings').upsert(toRow(settings, nextRevision)).select('*').single();
  if (error) throw error;
  const saved = mapSettings(data);
  const { error: historyError } = await client().from('hero_media_revisions').insert({ settings: saved, action, editor_username: 'admin' });
  if (historyError) throw historyError;
  return saved;
}

export async function restoreHeroMedia(revisionId: string) {
  const { data, error } = await client().from('hero_media_revisions').select('*').eq('id', revisionId).single();
  if (error) throw error;
  return saveHeroMedia(mapSettings(data.settings as Record<string, unknown>), 'restore');
}
