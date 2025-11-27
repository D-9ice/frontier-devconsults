import { Download, Star, Shield, Smartphone, Zap, ExternalLink, TrendingUp } from 'lucide-react';

export default function AppStorePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 overflow-hidden">
              <img 
                src="/logos/frontier-logo.jpg" 
                alt="Frontier DevConsults Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4">Frontier App Store</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover and download premium mobile applications built with cutting-edge technology
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Secure & Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>High Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>Regular Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Apps</h2>
            <p className="text-gray-600">Our most popular and highly-rated applications</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <AppCard
              name="Lotto Forecaster AI"
              icon="/logos/lotto-logo.png"
              category="Entertainment"
              version="1.0.0"
              downloads="1,000+"
              rating={4.5}
              size="25 MB"
              description="Intelligent lottery prediction application powered by machine learning. Features TensorFlow Lite integration for offline predictions, subscription management, and comprehensive anti-piracy protection."
              features={[
                "ML-powered lottery predictions",
                "Owner mode with 10-tap security",
                "Offline-first architecture",
                "Subscription management",
                "Anti-piracy device fingerprinting",
                "Cloud sync capabilities"
              ]}
              requirements={[
                "Android 8.0+",
                "25 MB storage",
                "Internet for sync (optional)"
              ]}
              screenshots={[]}
              playStoreLink="https://play.google.com/store/apps/details?id=com.frontierdevconsults.lottoforecaster"
              isFeatured={true}
            />
          </div>
        </div>
      </section>

      {/* Coming Soon Apps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">Upcoming applications currently in development</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ComingSoonCard
              name="Digital Savings Box"
              category="Finance"
              description="Secure financial tracking application with biometric authentication and intelligent savings goals."
              icon="/logos/savings-icon.png"
              features={[
                "Biometric authentication",
                "Goal-based savings tracking",
                "Expense categorization",
                "Smart reminders"
              ]}
              estimatedRelease="Q1 2026"
              status="Development"
            />

            <ComingSoonCard
              name="Circuit Designer AI"
              category="Engineering"
              description="Revolutionary offline app that enables circuit design through natural language commands."
              features={[
                "Natural language circuit design",
                "Schematic generation",
                "PCB layout automation",
                "Circuit simulation"
              ]}
              estimatedRelease="Q2 2026"
              status="Planning"
              icon="/logos/circuit-designer-logo.png"
            />

            <ComingSoonCard
              name="Scripture Alive"
              category="Education"
              description="Bible app that transforms scripture verses into hyper-realistic videos with AI-generated dialogue."
              features={[
                "Verse-to-video transformation",
                "AI-generated dialogue",
                "Hyper-realistic rendering",
                "Multi-language support"
              ]}
              estimatedRelease="Q2 2026"
              status="Planning"
              icon="/logos/scripture-alive-logo.png"
            />
          </div>
        </div>
      </section>

      {/* App Development Services */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need a Custom App?</h2>
          <p className="text-xl text-gray-600 mb-8">
            We build production-ready mobile applications tailored to your specific needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/request-build"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Request a Build
              <ExternalLink className="ml-2 w-5 h-5" />
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 rounded-lg font-semibold transition-colors border-2 border-blue-600"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

interface AppCardProps {
  name: string;
  icon?: string;
  category: string;
  version: string;
  downloads: string;
  rating: number;
  size: string;
  description: string;
  features: string[];
  requirements: string[];
  screenshots: string[];
  playStoreLink?: string;
  directDownloadLink?: string;
  isFeatured?: boolean;
}

function AppCard({
  name,
  icon,
  category,
  version,
  downloads,
  rating,
  size,
  description,
  features,
  requirements,
  playStoreLink,
  directDownloadLink,
  isFeatured,
}: AppCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow overflow-hidden border border-gray-100">
      {isFeatured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Featured App
        </div>
      )}
      
      <div className="p-8">
        {/* App Header */}
        <div className="flex items-start gap-6 mb-6">
          {icon ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img src={icon} alt={`${name} icon`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
            <p className="text-blue-600 font-semibold mb-3">{category}</p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{downloads}</span>
              </div>
              <div>
                <span className="font-semibold">v{version}</span>
              </div>
              <div>
                <span>{size}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6">{description}</p>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {playStoreLink && (
            <a
              href={playStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-5 h-5" />
              Google Play Store
            </a>
          )}
          {directDownloadLink && (
            <a
              href={directDownloadLink}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-5 h-5" />
              Direct Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface ComingSoonCardProps {
  name: string;
  category: string;
  description: string;
  features: string[];
  estimatedRelease: string;
  status: 'Development' | 'Planning';
  icon?: string;
}

function ComingSoonCard({
  name,
  category,
  description,
  features,
  estimatedRelease,
  status,
  icon,
}: ComingSoonCardProps) {
  const statusColors = {
    Development: 'bg-blue-100 text-blue-700',
    Planning: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-100 to-transparent w-32 h-32 rounded-bl-full opacity-50" />
      
      <div className="relative">
        {icon && (
          <div className="mb-4">
            <img src={icon} alt={name} className="w-16 h-16 object-contain" />
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-purple-600">{category}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Planned Features</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estimated Release</span>
            <span className="font-semibold text-purple-600">{estimatedRelease}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
