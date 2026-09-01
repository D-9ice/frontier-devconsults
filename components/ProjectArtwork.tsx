'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  title: string;
  src?: string | null;
  className?: string;
};

const LOTTO_ARTWORK = '/logos/lotto-forecaster-ai.png';

function resolvedArtwork(title: string, src?: string | null) {
  return title.trim().toLowerCase() === 'lotto forecaster ai' ? LOTTO_ARTWORK : src?.trim() || null;
}

export default function ProjectArtwork({ title, src, className = 'h-16 w-16' }: Props) {
  const artwork = resolvedArtwork(title, src);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [artwork]);

  if (!artwork || failed) {
    return (
      <span
        data-project-artwork-fallback={title}
        role="img"
        aria-label={`${title} artwork unavailable`}
        className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 ${className}`}
      >
        <BriefcaseBusiness aria-hidden="true" className="h-8 w-8" />
      </span>
    );
  }

  return (
    <img
      data-project-artwork={title}
      src={artwork}
      alt={`${title} logo`}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-xl border border-gray-100 bg-white object-contain p-1 ${className}`}
    />
  );
}
