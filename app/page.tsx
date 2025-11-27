import Link from 'next/link';
import { ArrowRight, Code2, Smartphone, Globe, Zap } from 'lucide-react';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Frontier DevConsults',
    alternateName: 'FrontierDev',
    url: 'https://www.frontier-devconsults.com',
    logo: 'https://www.frontier-devconsults.com/logo.png',
    description: 'Transforming ideas into production-ready applications. Specialized in mobile apps, web platforms, and AI-powered solutions.',
    slogan: 'Building Digital Excellence',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'Ghana'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+233-249-078-976',
      contactType: 'customer service',
      areaServed: 'GH',
      availableLanguage: ['English']
    },
    sameAs: [
      'https://github.com/frontierdevconsults',
      'https://linkedin.com/company/frontierdevconsults'
    ],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '500',
      highPrice: '15000',
      offerCount: '4'
    }
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Frontier <span className="text-blue-400">DevConsults</span>
            </h1>
            <p className="text-2xl sm:text-3xl text-blue-400 font-semibold mb-2">
              Building Digital Excellence
            </p>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              Transforming Ideas into Production-Ready Applications
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Enterprise-grade mobile apps, web platforms, and AI-powered solutions. 
              From concept to deployment, we build software that scales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/projects" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                View Our Work
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold backdrop-blur-sm transition-colors border border-white/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Build</h2>
            <p className="text-xl text-gray-600">Specialized expertise across multiple platforms</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Mobile Apps"
              description="Native Android & Flutter applications with offline-first architecture"
              color="blue"
            />
            <ServiceCard
              icon={<Globe className="w-8 h-8" />}
              title="Web Platforms"
              description="Modern React & Next.js websites optimized for performance and SEO"
              color="green"
            />
            <ServiceCard
              icon={<Code2 className="w-8 h-8" />}
              title="AI Integration"
              description="Machine learning models, TensorFlow Lite, and intelligent automation"
              color="purple"
            />
            <ServiceCard
              icon={<Zap className="w-8 h-8" />}
              title="Custom Solutions"
              description="Tailored software for specialized engineering and enterprise needs"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600">Production-ready applications built with cutting-edge technology</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard
              title="MacSunny Electronics"
              category="E-commerce Website"
              description="Live e-commerce platform for electronics retail with product catalog, shopping cart, and secure checkout."
              status="Production"
              tags={["Next.js", "E-commerce", "Payment Gateway", "SEO"]}
              logoUrl="/logos/macsunny-logo.png"
            />
            <ProjectCard
              title="Lotto Forecaster AI"
              category="Mobile App"
              description="ML-powered lottery prediction app with TensorFlow Lite, subscription management, and anti-piracy protection."
              status="Production"
              tags={["Flutter", "TensorFlow", "AdMob", "Supabase"]}
              logoUrl="/logos/lotto-logo.png"
            />
            <ProjectCard
              title="C-ZAN Guest House & Lounge"
              category="Website"
              description="Modern hospitality website with booking system, room gallery, and customer reviews for premium guest house."
              status="Development"
              tags={["Next.js", "Booking System", "CMS", "Payment"]}
              logoUrl="/logos/czan-logo.png"
            />
            <ProjectCard
              title="Digital Savings Box"
              category="Mobile App"
              description="Secure financial tracking app with biometric authentication and intelligent savings goals."
              status="Development"
              tags={["Kotlin", "Jetpack Compose", "Room", "Hilt"]}
              logoUrl="/logos/savings-icon.png"
            />
            <ProjectCard
              title="Circuit Designer AI"
              category="Engineering Tool"
              description="Offline Android app for designing electronic circuits using natural language commands."
              status="Planning"
              tags={["Android", "AI", "Offline-First", "Engineering"]}
              logoUrl="/logos/circuit-designer-logo.png"
            />
            <ProjectCard
              title="Scripture Alive"
              category="Mobile App"
              description="Bible app that transforms verses into hyper-realistic videos with AI-generated dialogue."
              status="Planning"
              tags={["AI Video", "Text-to-Speech", "Mobile"]}
              logoUrl="/logos/scripture-alive-logo.png"
            />
            <ProjectCard
              title="BETHEL Orphanage"
              category="Website"
              description="Enterprise website for orphanage management supporting 10,000+ children and staff."
              status="Planning"
              tags={["Next.js", "Enterprise", "Nonprofit"]}
              logoUrl="/logos/bethel-logo.png"
            />
            <ProjectCard
              title="Lotus Hill Academy"
              category="School Website"
              description="Modern school website with student portal, parent dashboard, and academic management system."
              status="Planning"
              tags={["Next.js", "Education", "CMS", "Portal"]}
              logoUrl="/logos/lotus-hill-logo.png"
            />
            <ProjectCard
              title="LiveSource Technovations"
              category="Website"
              description="Solar power business platform for installations, manufacturing, and service management."
              status="Planning"
              tags={["Next.js", "E-commerce", "Solar"]}
              logoUrl="/logos/livesource-logo.png"
            />
            <ProjectCard
              title="Kelélé Bespoke Clothing"
              category="Enterprise E-commerce"
              description="Premium fashion e-commerce platform featuring custom tailoring, virtual fitting rooms, and luxury shopping experience."
              status="Development"
              tags={["Next.js", "E-commerce", "AI Fitting", "Custom Orders"]}
              logoUrl="/logos/kelele-icon.png"
            />
            <ProjectCard
              title="GH-MARKET"
              category="E-commerce Marketplace"
              description="Comprehensive marketplace platform for Ghana - connecting buyers and sellers with secure payments and multi-vendor support."
              status="Planning"
              tags={["Next.js", "Marketplace", "Multi-vendor", "Payments"]}
              logoUrl="/logos/gh-market-logo.png"
            />
            <ProjectCard
              title="Family Tree"
              category="Genealogy App"
              description="Collaborative family history platform connecting generations from ancestral roots to descendants, preserving heritage for posterity."
              status="Planning"
              tags={["Mobile", "Genealogy", "Collaborative", "Heritage"]}
              logoUrl="/logos/Family-Tree-logo.png"
            />
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/projects" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              View All Projects
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Request Build Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Request a Build</h2>
            <p className="text-xl text-gray-600">
              Fill out this form to get a detailed proposal for your project
            </p>
          </div>
          <Link 
            href="/request-build" 
            className="block bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow text-center"
          >
            <h3 className="text-2xl font-bold mb-3">Start Your Project Today</h3>
            <p className="text-blue-100 mb-6">
              Complete our detailed project request form and receive a comprehensive proposal within 24-48 hours
            </p>
            <span className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Open Request Form
              <ArrowRight className="ml-2 w-5 h-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's discuss your project and turn your vision into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/pricing" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              View Pricing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-blue-900/50 hover:bg-blue-900/70 text-white rounded-lg font-semibold transition-colors border border-white/20"
            >
              Start a Conversation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function ServiceCard({ icon, title, description, color }: ServiceCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
      <div className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  status: 'Production' | 'Development' | 'Planning';
  tags: string[];
  logoUrl?: string;
}

function ProjectCard({ title, category, description, status, tags, logoUrl }: ProjectCardProps) {
  const statusColors = {
    Production: 'bg-green-100 text-green-700',
    Development: 'bg-blue-100 text-blue-700',
    Planning: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
      {logoUrl && (
        <div className="mb-4">
          <img src={logoUrl} alt={title} className="w-16 h-16 object-contain" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-blue-600">{category}</span>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
