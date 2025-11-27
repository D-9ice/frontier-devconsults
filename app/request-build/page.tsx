'use client';

import { useState } from 'react';
import { Send, FileText, DollarSign, Calendar } from 'lucide-react';

export default function RequestBuildPage() {
  const [formData, setFormData] = useState({
    // Client Information
    fullName: '',
    email: '',
    phone: '',
    company: '',
    
    // Project Details
    projectName: '',
    projectType: '',
    description: '',
    
    // Requirements
    features: '',
    platforms: [] as string[],
    timeline: '',
    budget: '',
    
    // Additional
    hasDesigns: '',
    referenceLinks: '',
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Build request submitted:', formData);
    alert('Thank you for your request! We will review your project and send you a detailed proposal within 24-48 hours.');
    // Reset form
    setFormData({
      fullName: '', email: '', phone: '', company: '',
      projectName: '', projectType: '', description: '',
      features: '', platforms: [], timeline: '', budget: '',
      hasDesigns: '', referenceLinks: '', additionalInfo: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (platform: string) => {
    const platforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    setFormData({ ...formData, platforms });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Request a Build</h1>
          <p className="text-xl text-gray-300">
            Tell us about your project and we'll create a detailed proposal
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Client Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company/Organization (Optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Project Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      placeholder="My Awesome App"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Type *
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    >
                      <option value="">Select project type</option>
                      <option value="mobile-app">Mobile App (Android/iOS)</option>
                      <option value="web-app">Web Application</option>
                      <option value="website">Website</option>
                      <option value="ai-integration">AI Integration</option>
                      <option value="custom">Custom Solution</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                      placeholder="Describe your project idea, goals, and what problem it solves..."
                    />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Key Features *
                    </label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                      placeholder="List the main features you need (e.g., user authentication, payment processing, etc.)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Target Platforms *
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {['Android', 'iOS', 'Web', 'Desktop', 'All Platforms'].map((platform) => (
                        <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.platforms.includes(platform)}
                            onChange={() => handleCheckbox(platform)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                          />
                          <span className="text-gray-700">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Preferred Timeline *
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      >
                        <option value="">Select timeline</option>
                        <option value="urgent">Urgent (1-2 weeks)</option>
                        <option value="fast">Fast (3-4 weeks)</option>
                        <option value="standard">Standard (1-2 months)</option>
                        <option value="flexible">Flexible (2-3 months)</option>
                        <option value="long-term">Long-term (3+ months)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="inline w-4 h-4 mr-1" />
                        Budget Range *
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      >
                        <option value="">Select budget range</option>
                        <option value="small">$500 - $2,000</option>
                        <option value="medium">$2,000 - $5,000</option>
                        <option value="large">$5,000 - $10,000</option>
                        <option value="enterprise">$10,000+</option>
                        <option value="discuss">Let's Discuss</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Do you have designs/wireframes?
                    </label>
                    <select
                      name="hasDesigns"
                      value={formData.hasDesigns}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes, I have complete designs</option>
                      <option value="partial">Yes, partial designs</option>
                      <option value="no">No, I need help with design</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reference Links (Optional)
                    </label>
                    <textarea
                      name="referenceLinks"
                      value={formData.referenceLinks}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                      placeholder="Links to similar apps, websites, or design inspiration"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Anything else we should know?
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                      placeholder="Any additional details, requirements, or questions..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
                >
                  Submit Build Request
                  <Send className="ml-2 w-5 h-5" />
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                  You'll receive a detailed proposal within 24-48 hours
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
