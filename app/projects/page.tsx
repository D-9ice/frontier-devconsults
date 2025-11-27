import { Code2, Smartphone, Globe, Cpu, Heart, Zap, ExternalLink, Download, GraduationCap } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Our Projects</h1>
          <p className="text-xl text-gray-300">
            A showcase of production-ready applications and ongoing developments
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {/* Production Projects */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Production</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <DetailedProjectCard
                  icon={<Globe className="w-12 h-12" />}
                  title="MacSunny Electronics"
                  category="E-commerce Website"
                  status="Production"
                  description="Live e-commerce platform for electronics retail business. Features comprehensive product catalog, shopping cart functionality, secure payment processing, order management, and SEO optimization. Currently serving customers with real-time inventory management."
                  technologies={["Next.js", "React", "TypeScript", "Tailwind CSS", "Payment Gateway Integration", "SEO"]}
                  features={[
                    "Product catalog & search",
                    "Shopping cart system",
                    "Secure checkout",
                    "Order tracking",
                    "Customer accounts",
                    "Mobile responsive"
                  ]}
                  link="https://www.macsunny.com"
                  liveLink="https://www.macsunny.com"
                  logoUrl="/logos/macsunny-logo.png"
                  color="green"
                />
                <DetailedProjectCard
                  icon={<Smartphone className="w-12 h-12" />}
                  title="Lotto Forecaster AI"
                  category="Mobile Application"
                  status="Production"
                  description="An intelligent lottery prediction application powered by machine learning. Features include TensorFlow Lite integration for offline predictions, subscription management with in-app purchases, AdMob integration, and comprehensive anti-piracy protection with device fingerprinting."
                  technologies={["Flutter", "Dart", "TensorFlow Lite", "Google AdMob", "Supabase", "Provider Pattern"]}
                  features={[
                    "ML-powered lottery predictions",
                    "Owner mode with 10-tap security",
                    "Offline-first architecture",
                    "Subscription management",
                    "Anti-piracy device fingerprinting",
                    "Cloud sync capabilities"
                  ]}
                  link="#"
                  liveLink="https://play.google.com/store/apps/details?id=com.frontierdevconsults.lottoforecaster"
                  downloadLink="https://play.google.com/store/apps/details?id=com.frontierdevconsults.lottoforecaster"
                  logoUrl="/logos/lotto-logo.png"
                  color="blue"
                />
              </div>
            </div>

            {/* In Development */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">In Development</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <DetailedProjectCard
                  icon={<Globe className="w-12 h-12" />}
                  title="C-ZAN Guest House & Lounge"
                  category="Hospitality Website"
                  status="Development"
                  description="Modern hospitality website featuring online booking system, interactive room gallery, customer review management, and seamless payment integration. Designed to provide guests with a premium booking experience while streamlining operations for the guest house management."
                  technologies={["Next.js", "TypeScript", "Tailwind CSS", "Booking Engine", "Payment Gateway", "CMS"]}
                  features={[
                    "Online booking system",
                    "Room gallery & virtual tours",
                    "Customer reviews",
                    "Payment integration",
                    "Admin dashboard",
                    "Mobile responsive"
                  ]}
                  link="#"
                  logoUrl="/logos/czan-logo.png"
                  color="orange"
                />
                <DetailedProjectCard
                  icon={<Zap className="w-12 h-12" />}
                  title="Digital Savings Box"
                  category="Mobile Application"
                  status="Development"
                  description="A secure and intuitive financial tracking application with biometric authentication. Users can set savings goals, track expenses, and receive intelligent reminders. Built with modern Android architecture using Kotlin and Jetpack Compose."
                  technologies={["Kotlin", "Jetpack Compose", "Room Database", "Hilt DI", "Material 3", "Biometric API"]}
                  logoUrl="/logos/savings-icon.png"
                  features={[
                    "Biometric authentication",
                    "Goal-based savings tracking",
                    "Expense categorization",
                    "Smart reminders",
                    "Offline-first design",
                    "Clean architecture"
                  ]}
                  link="#"
                  color="green"
                />
              </div>
            </div>

            {/* Planned Projects */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Planned & Upcoming</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DetailedProjectCard
                  icon={<Cpu className="w-12 h-12" />}
                  title="Circuit Designer AI"
                  category="Engineering Tool"
                  status="Planning"
                  description="Revolutionary offline Android app that enables circuit design through natural language commands. Generate schematics, PCB layouts, and simulations using AI assistance without requiring internet connectivity."
                  technologies={["Android", "Kotlin", "TensorFlow Lite", "Custom NLP", "SVG Rendering"]}
                  features={[
                    "Natural language circuit design",
                    "Schematic generation",
                    "PCB layout automation",
                    "Circuit simulation",
                    "Completely offline",
                    "Professional export formats"
                  ]}
                  link="#"
                  color="purple"
                  logoUrl="/logos/circuit-designer-logo.png"
                />
                
                <DetailedProjectCard
                  icon={<Code2 className="w-12 h-12" />}
                  title="Scripture Alive"
                  category="Mobile Application"
                  status="Planning"
                  description="An innovative Bible app that transforms scripture verses into hyper-realistic videos with AI-generated dialogue. Experience biblical narratives in a visually immersive and engaging format."
                  technologies={["AI Video Generation", "Text-to-Speech", "Flutter", "Cloud Storage", "Video Processing"]}
                  features={[
                    "Verse-to-video transformation",
                    "AI-generated dialogue",
                    "Hyper-realistic rendering",
                    "Offline video library",
                    "Multi-language support",
                    "Sharing capabilities"
                  ]}
                  link="#"
                  color="orange"
                  logoUrl="/logos/scripture-alive-logo.png"
                />

                <DetailedProjectCard
                  icon={<Heart className="w-12 h-12" />}
                  title="BETHEL for ETHELS"
                  category="Enterprise Website"
                  status="Planning"
                  description="Comprehensive enterprise-grade website for orphanage management, serving 10,000+ children and staff. Features donor management, transparent reporting, and child sponsorship programs."
                  technologies={["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Vercel"]}
                  features={[
                    "Donor management portal",
                    "Child sponsorship system",
                    "Transparency reports",
                    "Event management",
                    "Staff coordination",
                    "Secure payment processing"
                  ]}
                  link="#"
                  color="pink"
                  logoUrl="/logos/bethel-logo.png"
                />

                <DetailedProjectCard
                  icon={<GraduationCap className="w-12 h-12" />}
                  title="Lotus Hill Academy"
                  category="School Website & Portal"
                  status="Planning"
                  description="Comprehensive school website with integrated student portal, parent dashboard, and academic management system. Features online admissions, fee payment, grade tracking, and communication tools."
                  technologies={["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Stripe", "Cloud Storage"]}
                  features={[
                    "Student information portal",
                    "Parent dashboard access",
                    "Online admissions system",
                    "Fee payment integration",
                    "Grade & attendance tracking",
                    "School calendar & events",
                    "Homework & assignments",
                    "Teacher-parent messaging",
                    "Digital report cards",
                    "News & announcements"
                  ]}
                  link="#"
                  color="blue"
                  logoUrl="/logos/lotus-hill-logo.png"
                />

                <DetailedProjectCard
                  icon={<Zap className="w-12 h-12" />}
                  title="LiveSource Technovations"
                  category="Business Website"
                  status="Planning"
                  description="Professional platform for solar power business specializing in manufacturing, installation, commissioning, and servicing. Showcases projects, generates leads, and manages customer inquiries."
                  technologies={["Next.js", "TypeScript", "Tailwind CSS", "CMS Integration", "SEO Optimization"]}
                  features={[
                    "Project portfolio showcase",
                    "Service catalog",
                    "Quote request system",
                    "Customer testimonials",
                    "Energy calculator",
                    "Blog for solar insights"
                  ]}
                  link="#"
                  color="yellow"
                  logoUrl="/logos/livesource-logo.png"
                />

                <DetailedProjectCard
                  icon={<Globe className="w-12 h-12" />}
                  title="Kelélé Bespoke Clothing"
                  category="Enterprise E-commerce Platform"
                  status="Development"
                  description="World-class luxury fashion e-commerce platform delivering premium bespoke clothing experiences. Features advanced AI-powered virtual fitting rooms, custom tailoring workflows, 3D visualization, exclusive designer collections, and personalized styling services. Built for discerning customers seeking exceptional quality and craftsmanship."
                  technologies={["Next.js 15", "TypeScript", "TailwindCSS", "Three.js", "AI/ML APIs", "Stripe", "Supabase", "AWS S3", "Redis"]}
                  features={[
                    "AI-powered virtual fitting room",
                    "3D garment visualization",
                    "Custom measurement system",
                    "Bespoke order management",
                    "Designer collaboration portal",
                    "Fabric & material selector",
                    "Appointment scheduling",
                    "Personal stylist chat",
                    "Premium membership tiers",
                    "International shipping",
                    "Size recommendation engine",
                    "Alteration tracking"
                  ]}
                  link="#"
                  color="purple"
                  logoUrl="/logos/kelele-icon.png"
                />

                <DetailedProjectCard
                  icon={<Globe className="w-12 h-12" />}
                  title="GH-MARKET"
                  category="E-commerce Marketplace Platform"
                  status="Planning"
                  description="Comprehensive e-commerce marketplace platform designed specifically for the Ghanaian market. Comparable to Alibaba, eBay, Amazon, and Temu, GH-MARKET connects buyers and sellers across Ghana with secure payments, multi-vendor support, and localized features."
                  technologies={["Next.js", "TypeScript", "PostgreSQL", "Redis", "Stripe", "Elasticsearch", "AWS S3"]}
                  features={[
                    "Multi-vendor marketplace",
                    "Product listings & search",
                    "Secure payment processing",
                    "Order tracking system",
                    "Seller dashboard & analytics",
                    "Buyer protection program",
                    "Mobile Money integration",
                    "Delivery management"
                  ]}
                  link="#"
                  color="green"
                  logoUrl="/logos/gh-market-logo.png"
                />

                <DetailedProjectCard
                  icon={<Heart className="w-12 h-12" />}
                  title="Family Tree"
                  category="Genealogy & Heritage Platform"
                  status="Planning"
                  description="Revolutionary collaborative genealogy application designed to connect families across generations—from ancestral roots through to present descendants. Family Tree empowers every member to contribute their unique knowledge, creating a rich, comprehensive family database preserved for posterity. The platform features intelligent data enrichment where members with deeper historical knowledge can enhance records, accelerating database growth. Through crowdsourced contributions, photo archives, story-sharing, and DNA integration, families build living legacies that grow stronger with each generation."
                  technologies={["React Native", "Node.js", "PostgreSQL", "AWS S3", "GraphQL", "Firebase Auth", "Redis Cache", "WebSocket"]}
                  features={[
                    "Interactive family tree visualization",
                    "Collaborative data entry system",
                    "Member contribution tracking",
                    "Rich media uploads (photos, videos, documents)",
                    "Story & memory sharing",
                    "Timeline view of family history",
                    "DNA integration support",
                    "Privacy controls & permissions",
                    "Multi-generational connections",
                    "Historical records attachment",
                    "Family event calendar",
                    "Real-time collaboration",
                    "Export family trees (PDF, GEDCOM)",
                    "Search & filter capabilities",
                    "Mobile & web sync"
                  ]}
                  link="#"
                  color="yellow"
                  logoUrl="/logos/Family-Tree-logo.png"
                />

                <DetailedProjectCard
                  icon={<Globe className="w-12 h-12" />}
                  title="Frontier DevConsults"
                  category="Marketplace Website"
                  status="Development"
                  description="This very platform - a comprehensive marketplace showcasing all developed applications and websites. Acts as a central hub for portfolio management and client engagement."
                  technologies={["Next.js 14", "TypeScript", "Tailwind CSS", "Lucide Icons", "Vercel"]}
                  features={[
                    "Project showcase",
                    "Service catalog",
                    "Contact management",
                    "Responsive design",
                    "SEO optimized",
                    "Fast performance"
                  ]}
                  link="/"
                  logoUrl="/logos/frontier-logo.jpg"
                  color="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface DetailedProjectCardProps {
  icon: React.ReactNode;
  title: string;
  category: string;
  status: 'Production' | 'Development' | 'Planning';
  description: string;
  technologies: string[];
  features: string[];
  link: string;
  liveLink?: string;
  downloadLink?: string;
  logoUrl?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow';
}

function DetailedProjectCard({
  icon,
  title,
  category,
  status,
  description,
  technologies,
  features,
  link,
  liveLink,
  downloadLink,
  logoUrl,
  color,
}: DetailedProjectCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  const statusColors = {
    Production: 'bg-green-100 text-green-700',
    Development: 'bg-blue-100 text-blue-700',
    Planning: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img src={logoUrl} alt={`${title} logo`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
          )}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      <div className="mb-2">
        <span className="text-sm font-semibold text-blue-600">{category}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h4>
        <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Technologies</h4>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span key={tech} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        {liveLink && (
          <a
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Live
          </a>
        )}
        {downloadLink && (
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        )}
      </div>
    </div>
  );
}
