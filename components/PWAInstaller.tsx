'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }

    // Handle install prompt
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button/banner (optional)
      // You can create a custom install UI here
      console.log('PWA install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      deferredPrompt = null;
    });

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running as installed PWA');
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('Back online');
      // You can show a toast notification here
    };

    const handleOffline = () => {
      console.log('Gone offline');
      // You can show a toast notification here
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
