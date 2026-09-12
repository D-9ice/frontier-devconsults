import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function decodeBase32(value: string) {
  const normalized = value.toUpperCase().replace(/[\s=-]/g, '');
  if (!normalized || [...normalized].some((character) => !BASE32.includes(character))) return null;
  let bits = '';
  for (const character of normalized) bits += BASE32.indexOf(character).toString(2).padStart(5, '0');
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
}

function codeAt(secret: Buffer, counter: number) {
  const input = Buffer.alloc(8);
  input.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', secret).update(input).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code = ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

export function adminMfaConfigured() {
  return Boolean(process.env.ADMIN_TOTP_SECRET?.trim());
}

export function verifyAdminTotp(value: unknown, now = Date.now()) {
  const secret = decodeBase32(process.env.ADMIN_TOTP_SECRET || '');
  if (!secret || secret.length < 10 || typeof value !== 'string' || !/^\d{6}$/.test(value)) return false;
  const supplied = Buffer.from(value);
  const counter = Math.floor(now / 30_000);
  return [-1, 0, 1].some((offset) => timingSafeEqual(supplied, Buffer.from(codeAt(secret, counter + offset))));
}
