export type PricingColor = 'blue' | 'green' | 'purple' | 'orange';

export interface PriceRange {
  minUsd: number;
  maxUsd?: number;
  suffix?: string;
}

export interface PricingTier {
  id: string;
  title: string;
  description: string;
  features: string[];
  timeline: string;
  color: PricingColor;
  popular?: boolean;
  price: PriceRange;
}

export interface ServicePrice {
  id: string;
  service: string;
  price: PriceRange;
}

export interface PricingSettings {
  exchangeRate: number;
  currencyCode: 'GHS';
  currencySymbol: 'GH₵';
  roundingIncrement: number;
  note: string;
  tiers: PricingTier[];
  developmentServices: ServicePrice[];
  additionalServices: ServicePrice[];
  updatedAt: string;
}

export const defaultPricingSettings: PricingSettings = {
  exchangeRate: 11.54,
  currencyCode: 'GHS',
  currencySymbol: 'GH₵',
  roundingIncrement: 100,
  note: 'All prices are estimates. Final cost depends on project complexity and requirements.',
  updatedAt: '2026-07-17T00:00:00.000Z',
  tiers: [
    {
      id: 'basic-website',
      title: 'Basic Website',
      description: 'Perfect for small businesses and personal portfolios',
      timeline: '1-2 weeks',
      color: 'blue',
      price: { minUsd: 500, maxUsd: 1500 },
      features: [
        '1-5 pages',
        'Responsive design',
        'Contact form',
        'SEO optimized',
        '1 month support',
        'Hosting setup',
      ],
    },
    {
      id: 'ecommerce-website',
      title: 'E-commerce Website',
      description: 'Full-featured online store with payment integration',
      timeline: '4-8 weeks',
      color: 'green',
      popular: true,
      price: { minUsd: 2500, maxUsd: 7500 },
      features: [
        'Product catalog',
        'Shopping cart',
        'Payment gateway',
        'Order management',
        'Admin dashboard',
        'Mobile Money integration',
        '3 months support',
      ],
    },
    {
      id: 'mobile-application',
      title: 'Mobile Application',
      description: 'Native or cross-platform mobile apps',
      timeline: '2-4 months',
      color: 'purple',
      price: { minUsd: 5000, maxUsd: 15000 },
      features: [
        'Android & iOS',
        'User authentication',
        'Push notifications',
        'Offline functionality',
        'API integration',
        'Play Store deployment',
        '6 months support',
      ],
    },
    {
      id: 'enterprise-solution',
      title: 'Enterprise Solution',
      description: 'Complex web/mobile platforms with AI integration',
      timeline: '3-6 months',
      color: 'orange',
      price: { minUsd: 15000 },
      features: [
        'Custom architecture',
        'AI/ML integration',
        'Advanced features',
        'Database design',
        'API development',
        'Cloud deployment',
        '12 months support',
        'Priority updates',
      ],
    },
  ],
  developmentServices: [
    { id: 'landing-page', service: 'Landing Page', price: { minUsd: 300, maxUsd: 800 } },
    { id: 'business-website', service: 'Business Website (5-10 pages)', price: { minUsd: 1000, maxUsd: 3000 } },
    { id: 'blog-news-website', service: 'Blog/News Website', price: { minUsd: 1500, maxUsd: 4000 } },
    { id: 'ecommerce-store', service: 'E-commerce Store', price: { minUsd: 2500, maxUsd: 7500 } },
    { id: 'custom-web-app', service: 'Custom Web App', price: { minUsd: 5000, maxUsd: 20000 } },
    { id: 'mobile-app-single', service: 'Mobile App (Single Platform)', price: { minUsd: 3000, maxUsd: 10000 } },
    { id: 'mobile-app-cross-platform', service: 'Mobile App (Cross-Platform)', price: { minUsd: 5000, maxUsd: 15000 } },
    { id: 'ai-powered-application', service: 'AI-Powered Application', price: { minUsd: 10000, maxUsd: 30000 } },
  ],
  additionalServices: [
    { id: 'ui-ux-design', service: 'UI/UX Design', price: { minUsd: 500, maxUsd: 2000 } },
    { id: 'logo-branding', service: 'Logo & Branding', price: { minUsd: 200, maxUsd: 1000 } },
    { id: 'content-writing', service: 'Content Writing', price: { minUsd: 100, maxUsd: 500 } },
    { id: 'seo-optimization', service: 'SEO Optimization', price: { minUsd: 300, maxUsd: 1500 } },
    { id: 'payment-integration', service: 'Payment Integration', price: { minUsd: 500, maxUsd: 1500 } },
    { id: 'api-development', service: 'API Development', price: { minUsd: 1000, maxUsd: 5000 } },
    { id: 'database-design', service: 'Database Design', price: { minUsd: 500, maxUsd: 3000 } },
    { id: 'cloud-setup-deployment', service: 'Cloud Setup & Deployment', price: { minUsd: 300, maxUsd: 1500 } },
    { id: 'monthly-maintenance', service: 'Monthly Maintenance', price: { minUsd: 100, maxUsd: 500, suffix: '/mo' } },
  ],
};

export function roundPrice(value: number, increment: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(increment) || increment <= 0) return Math.round(value);
  return Math.round(value / increment) * increment;
}

export function formatCediAmount(value: number) {
  return `GH₵${value.toLocaleString('en-US')}`;
}

export function formatPriceRange(price: PriceRange, settings: PricingSettings) {
  const min = roundPrice(price.minUsd * settings.exchangeRate, settings.roundingIncrement);
  const suffix = price.suffix || '';

  if (!price.maxUsd) {
    return `${formatCediAmount(min)}+${suffix}`;
  }

  const max = roundPrice(price.maxUsd * settings.exchangeRate, settings.roundingIncrement);
  return `${formatCediAmount(min)} - ${formatCediAmount(max)}${suffix}`;
}

export function mergePricingSettings(input: Partial<PricingSettings> | null | undefined): PricingSettings {
  return {
    ...defaultPricingSettings,
    ...input,
    tiers: input?.tiers || defaultPricingSettings.tiers,
    developmentServices: input?.developmentServices || defaultPricingSettings.developmentServices,
    additionalServices: input?.additionalServices || defaultPricingSettings.additionalServices,
    currencyCode: 'GHS',
    currencySymbol: 'GH₵',
  };
}
