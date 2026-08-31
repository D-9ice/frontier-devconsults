import { MetadataRoute } from 'next'
import { listApps } from '@/lib/apps';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.frontier-devconsults.com';
  const currentDate = new Date();
  let appRoutes: MetadataRoute.Sitemap = [];
  try {
    const apps = await listApps(false);
    appRoutes = apps.filter((app) => app.slug).flatMap((app) => [
      { url: `${baseUrl}/app-store/${app.slug}`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.7 },
      ...(app.showInProjects ? [{ url: `${baseUrl}/projects/${app.slug}`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 }] : []),
    ]);
  } catch { /* Static routes remain available when the content store is offline. */ }

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/app-store`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...appRoutes,
  ]
}
