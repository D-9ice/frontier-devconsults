'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { recordCommercialEvent } from '@/components/CommercialEvent';

export default function AcquisitionLink({ slug, className, children }: { slug: string; className: string; children: React.ReactNode }) {
  const [href, setHref] = useState(`/acquire/${encodeURIComponent(slug)}`);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const suffix = query.toString();
    setHref(`/acquire/${encodeURIComponent(slug)}${suffix ? `?${suffix}` : ''}`);
  }, [slug]);
  return <Link href={href} onClick={() => recordCommercialEvent('acquisition_cta_click', slug)} className={className}>{children}</Link>;
}
