'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let reloading = false;
      const onControllerChange = () => {
        if (reloading || sessionStorage.getItem('frontier-sw-refreshed') === '1') return;
        reloading = true;
        sessionStorage.setItem('frontier-sw-refreshed', '1');
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
          await registration.update();
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      if (document.readyState === 'complete') void register();
      else window.addEventListener('load', register, { once: true });

      const refreshOnVisible = () => {
        if (document.visibilityState === 'visible') {
          void navigator.serviceWorker.getRegistration('/').then((registration) => registration?.update());
        }
      };
      document.addEventListener('visibilitychange', refreshOnVisible);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        document.removeEventListener('visibilitychange', refreshOnVisible);
      };
    }
  }, []);

  return null;
}
