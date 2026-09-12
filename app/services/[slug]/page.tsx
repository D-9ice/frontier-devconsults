import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_ORIGIN } from '@/lib/site-url';

const baseUrl = SITE_ORIGIN;
const servicePages = {
  'custom-software-development-ghana': {
    title: 'Custom Software Development Ghana',
    description: 'Custom software development in Ghana for businesses that need secure web, mobile, data, integration, and operational systems built around real requirements.',
    eyebrow: 'Custom software development in Ghana',
    heading: 'Custom software built for the way your organization works',
    introduction: 'Frontier DevConsults designs and develops purpose-built software from Greater Accra for organizations in Ghana, across Africa, and worldwide. Each engagement starts with the business process, users, constraints, integrations, and measurable delivery requirements—not a generic template.',
    capabilities: ['Requirements and solution architecture', 'Business portals and operational dashboards', 'API, database, and third-party integrations', 'Workflow automation and modernization', 'Secure deployment, validation, and handover'],
    outcomes: ['A clearly defined scope and delivery plan', 'A maintainable system aligned with actual operations', 'Transparent technical decisions and validation evidence'],
    related: [{ href: '/projects', label: 'Review software case studies' }, { href: '/pricing', label: 'View planning estimates' }],
  },
  'flutter-mobile-app-development-ghana': {
    title: 'Flutter Mobile App Development Ghana',
    description: 'Flutter and Android mobile app development in Ghana, including offline-first apps, APIs, payments, notifications, AI features, testing, and release support.',
    eyebrow: 'Flutter and mobile app development in Ghana',
    heading: 'Production-ready mobile applications for African and global users',
    introduction: 'We build Flutter and native Android applications from Accra, Ghana, with careful attention to reliability, mobile data constraints, device compatibility, security, and maintainable release workflows. Projects can serve Ghanaian operations first while remaining ready for wider African and international deployment.',
    capabilities: ['Flutter cross-platform application development', 'Native Android and Kotlin implementation', 'Offline-first data and synchronization', 'Payments, maps, notifications, and API integration', 'Testing, release preparation, and lifecycle support'],
    outcomes: ['A mobile experience matched to user and market conditions', 'Documented integrations and predictable application behavior', 'A practical route from prototype to supported release'],
    related: [{ href: '/projects', label: 'See mobile application work' }, { href: '/app-store', label: 'Explore digital products' }],
  },
  'web-application-development-ghana': {
    title: 'Web Application Development Ghana',
    description: 'Web application development in Ghana for responsive business platforms, portals, e-commerce systems, APIs, dashboards, and progressive web applications.',
    eyebrow: 'Web application development in Ghana',
    heading: 'Fast, accessible web platforms designed for real business use',
    introduction: 'Frontier DevConsults develops responsive websites and web applications for businesses in Ghana and organizations serving African or worldwide markets. We combine user-facing experiences with the databases, APIs, administration tools, security controls, and deployment workflows needed to operate them responsibly.',
    capabilities: ['Next.js and React web applications', 'Business portals and administrative systems', 'E-commerce and payment integrations', 'Progressive web applications and responsive interfaces', 'Performance, accessibility, security, and deployment'],
    outcomes: ['A crawlable, mobile-friendly public experience', 'Secure operational tools behind the public interface', 'Clear ownership, deployment, and support documentation'],
    related: [{ href: '/projects', label: 'View web platform case studies' }, { href: '/services/custom-software-development-ghana', label: 'Explore custom software development' }],
  },
  'ai-integration-africa': {
    title: 'AI Integration & Automation Africa',
    description: 'Practical AI integration and automation for organizations in Ghana and Africa, with validation, safeguards, human review, and production deployment.',
    eyebrow: 'AI integration for Ghana and Africa',
    heading: 'Useful AI features integrated with accountable business systems',
    introduction: 'We help organizations apply AI where it can improve a real workflow, product, or decision-support process. Delivery focuses on defined inputs and outputs, appropriate safeguards, measurable usefulness, privacy awareness, and human accountability rather than adding AI without a clear operational purpose.',
    capabilities: ['AI-assisted business workflows and automation', 'Natural-language and document-processing features', 'Model and API integration for web or mobile products', 'Offline and on-device machine-learning options', 'Evaluation, safeguards, monitoring, and human review'],
    outcomes: ['A defined use case with explicit success criteria', 'Known limitations and responsible review points', 'An integration that fits the surrounding product and data flow'],
    related: [{ href: '/projects', label: 'Review AI-enabled work' }, { href: '/services/custom-software-development-ghana', label: 'Explore custom platforms' }],
  },
  'embedded-iot-engineering': {
    title: 'Embedded Systems & IoT Engineering Ghana',
    description: 'Embedded systems and IoT engineering in Ghana, connecting electronics, sensors, controllers, communications, monitoring, diagnostics, and software.',
    eyebrow: 'Embedded systems and IoT engineering',
    heading: 'Hardware-software co-engineering from Ghana for connected systems',
    introduction: 'Frontier DevConsults combines software delivery with more than 30 years of electronics engineering experience. We assess the full system—from sensors, circuits, controllers, power, and connectivity through firmware, APIs, monitoring interfaces, and operational diagnostics—for projects in Ghana, Africa, and worldwide.',
    capabilities: ['Embedded control and connected-device architecture', 'Sensors, electronics, interfaces, and diagnostics', 'IoT communications, telemetry, and monitoring', 'Firmware-to-cloud and hardware-to-application integration', 'Retrofit, modernization, prototyping, and technical assessment'],
    outcomes: ['One coherent view of hardware and software responsibilities', 'Documented interfaces, constraints, and validation requirements', 'A practical engineering path from assessment to deployment'],
    related: [{ href: '/services/custom-specialized-solutions', label: 'Explore specialized engineering solutions' }, { href: '/contact#request-build', label: 'Discuss an embedded or IoT project' }],
  },
} as const;

type ServiceSlug = keyof typeof servicePages;

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug as ServiceSlug;
  const service = servicePages[slug];
  if (!service) return { title: 'Service not found', robots: { index: false, follow: false } };
  const canonical = `/services/${slug}`;
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical },
    openGraph: { title: `${service.title} | Frontier DevConsults`, description: service.description, url: canonical, type: 'website', images: ['/og-image.png'] },
    twitter: { card: 'summary_large_image', title: `${service.title} | Frontier DevConsults`, description: service.description, images: ['/og-image.png'] },
  };
}

export default async function ServiceLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug as ServiceSlug;
  const service = servicePages[slug];
  if (!service) notFound();
  const canonical = `${baseUrl}/services/${slug}`;
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: service.title, serviceType: service.eyebrow,
      url: canonical, description: service.description,
      provider: { '@type': ['Organization', 'ProfessionalService'], '@id': `${baseUrl}/#organization`, name: 'Frontier DevConsults', url: baseUrl },
      areaServed: [{ '@type': 'Country', name: 'Ghana' }, { '@type': 'Place', name: 'Africa' }, { '@type': 'Place', name: 'Worldwide' }],
      offers: service.capabilities.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Services', item: `${baseUrl}/services` },
        { '@type': 'ListItem', position: 2, name: service.title, item: canonical },
      ],
    },
  ];

  return <main className="min-h-screen bg-gray-50">
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll('<', '\\u003c') }} />)}
    <section className="bg-gradient-to-br from-slate-950 to-blue-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-bold uppercase tracking-[0.18em] text-blue-300">{service.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{service.heading}</h1>
        <p className="mt-6 max-w-4xl text-xl leading-8 text-slate-200">{service.introduction}</p>
        <Link href="/contact#request-build" className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 font-bold text-blue-900 hover:bg-blue-50">Request a project assessment</Link>
      </div>
    </section>
    <section className="py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-950">Capabilities</h2>
          <ul className="mt-5 space-y-4 text-gray-700">{service.capabilities.map((item) => <li key={item} className="flex gap-3"><span className="font-bold text-blue-700">✓</span><span>{item}</span></li>)}</ul>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-950">What a successful engagement produces</h2>
          <ul className="mt-5 space-y-4 text-gray-700">{service.outcomes.map((item) => <li key={item} className="flex gap-3"><span className="font-bold text-blue-700">✓</span><span>{item}</span></li>)}</ul>
        </article>
      </div>
    </section>
    <section className="bg-blue-50 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-950">Ghana first, ready for wider markets</h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-gray-700">Delivery is grounded in the realities of Ghanaian businesses and users while supporting organizations operating across Africa or internationally. Scope, compliance, integrations, deployment environments, and support expectations are confirmed for each engagement.</p>
        <div className="mt-7 flex flex-wrap gap-4">{service.related.map((item) => <Link key={item.href} href={item.href} className="font-bold text-blue-800 underline underline-offset-4">{item.label}</Link>)}</div>
      </div>
    </section>
  </main>;
}
