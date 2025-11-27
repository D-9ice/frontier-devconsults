import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import TawkToWidget from "@/components/TawkToWidget";
import PWAInstaller from "@/components/PWAInstaller";
import AdminShortcut from "@/components/AdminShortcut";
import VisitorTracker from "@/components/VisitorTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.frontier-devconsults.com'),
  title: {
    default: 'Frontier DevConsults - Building Digital Excellence',
    template: '%s | Frontier DevConsults'
  },
  description: 'Transforming ideas into production-ready applications. Specialized in mobile apps, web platforms, and AI-powered solutions. Based in Greater Accra, Ghana.',
  keywords: [
    'web development Ghana',
    'mobile app development',
    'AI integration',
    'e-commerce solutions',
    'custom software development',
    'Flutter development',
    'Next.js development',
    'TensorFlow integration',
    'Frontier DevConsults',
    'Ghana software company',
    'Accra developers',
    'machine learning apps',
    'progressive web apps',
    'enterprise solutions'
  ],
  authors: [{ name: 'Frontier DevConsults' }],
  creator: 'Frontier DevConsults',
  publisher: 'Frontier DevConsults',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.frontier-devconsults.com',
    siteName: 'Frontier DevConsults',
    title: 'Frontier DevConsults - Building Digital Excellence',
    description: 'Transforming ideas into production-ready applications. Specialized in mobile apps, web platforms, and AI-powered solutions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Frontier DevConsults - Building Digital Excellence',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frontier DevConsults - Building Digital Excellence',
    description: 'Transforming ideas into production-ready applications. Specialized in mobile apps, web platforms, and AI-powered solutions.',
    images: ['/og-image.png'],
    creator: '@frontierdevconsults',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://www.frontier-devconsults.com',
  },
  category: 'technology',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <PWAInstaller />
        <AdminShortcut />
        <VisitorTracker />
        <Navigation />
        {children}
        <Footer />
        <FloatingButtons />
        <WhatsAppWidget />
        <TawkToWidget />
      </body>
    </html>
  );
}
