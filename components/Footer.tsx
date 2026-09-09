import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Mail, Github, Linkedin, Globe, CreditCard, Landmark } from 'lucide-react';

const mobileEmailLink = 'mailto:info@frontier-devconsults.com?subject=Business%20enquiry%20for%20Frontier%20DevConsults';
const desktopEmailLink = 'https://mail.google.com/mail/?view=cm&fs=1&to=info%40frontier-devconsults.com&su=Business%20enquiry%20for%20Frontier%20DevConsults';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-[47px] h-[47px] rounded-none flex-shrink-0 bg-gray-900 p-0.5">
                <Image
                  src="/logos/frontier-emblem.webp"
                  alt="Frontier DevConsults Logo" 
                  width={47}
                  height={47}
                  sizes="47px"
                  className="w-full h-full object-contain"
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
                <FooterEmailLink className="hover:text-blue-500 transition-colors">
                  info@frontier-devconsults.com
                </FooterEmailLink>
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
              <FooterEmailLink className="hover:text-blue-500 transition-colors" ariaLabel="Email Frontier DevConsults">
                <Mail className="w-5 h-5" />
              </FooterEmailLink>
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
              <li><Link href="/app-store" className="hover:text-blue-500 transition-colors">Digital Products</Link></li>
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
              <li><Link href="/services/custom-specialized-solutions" className="hover:text-blue-500 transition-colors">Custom Specialized Solutions</Link></li>
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
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">MTN Mobile Money</span>
            </div>
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">Vodafone Cash</span>
            </div>
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">AirtelTigo Money</span>
            </div>
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">Cash Payment</span>
            </div>
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <Landmark className="h-5 w-5 shrink-0 text-emerald-700" />
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">Bank Payment</span>
            </div>
            
            {/* Card Payments */}
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <CreditCard className="h-5 w-5 shrink-0 text-blue-600" />
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">Visa</span>
            </div>
            <div className="flex h-11 w-48 items-center justify-center gap-2 rounded-lg bg-white px-4 text-center shadow-md">
              <CreditCard className="h-5 w-5 shrink-0 text-orange-600" />
              <span className="whitespace-nowrap text-sm font-bold text-gray-900">Mastercard</span>
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

function FooterEmailLink({ children, className, ariaLabel }: { children: ReactNode; className: string; ariaLabel?: string }) {
  return <>
    <a href={mobileEmailLink} className={`${className} md:hidden`} aria-label={ariaLabel}>{children}</a>
    <a href={desktopEmailLink} target="_blank" rel="noopener noreferrer" className={`${className} hidden md:inline`} aria-label={ariaLabel}>{children}</a>
  </>;
}
