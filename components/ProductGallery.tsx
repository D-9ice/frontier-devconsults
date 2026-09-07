'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', close); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [active]);
  if (!images.length) return null;
  return <section aria-labelledby="product-gallery-title"><h2 id="product-gallery-title" className="mb-4 text-2xl font-bold text-gray-900">Product gallery</h2><div className="grid gap-4 sm:grid-cols-2">{images.map((src, index) => <button type="button" key={src} onClick={() => setActive(src)} className="relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-200" aria-label={`Open ${name} screenshot ${index + 1}`}><Image src={src} alt={`${name} interface screenshot ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-contain" /></button>)}</div>{active && <div role="dialog" aria-modal="true" aria-label={`${name} screenshot preview`} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4" onClick={() => setActive(null)}><button type="button" autoFocus onClick={() => setActive(null)} className="absolute right-5 top-5 rounded-full bg-white p-3 text-gray-900" aria-label="Close screenshot preview"><X className="h-6 w-6" /></button><div className="relative h-[82vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}><Image src={active} alt={`${name} enlarged interface screenshot`} fill sizes="100vw" className="object-contain" priority /></div></div>}</section>;
}
