'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import AssistantWidget from '@/components/AssistantWidget';
import AdminShortcut from '@/components/AdminShortcut';
import VisitorTracker from '@/components/VisitorTracker';

export default function SiteChrome({ children, assistantEnabled }: { children: React.ReactNode; assistantEnabled: boolean }) {
  const pathname = usePathname(); const safe = pathname === '/upwork-portfolio' || pathname.startsWith('/upwork-portfolio/');
  if (safe) return <><a href="#site-content" className="sr-only z-[100] rounded bg-white px-4 py-3 font-bold text-blue-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a><header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6"><Link href="/upwork-portfolio" className="flex items-center gap-3 font-bold text-gray-900"><Image src="/logos/frontier-emblem.webp" alt="" width={40} height={40} className="h-10 w-10 object-contain" />Frontier <span className="text-blue-700">DevConsults</span></Link></div></header><div id="site-content" tabIndex={-1}>{children}</div><footer className="border-t border-gray-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-600"><p>Frontier DevConsults professional portfolio</p><p className="mt-2 font-semibold text-gray-800">For Upwork opportunities, please continue all pre-contract communication and contracting through Upwork.</p></div></footer></>;
  return <><a href="#site-content" className="sr-only z-[100] rounded bg-white px-4 py-3 font-bold text-blue-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a><AdminShortcut /><VisitorTracker /><Navigation /><div id="site-content" tabIndex={-1}>{children}</div><Footer /><WhatsAppWidget />{assistantEnabled && <AssistantWidget />}</>;
}
