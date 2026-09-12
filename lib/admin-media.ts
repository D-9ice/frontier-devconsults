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

const extensionForMime: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm',
};

function validMediaPath(path: string) {
  return /^\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.(?:jpg|png|webp|gif|mp4|webm)$/i.test(path);
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
  const extension = extensionForMime[input.contentType];
  if (!extension) throw new Error('Unsupported media type.');
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
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

function matchesSignature(bytes: Uint8Array, contentType: string) {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (contentType === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  if (contentType === 'image/gif') return ['GIF87a', 'GIF89a'].includes(ascii(0, 6));
  if (contentType === 'video/mp4') return ascii(4, 8) === 'ftyp';
  if (contentType === 'video/webm') return [0x1a, 0x45, 0xdf, 0xa3].every((value, index) => bytes[index] === value);
  return false;
}

async function leadingBytes(response: Response, maximum = 512) {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: number[] = [];
  while (chunks.length < maximum) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(...value.slice(0, maximum - chunks.length));
  }
  await reader.cancel().catch(() => undefined);
  return Uint8Array.from(chunks);
}

export async function verifyMediaUpload(input: { bucket: MediaBucket; path: string; contentType: string; size: number }) {
  const validation = validateMediaUpload({ bucket: input.bucket, fileName: input.path, contentType: input.contentType, size: input.size });
  if (validation || !validMediaPath(input.path) || !input.path.endsWith(`.${extensionForMime[input.contentType]}`)) throw new Error(validation || 'Invalid media path.');
  const client = getClient();
  const slash = input.path.lastIndexOf('/');
  const folder = input.path.slice(0, slash);
  const name = input.path.slice(slash + 1);
  const { data: objects, error: listError } = await client.storage.from(input.bucket).list(folder, { limit: 2, search: name });
  const object = objects?.find((item) => item.name === name);
  const actualSize = Number(object?.metadata?.size);
  if (listError || !object || !Number.isFinite(actualSize) || actualSize !== input.size) {
    await client.storage.from(input.bucket).remove([input.path]);
    throw new Error('Uploaded object size could not be verified.');
  }
  const { data: publicData } = client.storage.from(input.bucket).getPublicUrl(input.path);
  try {
    const response = await fetch(publicData.publicUrl, { headers: { Range: 'bytes=0-511' }, redirect: 'error', signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error('Uploaded object could not be inspected.');
    const bytes = await leadingBytes(response);
    if (!matchesSignature(bytes, input.contentType)) throw new Error('Uploaded content does not match its permitted media type.');
  } catch (error) {
    await client.storage.from(input.bucket).remove([input.path]);
    throw error;
  }
  return { publicUrl: publicData.publicUrl };
}

export function isValidMediaRemoval(bucket: unknown, path: unknown): bucket is MediaBucket {
  return isMediaBucket(bucket)
    && typeof path === 'string'
    && path.length <= 300
    && !path.includes('..')
    && /^\d{4}-\d{2}-\d{2}\/[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|mp4|webm)$/i.test(path);
}
