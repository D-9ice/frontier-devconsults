import { Code2, Smartphone, Globe, Award, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">About Frontier DevConsults</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Building the future, one application at a time
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
          <p className="text-xl text-gray-700 text-center leading-relaxed">
            At Frontier DevConsults, we transform innovative ideas into production-ready applications 
            that solve real-world problems. Our expertise spans mobile development, web platforms, 
            AI integration, and specialized engineering solutions. We don't just build software—we 
            craft experiences that scale, perform, and deliver exceptional value.
          </p>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Expertise</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ExpertiseCard
              icon={<Smartphone className="w-10 h-10" />}
              title="Mobile Development"
              description="Native Android and cross-platform Flutter applications with offline-first architecture, ML integration, and enterprise-grade security."
              skills={["Flutter", "Kotlin", "Jetpack Compose", "TensorFlow Lite", "Room Database"]}
            />
            <ExpertiseCard
              icon={<Globe className="w-10 h-10" />}
              title="Web Platforms"
              description="Modern, responsive websites and web applications built with React, Next.js, and optimized for performance and SEO."
              skills={["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"]}
            />
            <ExpertiseCard
              icon={<Code2 className="w-10 h-10" />}
              title="AI Integration"
              description="Machine learning model deployment, natural language processing, and intelligent automation for mobile and web platforms."
              skills={["TensorFlow Lite", "NLP", "AI Video", "Text-to-Speech", "Offline ML"]}
            />
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
              description="Your vision drives our work. We collaborate closely to ensure every project exceeds expectations."
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
