import { MetadataRoute } from 'next'
import { listApps } from '@/lib/apps';
import { listCaseStudies } from '@/lib/case-studies';
import { SITE_ORIGIN } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_ORIGIN;
  const contentLastModified = new Date('2026-09-26T00:00:00.000Z');
  let appRoutes: MetadataRoute.Sitemap = [];
  let caseStudyRoutes: MetadataRoute.Sitemap = [];
  let appStoreLastModified = staticLastModified;
  let projectsLastModified = staticLastModified;
  try {
    const [apps, caseStudies] = await Promise.all([listApps(false), listCaseStudies(false)]);
    appRoutes = apps.filter((app) => app.slug).flatMap((app) => [
      { url: `${baseUrl}/app-store/${app.slug}`, lastModified: new Date(app.updatedAt), changeFrequency: 'weekly' as const, priority: 0.7 },
    ]);
    caseStudyRoutes = caseStudies.map((item) => ({ url: `${baseUrl}/projects/${item.slug}`, lastModified: new Date(item.updatedAt), changeFrequency: 'monthly' as const, priority: 0.7 }));
    appStoreLastModified = latestContentDate(apps.map((app) => app.updatedAt), staticLastModified);
    projectsLastModified = latestContentDate(caseStudies.map((item) => item.updatedAt), staticLastModified);
  } catch { /* Static routes remain available when the content store is offline. */ }

  const homeLastModified = new Date(Math.max(seoLastModified.getTime(), appStoreLastModified.getTime(), projectsLastModified.getTime()));

  return [
    {
      url: baseUrl,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/custom-specialized-solutions`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...['custom-software-development-ghana', 'flutter-mobile-app-development-ghana', 'web-application-development-ghana', 'ai-integration-africa', 'embedded-iot-engineering'].map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/pricing`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/app-store`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/request-build`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: contentLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: contentLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/licenses/g-tube`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...appRoutes,
    ...caseStudyRoutes,
  ]
}


function latestContentDate(values: string[], fallback: Date) {
  const timestamps = values.map((value) => Date.parse(value)).filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(fallback.getTime(), ...timestamps)) : fallback;
}
