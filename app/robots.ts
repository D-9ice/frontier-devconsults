import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/offline',
        '/acquisition/confirmation/',
        '/services/custom-specialized-solutions/confirmation/',
      ],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
