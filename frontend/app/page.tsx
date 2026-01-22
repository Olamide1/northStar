'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { ProjectCreateResponse } from '@/types';
import { AxiosError } from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<ProjectCreateResponse | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await api.post<ProjectCreateResponse>('/projects', {
        websiteUrl: url,
      });
      setPlanData(response.data);
      setShowEmailGate(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      alert(axiosError.response?.data?.error || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In MVP, just show the full plan after email submission
    // Later: send email and require login
    setShowEmailGate(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">Northstar</div>
            <Link
              href="/login"
              className="px-6 py-2 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center relative">
        <div className="absolute inset-0 opacity-50 -z-10" style={{
          background: 'linear-gradient(to bottom right, #F5F9FF, #FFFFFF, #FFF8F5)'
        }} />
        <h1 className="text-6xl font-bold mb-8 leading-tight">
          Get 1,000 customers<br />without writing a word
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Automate user acquisition with programmatic SEO articles and smart lead magnets. 
          No setup. No writing. All signal.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Enter your website URL to see your SEO potential. No signup required.
        </p>

        <form onSubmit={handleGeneratePlan} className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your website URL"
              className="flex-1 px-6 py-4 border-2 border-black text-lg focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{ boxShadow: '0 10px 25px -5px rgba(107, 163, 255, 0.3)' }}
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </form>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4 group">
            <div className="text-5xl font-bold" style={{ 
              background: 'linear-gradient(to right, #9AC2FF, #6BA3FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Understand
            </div>
            <p className="text-xl text-gray-700">
              your product's SEO potential
            </p>
            <div className="h-1 w-0 bg-[#6BA3FF] group-hover:w-full transition-all duration-500 mt-2" />
          </div>
          <div className="space-y-4 group">
            <div className="text-5xl font-bold" style={{ 
              background: 'linear-gradient(to right, #FFB89A, #FF9A6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Generate
            </div>
            <p className="text-xl text-gray-700">
              content that brings real traffic
            </p>
            <div className="h-1 w-0 bg-[#FF9A6B] group-hover:w-full transition-all duration-500 mt-2" />
          </div>
          <div className="space-y-4 group">
            <div className="text-5xl font-bold" style={{ 
              background: 'linear-gradient(to right, #6BA3FF, #FF9A6B, #6BA3FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Capture
            </div>
            <p className="text-xl text-gray-700">
              leads from day one
            </p>
            <div className="h-1 w-0 bg-gradient-to-r from-[#6BA3FF] to-[#FF9A6B] group-hover:w-full transition-all duration-500 mt-2" />
          </div>
        </div>
      </section>

      {/* Plan Preview */}
      {planData && (
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200">
          {showEmailGate ? (
            <div className="max-w-md mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold">See your full SEO plan</h2>
              <p className="text-gray-600">
                Enter your email to unlock the complete analysis and article previews.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-6 py-4 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-cool-200/50"
                >
                  Unlock Plan
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-16">
              <div>
                <h2 className="text-4xl font-bold mb-8">Your SEO Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="border-2 border-black p-8 hover:shadow-lg transition-all duration-300" style={{
                    background: 'linear-gradient(to bottom right, #F5F9FF, #FFFFFF)'
                  }}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#6BA3FF]" />
                      Top Keywords
                    </h3>
                    <ul className="space-y-2">
                      {planData.analysis.seedKeywords.slice(0, 5).map((keyword: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 group/item">
                          <CheckCircle2 className="w-4 h-4 text-[#6BA3FF] group-hover/item:scale-110 transition-transform" />
                          <span className="group-hover/item:text-[#6BA3FF] transition-colors">{keyword}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-2 border-black p-8 hover:shadow-lg transition-all duration-300" style={{
                    background: 'linear-gradient(to bottom right, #FFF8F5, #FFFFFF)'
                  }}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF9A6B]" />
                      Value Props
                    </h3>
                    <ul className="space-y-2">
                      {planData.analysis.valueProps.map((prop: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 group/item">
                          <Sparkles className="w-4 h-4 text-[#FF9A6B] group-hover/item:scale-110 transition-transform" />
                          <span className="group-hover/item:text-[#FF9A6B] transition-colors">{prop}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-black pt-12">
                <h3 className="text-2xl font-bold mb-6">What happens next</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border-2 border-black p-6 hover:shadow-md transition-all duration-300 group" style={{
                    background: 'linear-gradient(to bottom right, rgba(245, 249, 255, 0.5), #FFFFFF)'
                  }}>
                    <div className="text-3xl font-bold mb-2" style={{ 
                      background: 'linear-gradient(to right, #6BA3FF, #9AC2FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>1</div>
                    <h4 className="font-semibold mb-2">We analyze</h4>
                    <p className="text-sm text-gray-600">
                      Our AI crawls your site and identifies SEO opportunities
                    </p>
                  </div>
                  <div className="border-2 border-black p-6 hover:shadow-md transition-all duration-300 group" style={{
                    background: 'linear-gradient(to bottom right, rgba(255, 248, 245, 0.5), #FFFFFF)'
                  }}>
                    <div className="text-3xl font-bold mb-2" style={{ 
                      background: 'linear-gradient(to right, #FF9A6B, #FFB89A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>2</div>
                    <h4 className="font-semibold mb-2">We generate</h4>
                    <p className="text-sm text-gray-600">
                      Create 10+ SEO articles targeting high-intent keywords
                    </p>
                  </div>
                  <div className="border-2 border-black p-6 hover:shadow-md transition-all duration-300 group" style={{
                    background: 'linear-gradient(to bottom right, rgba(232, 213, 255, 0.3), #FFFFFF)'
                  }}>
                    <div className="text-3xl font-bold mb-2" style={{ 
                      background: 'linear-gradient(to right, #6BA3FF, #FF9A6B, #6BA3FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>3</div>
                    <h4 className="font-semibold mb-2">You grow</h4>
                    <p className="text-sm text-gray-600">
                      Watch traffic and leads come in on autopilot
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-warm-200/50 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Product Section - 4 Steps */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200 relative">
        <div className="absolute inset-0 -z-10" style={{
          background: 'linear-gradient(to right, transparent, rgba(245, 249, 255, 0.3), transparent)'
        }} />
        <h2 className="text-4xl font-bold mb-16 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Discover', desc: 'We crawl your site and understand your product', color: '#6BA3FF' },
            { step: '2', title: 'Generate', desc: 'AI creates SEO articles targeting high-intent queries', color: '#FF9A6B' },
            { step: '3', title: 'Embed', desc: 'Smart lead magnets capture visitors automatically', color: '#A855F7' },
            { step: '4', title: 'Grow', desc: 'Watch traffic and leads come in on autopilot', color: '#10B981' },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-4 group relative">
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{
                background: `linear-gradient(to bottom right, ${item.color}15, transparent)`
              }} />
              <div className="text-6xl font-bold group-hover:scale-110 transition-transform duration-300" style={{ 
                background: `linear-gradient(to right, ${item.color}, ${item.color}CC)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {item.step}
              </div>
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Management Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">How Lead Management Works</h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Capture, track, and convert visitors into customers automatically
          </p>
          
          <div className="space-y-8">
            <div className="border-2 border-black p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#6BA3FF] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">1</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Create Lead Magnets</h3>
                  <p className="text-gray-600">
                    Generate contextual lead magnets (calculators, templates, checklists, audits) that match your articles. 
                    Each magnet gets a unique embed code you can place anywhere.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FF9A6B] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">2</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Embed in Articles</h3>
                  <p className="text-gray-600 mb-4">
                    Copy the JavaScript embed code and paste it into your SEO articles. The lead magnet appears 
                    as a beautiful, contextual form that captures visitor information.
                  </p>
                  <div className="bg-gray-100 p-4 rounded border border-gray-300 font-mono text-sm">
                    &lt;div id="northstar-lead-magnet-{'{'}embedCode{'}'}"&gt;&lt;/div&gt;<br />
                    &lt;script src="https://yourdomain.com/api/embed/{'{'}embedCode{'}'}"&gt;&lt;/script&gt;
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#A855F7] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">3</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Capture Leads Automatically</h3>
                  <p className="text-gray-600">
                    When visitors fill out the form, their email and information is automatically captured and stored. 
                    You can see all leads in your dashboard with source tracking, conversion rates, and metadata.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-8 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">4</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Track & Export</h3>
                  <p className="text-gray-600">
                    View all leads in your dashboard, see which magnets perform best, track conversion rates, 
                    and export leads to CSV for use in your email marketing tools or CRM.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 border-2 border-black bg-white">
            <h3 className="text-xl font-bold mb-4">Lead Magnet Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Calculator', 'Template', 'Audit', 'Starter Pack', 'Checklist'].map((type) => (
                <div key={type} className="text-center p-4 border border-gray-300 rounded">
                  <div className="font-semibold">{type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/dashboard" className="hover:text-black">Dashboard</Link></li>
                <li><Link href="/dashboard/articles" className="hover:text-black">Articles</Link></li>
                <li><Link href="/dashboard/lead-magnets" className="hover:text-black">Lead Magnets</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">About</a></li>
                <li><a href="#" className="hover:text-black">Pricing</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/register" className="hover:text-black">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-black">Log In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>© 2024 Northstar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
