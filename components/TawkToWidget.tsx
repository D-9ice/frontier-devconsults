'use client';

import { useEffect } from 'react';

export default function TawkToWidget() {
  useEffect(() => {
    // Initialize Tawk_API
    var Tawk_API = (window as any).Tawk_API || {};
    var Tawk_LoadStart = new Date();
    (window as any).Tawk_API = Tawk_API;
    (window as any).Tawk_LoadStart = Tawk_LoadStart;

    // Load Tawk.to script
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6925aed008d0cd1961dee87a/1jatj5nme';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }

    console.log('Tawk.to script loaded');

  }, []);

  return null;
}
