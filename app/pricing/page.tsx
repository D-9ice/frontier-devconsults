import Link from 'next/link';
import { Check, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Transparent Pricing</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From concept to production. Choose the package that fits your needs.
            </p>
            <p className="text-lg text-blue-300 mt-2">
              All prices are estimates. Final cost depends on project complexity and requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Basic Website */}
            <PricingCard
              title="Basic Website"
              price="$500 - $1,500"
              description="Perfect for small businesses and personal portfolios"
              features={[
                "1-5 pages",
                "Responsive design",
                "Contact form",
                "SEO optimized",
                "1 month support",
                "Hosting setup",
              ]}
              timeline="1-2 weeks"
              color="blue"
            />

            {/* E-commerce Website */}
            <PricingCard
              title="E-commerce Website"
              price="$2,500 - $7,500"
              description="Full-featured online store with payment integration"
              features={[
                "Product catalog",
                "Shopping cart",
                "Payment gateway",
                "Order management",
                "Admin dashboard",
                "Mobile Money integration",
                "3 months support",
              ]}
              timeline="4-8 weeks"
              color="green"
              popular
            />

            {/* Mobile Application */}
            <PricingCard
              title="Mobile Application"
              price="$5,000 - $15,000"
              description="Native or cross-platform mobile apps"
              features={[
                "Android & iOS",
                "User authentication",
                "Push notifications",
                "Offline functionality",
                "API integration",
                "Play Store deployment",
                "6 months support",
              ]}
              timeline="2-4 months"
              color="purple"
            />

            {/* Enterprise Solution */}
            <PricingCard
              title="Enterprise Solution"
              price="$15,000+"
              description="Complex web/mobile platforms with AI integration"
              features={[
                "Custom architecture",
                "AI/ML integration",
                "Advanced features",
                "Database design",
                "API development",
                "Cloud deployment",
                "12 months support",
                "Priority updates",
              ]}
              timeline="3-6 months"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Service Breakdown</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Development Services */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Development Services</h3>
              <div className="space-y-4">
                <ServiceItem service="Landing Page" price="$300 - $800" />
                <ServiceItem service="Business Website (5-10 pages)" price="$1,000 - $3,000" />
                <ServiceItem service="Blog/News Website" price="$1,500 - $4,000" />
                <ServiceItem service="E-commerce Store" price="$2,500 - $7,500" />
                <ServiceItem service="Custom Web App" price="$5,000 - $20,000" />
                <ServiceItem service="Mobile App (Single Platform)" price="$3,000 - $10,000" />
                <ServiceItem service="Mobile App (Cross-Platform)" price="$5,000 - $15,000" />
                <ServiceItem service="AI-Powered Application" price="$10,000 - $30,000" />
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Services</h3>
              <div className="space-y-4">
                <ServiceItem service="UI/UX Design" price="$500 - $2,000" />
                <ServiceItem service="Logo & Branding" price="$200 - $1,000" />
                <ServiceItem service="Content Writing" price="$100 - $500" />
                <ServiceItem service="SEO Optimization" price="$300 - $1,500" />
                <ServiceItem service="Payment Integration" price="$500 - $1,500" />
                <ServiceItem service="API Development" price="$1,000 - $5,000" />
                <ServiceItem service="Database Design" price="$500 - $3,000" />
                <ServiceItem service="Cloud Setup & Deployment" price="$300 - $1,500" />
                <ServiceItem service="Monthly Maintenance" price="$100 - $500/mo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Projects */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Need Something Custom?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Have a unique project idea? Let's discuss your requirements and create a custom proposal tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact#request-build"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              Request Custom Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/233249078976?text=Hi! I'd like to discuss a custom project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Let's Discuss on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Payment Terms</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">30%</div>
              <div className="text-gray-900 font-semibold">Upfront Deposit</div>
              <div className="text-sm text-gray-600 mt-2">To begin development</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">40%</div>
              <div className="text-gray-900 font-semibold">Midpoint Payment</div>
              <div className="text-sm text-gray-600 mt-2">At 50% completion</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">30%</div>
              <div className="text-gray-900 font-semibold">Final Payment</div>
              <div className="text-sm text-gray-600 mt-2">Upon delivery</div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            We accept Mobile Money (MTN, Vodafone, AirtelTigo), Zeepay, Visa, and Mastercard
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem
              question="What factors affect the final price?"
              answer="Project complexity, number of features, design requirements, integrations needed, timeline urgency, and ongoing maintenance needs all influence the final cost."
            />
            <FAQItem
              question="Do you offer discounts for multiple projects?"
              answer="Yes! We offer package deals for clients with multiple projects or long-term partnerships. Contact us to discuss volume discounts."
            />
            <FAQItem
              question="What's included in support?"
              answer="Support includes bug fixes, minor updates, security patches, and technical assistance. Major feature additions are quoted separately."
            />
            <FAQItem
              question="Can I pay in installments?"
              answer="Yes, we offer flexible payment plans split into 3 milestones: 30% upfront, 40% at midpoint, and 30% upon completion."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get a detailed quote tailored to your specific needs
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
          >
            Get Your Free Quote
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  timeline: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  popular?: boolean;
}

function PricingCard({ title, price, description, features, timeline, color, popular }: PricingCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50',
  };

  const badgeColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-8 border-t-4 ${colorClasses[color]}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
          Most Popular
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900 mb-4">{price}</div>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className="mb-6">
        <div className={`inline-block ${badgeColors[color]} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          Timeline: {timeline}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/contact#request-build"
        className={`block text-center px-6 py-3 ${badgeColors[color]} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity`}
      >
        Get Started
      </Link>
    </div>
  );
}

interface ServiceItemProps {
  service: string;
  price: string;
}

function ServiceItem({ service, price }: ServiceItemProps) {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
      <span className="text-gray-900 font-medium">{service}</span>
      <span className="text-blue-600 font-bold">{price}</span>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
