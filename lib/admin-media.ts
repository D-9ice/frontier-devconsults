import 'server-only';

import crypto from 'crypto';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export const mediaBuckets = ['project-media', 'app-media', 'site-media'] as const;
export type MediaBucket = typeof mediaBuckets[number];

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);
const maxImageBytes = 8 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;

function getClient() {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    throw new Error('Secure Supabase server access is not configured.');
  }
  return supabaseServer;
}

function isMediaBucket(value: unknown): value is MediaBucket {
  return typeof value === 'string' && mediaBuckets.includes(value as MediaBucket);
}

function cleanFileName(fileName: string) {
  const name = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return name || 'upload';
}

export function validateMediaUpload(input: { bucket?: unknown; fileName?: unknown; contentType?: unknown; size?: unknown }) {
  if (!isMediaBucket(input.bucket)) return 'Choose a valid media bucket.';
  if (typeof input.fileName !== 'string' || !input.fileName.trim()) return 'A file name is required.';
  if (typeof input.contentType !== 'string' || !allowedMimeTypes.has(input.contentType)) return 'Use a JPEG, PNG, WebP, GIF, MP4, or WebM file.';
  if (typeof input.size !== 'number' || !Number.isFinite(input.size) || input.size <= 0) return 'A valid file size is required.';
  const limit = input.contentType.startsWith('video/') ? maxVideoBytes : maxImageBytes;
  if (input.size > limit) return `${input.contentType.startsWith('video/') ? 'Videos' : 'Images'} must be ${limit / 1024 / 1024} MB or smaller.`;
  return null;
}

export async function createMediaUpload(input: { bucket: MediaBucket; fileName: string; contentType: string; size: number }) {
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanFileName(input.fileName)}`;
  const client = getClient();
  const { data, error } = await client.storage.from(input.bucket).createSignedUploadUrl(path, { upsert: false });
  if (error || !data) throw error || new Error('Unable to create media upload URL.');
  const { data: publicUrl } = client.storage.from(input.bucket).getPublicUrl(path);
  return { bucket: input.bucket, path, signedUrl: data.signedUrl, token: data.token, publicUrl: publicUrl.publicUrl };
}

export async function deleteMedia(bucket: MediaBucket, path: string) {
  const { error } = await getClient().storage.from(bucket).remove([path]);
  if (error) throw error;
}
