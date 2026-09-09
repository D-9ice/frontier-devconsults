import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";
import SiteChrome from "@/components/SiteChrome";

const siteDescription = 'Custom software, Flutter mobile apps, web platforms, AI integration, embedded systems, and IoT engineering from Frontier DevConsults in Accra, Ghana—serving Africa and worldwide.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.frontier-devconsults.com'),
  title: {
    default: 'Custom Software & Embedded Systems Development | Accra, Ghana',
    template: '%s | Frontier DevConsults'
  },
  description: siteDescription,
  keywords: [
    'Frontier DevConsults',
    'Frontier Dev Consults',
    'custom software development Ghana',
    'software company Accra',
    'Flutter app development Ghana',
    'web application development Ghana',
    'AI integration Ghana',
    'AI development Africa',
    'embedded systems Ghana',
    'IoT engineering Africa',
    'hardware software co-engineering Africa'
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
    locale: 'en_GH',
    url: 'https://www.frontier-devconsults.com',
    siteName: 'Frontier DevConsults',
    title: 'Custom Software & Embedded Systems Development | Frontier DevConsults',
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Frontier DevConsults software and embedded systems development in Accra, Ghana',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Software & Embedded Systems Development | Frontier DevConsults',
    description: siteDescription,
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
  alternates: {
    canonical: '/',
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } } : {}),
  },
  category: 'technology',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
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
    <html lang="en-GH" className="scroll-smooth">
      <body className="antialiased">
        <PWAInstaller />
        <SiteChrome assistantEnabled={Boolean(process.env.OPENAI_API_KEY)}>{children}</SiteChrome>
      </body>
    </html>
  );
}
