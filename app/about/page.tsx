import { Code2, Smartphone, Globe, Award, Users, Zap, Cpu, Database, CircuitBoard, Workflow } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Our Software & Engineering Company in Ghana',
  description: 'Learn about Frontier DevConsults, a founder-led software, electronics, embedded systems, and AI engineering company based in Greater Accra, Ghana.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About Frontier DevConsults', description: 'Founder-led software and engineering delivery from Greater Accra, Ghana, serving organizations across Africa and worldwide.', url: '/about', type: 'website' },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">About Frontier DevConsults</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Founder-led software and engineering solutions built for real-world use
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
          <p className="text-xl text-gray-700 text-center leading-relaxed">
            Frontier DevConsults combines more than 30 years of electronics engineering experience
            with modern full-stack software development. We turn practical requirements into secure,
            production-ready mobile applications, web platforms, AI-enabled products, and specialized
            engineering solutions—with accountable delivery from discovery through deployment.
          </p>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Expertise</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            <ExpertiseCard
              icon={<Smartphone className="w-10 h-10" />}
              title="Mobile Development"
              description="Native Android and cross-platform Flutter applications with offline-first architecture, ML integration, and enterprise-grade security."
              skills={["Flutter", "Kotlin", "Jetpack Compose", "TensorFlow Lite", "Room Database"]}
            />
            <ExpertiseCard
              icon={<Globe className="w-10 h-10" />}
              title="Web Platforms"
              description="Modern websites, SaaS platforms, portals, e-commerce solutions, and web applications optimized for performance and SEO."
              skills={["Next.js", "React", "TypeScript", "E-commerce", "Tailwind CSS", "Vercel"]}
            />
            <ExpertiseCard
              icon={<Code2 className="w-10 h-10" />}
              title="AI Integration"
              description="Machine learning model deployment, natural language processing, and intelligent automation for mobile and web platforms."
              skills={["TensorFlow Lite", "NLP", "AI Video", "Text-to-Speech", "Offline ML"]}
            />
            <ExpertiseCard
              icon={<Cpu className="w-10 h-10" />}
              title="Specialized Solutions"
              description="Practical systems that connect software with electronics, controls, monitoring, diagnostics, connectivity, and integration requirements."
              skills={["Embedded Systems", "Automation", "Monitoring", "Diagnostics", "System Integration"]}
            />
            <ExpertiseCard
              icon={<Database className="w-10 h-10" />}
              title="Data & Backend Systems"
              description="Secure databases, server functionality, APIs, integrations, operational dashboards, and cloud-backed application services."
              skills={["Supabase", "PostgreSQL", "Node.js", "FastAPI", "REST APIs"]}
            />
            <ExpertiseCard
              icon={<CircuitBoard className="w-10 h-10" />}
              title="Electrical & Electronics Engineering"
              description="Circuit analysis, power electronics, PCB and controller diagnostics, technical investigation, and engineering support."
              skills={["Circuit Analysis", "Power Electronics", "PCB Diagnostics", "Controllers", "Technical Support"]}
            />
            <ExpertiseCard
              icon={<Workflow className="w-10 h-10" />}
              title="Modernization & Consulting"
              description="Focused architecture, delivery planning, troubleshooting, integration, and improvement of existing digital systems."
              skills={["Architecture", "Technical Planning", "Modernization", "Troubleshooting", "Consulting"]}
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Founder-led technical delivery</p><h2 className="mt-3 text-4xl font-bold">Hands-on accountability from engineering through launch</h2><p className="mt-6 text-lg leading-8 text-slate-300">Every engagement connects software delivery with practical electrical and electronics engineering discipline. Work is approached through clear requirements, careful implementation, validation, security awareness, transparent communication, and final human review.</p></div></section>

      <section className="py-16 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Evidence-led capability</p>
            <h2 className="mt-3 text-4xl font-bold text-gray-950">See the work behind the promise</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">Our published case studies explain the problem, technical scope, implementation, and verifiable outcome of real products, including Lotto Forecaster AI and BusiBazaar.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/projects" className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">View Projects &amp; Case Studies</Link>
              <Link href="/contact#request-build" className="rounded-lg border border-blue-700 bg-white px-5 py-3 font-bold text-blue-700 hover:bg-blue-100">Discuss Your Project</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Award className="w-10 h-10" />}
              title="Quality First"
              description="We deliver production-ready code with comprehensive testing, clean architecture, and industry best practices."
            />
            <ValueCard
              icon={<Users className="w-10 h-10" />}
              title="Client-Focused"
              description="Your goals and constraints guide the work. We collaborate closely, communicate clearly, and validate delivery against agreed requirements."
            />
            <ValueCard
              icon={<Zap className="w-10 h-10" />}
              title="Innovation"
              description="We stay at the cutting edge of technology, bringing the latest tools and techniques to every project."
            />
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Approach</h2>
          <div className="space-y-6">
            <ApproachStep
              number="01"
              title="Discovery & Planning"
              description="We begin by understanding your vision, requirements, and goals. This phase includes technical feasibility analysis and architecture planning."
            />
            <ApproachStep
              number="02"
              title="Design & Development"
              description="Using agile methodologies, we build your application iteratively with regular check-ins and feedback loops to ensure alignment with your vision."
            />
            <ApproachStep
              number="03"
              title="Testing & Optimization"
              description="Comprehensive testing across devices, performance optimization, and security audits ensure your application is production-ready."
            />
            <ApproachStep
              number="04"
              title="Deployment & Support"
              description="We handle deployment to app stores or hosting platforms and provide ongoing support and maintenance as needed."
            />
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Technologies We Use</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Flutter", "Kotlin", "React", "Next.js", "TypeScript", "TensorFlow",
              "Firebase", "Supabase", "Tailwind CSS", "Node.js", "PostgreSQL", "MongoDB",
              "Android Studio", "VS Code", "Git", "Docker", "Vercel", "AWS"
            ].map((tech) => (
              <div key={tech} className="bg-white border border-gray-200 rounded-lg p-4 text-center font-semibold text-gray-700 hover:border-blue-500 transition-colors">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

interface ExpertiseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  skills: string[];
}

function ExpertiseCard({ icon, title, description, skills }: ExpertiseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface ApproachStepProps {
  number: string;
  title: string;
  description: string;
}

function ApproachStep({ number, title, description }: ApproachStepProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
