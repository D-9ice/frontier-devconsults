'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { recordCommercialEvent } from '@/components/CommercialEvent';

type Props = ComponentProps<typeof Link>;

export default function SpecializedCtaLink({ onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        void recordCommercialEvent('specialized_solution_cta_click');
        onClick?.(event);
      }}
    />
  );
}
