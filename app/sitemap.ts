import { MetadataRoute } from 'next'
import { listApps } from '@/lib/apps';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.frontier-devconsults.com';
  const staticLastModified = new Date('2026-08-31T00:00:00.000Z');
  const seoLastModified = new Date('2026-09-09T00:00:00.000Z');
  let appRoutes: MetadataRoute.Sitemap = [];
  try {
    const apps = await listApps(false);
    appRoutes = apps.filter((app) => app.slug).flatMap((app) => [
      { url: `${baseUrl}/app-store/${app.slug}`, lastModified: new Date(app.updatedAt), changeFrequency: 'weekly' as const, priority: 0.7 },
      ...(app.showInProjects ? [{ url: `${baseUrl}/projects/${app.slug}`, lastModified: new Date(app.updatedAt), changeFrequency: 'monthly' as const, priority: 0.7 }] : []),
    ]);
  } catch { /* Static routes remain available when the content store is offline. */ }

  return [
    {
      url: baseUrl,
      lastModified: seoLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: seoLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/custom-specialized-solutions`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...['custom-software-development-ghana', 'flutter-mobile-app-development-ghana', 'web-application-development-ghana', 'ai-integration-africa', 'embedded-iot-engineering'].map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified: seoLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/pricing`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/app-store`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: seoLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: seoLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/request-build`,
      lastModified: seoLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...appRoutes,
  ]
}
