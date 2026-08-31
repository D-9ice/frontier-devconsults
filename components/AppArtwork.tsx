'use client';

import Image from 'next/image';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';
import type { AppRecord } from '@/lib/apps';

type Props = {
  name?: string;
  src?: string | null;
  app?: AppRecord;
  size?: 'card' | 'detail' | 'case-study';
  variant?: 'card' | 'detail' | 'case-study';
  className?: string;
  priority?: boolean;
  decorative?: boolean;
};

export function approvedPublicMediaUrl(value: string | null) {
  if (!value) return null;
  try {
    const media = new URL(value); const project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid.local');
    return media.protocol === 'https:' && media.hostname === project.hostname && media.pathname.startsWith('/storage/v1/object/public/') ? media.toString() : null;
  } catch { return null; }
}

export default function AppArtwork({ name: suppliedName, src: suppliedSrc, app, size: suppliedSize = 'card', variant, className = '', priority = false, decorative = false }: Props) {
  const name = suppliedName || app?.name || 'Application';
  const src = suppliedSrc === undefined ? app?.thumbnailUrl || app?.iconUrl || null : suppliedSrc;
  const size = variant || suppliedSize;
  const [failed, setFailed] = useState(false); const approved = approvedPublicMediaUrl(src);
  const dimensions = size === 'detail' ? 112 : size === 'case-study' ? 56 : 64;
  if (!approved || failed) return <span className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 ${size === 'detail' ? 'h-28 w-28' : size === 'case-study' ? 'h-14 w-14' : 'h-16 w-16'} ${className}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${name} artwork unavailable`}><Smartphone aria-hidden="true" className={size === 'detail' ? 'h-12 w-12' : 'h-8 w-8'} /></span>;
  return <Image src={approved} alt={decorative ? '' : `${name} icon`} width={dimensions} height={dimensions} sizes={`${dimensions}px`} priority={priority} onError={() => setFailed(true)} className={`shrink-0 rounded-xl border border-gray-100 bg-white object-contain p-1 ${size === 'detail' ? 'h-28 w-28' : size === 'case-study' ? 'h-14 w-14' : 'h-16 w-16'} ${className}`} />;
}
