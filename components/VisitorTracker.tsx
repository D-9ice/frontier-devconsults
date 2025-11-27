'use client';

import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
