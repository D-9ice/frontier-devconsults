'use client';

import { useEffect } from 'react';
import { recordCommercialEvent } from '@/components/CommercialEvent';

export default function SpecializedAnalytics() {
  useEffect(() => {
    void recordCommercialEvent('specialized_solution_page_view');

    const seen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        const eventName = entry.target.hasAttribute('data-specialized-example')
          ? 'specialized_example_view'
          : 'specialized_capability_view';
        void recordCommercialEvent(eventName);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('[data-specialized-capability], [data-specialized-example]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
