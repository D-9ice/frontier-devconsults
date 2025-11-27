import Link from 'next/link';
import { Mail, Github, Linkedin, Globe, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src="/logos/frontier-logo.jpg" 
                  alt="Frontier DevConsults Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-white">
                Frontier <span className="text-blue-500">DevConsults</span>
              </span>
            </Link>
            <p className="text-blue-400 font-semibold mb-3">Building Digital Excellence</p>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforming ideas into production-ready applications. 
              Specialized in mobile apps, web platforms, and AI-powered solutions.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <a href="mailto:info@frontier-devconsults.com" className="hover:text-blue-500 transition-colors">
                  info@frontier-devconsults.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <a href="https://www.frontier-devconsults.com" className="hover:text-blue-500 transition-colors">
                  www.frontier-devconsults.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="mailto:info@frontier-devconsults.com" className="hover:text-blue-500 transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://github.com/frontierdevconsults" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/frontierdevconsults" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
              <li><Link href="/projects" className="hover:text-blue-500 transition-colors">Projects</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-500 transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-blue-500 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
              <li><Link href="/contact#request-build" className="hover:text-blue-500 transition-colors">Request a Build</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Mobile Development</li>
              <li className="text-gray-400">Web Development</li>
              <li className="text-gray-400">AI Integration</li>
              <li className="text-gray-400">E-commerce Solutions</li>
              <li className="text-gray-400">Custom Solutions</li>
            </ul>
            <h3 className="text-white font-semibold mt-6 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="text-white font-semibold mb-4 text-center">We Accept</h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {/* Ghana Payment Platforms */}
            <div className="bg-white px-4 py-2 rounded-lg shadow-md">
              <span className="text-gray-900 font-bold text-sm">MTN Mobile Money</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-md">
              <span className="text-gray-900 font-bold text-sm">Vodafone Cash</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-md">
              <span className="text-gray-900 font-bold text-sm">AirtelTigo Money</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-md">
              <span className="text-gray-900 font-bold text-sm">Zeepay</span>
            </div>
            
            {/* Card Payments */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900 font-bold text-sm">Visa</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span className="text-gray-900 font-bold text-sm">Mastercard</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Frontier DevConsults. All rights reserved.</p>
          <p className="mt-2">Transforming Ideas into Production-Ready Applications | Building Digital Excellence</p>
        </div>
      </div>
    </footer>
  );
}
