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
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
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
              className="px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </form>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <div className="text-5xl font-bold">Understand</div>
            <p className="text-xl text-gray-700">
              your product's SEO potential
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">Generate</div>
            <p className="text-xl text-gray-700">
              content that brings real traffic
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">Capture</div>
            <p className="text-xl text-gray-700">
              leads from day one
            </p>
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
                  className="w-full px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
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
                  <div className="border-2 border-black p-8">
                    <h3 className="text-xl font-bold mb-4">Top Keywords</h3>
                    <ul className="space-y-2">
                      {planData.analysis.seedKeywords.slice(0, 5).map((keyword: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {keyword}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-2 border-black p-8">
                    <h3 className="text-xl font-bold mb-4">Value Props</h3>
                    <ul className="space-y-2">
                      {planData.analysis.valueProps.map((prop: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {prop}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-black pt-12">
                <h3 className="text-2xl font-bold mb-6">What happens next</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border-2 border-black p-6">
                    <div className="text-3xl font-bold mb-2">1</div>
                    <h4 className="font-semibold mb-2">We analyze</h4>
                    <p className="text-sm text-gray-600">
                      Our AI crawls your site and identifies SEO opportunities
                    </p>
                  </div>
                  <div className="border-2 border-black p-6">
                    <div className="text-3xl font-bold mb-2">2</div>
                    <h4 className="font-semibold mb-2">We generate</h4>
                    <p className="text-sm text-gray-600">
                      Create 10+ SEO articles targeting high-intent keywords
                    </p>
                  </div>
                  <div className="border-2 border-black p-6">
                    <div className="text-3xl font-bold mb-2">3</div>
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
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Product Section - 4 Steps */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200">
        <h2 className="text-4xl font-bold mb-16 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Discover', desc: 'We crawl your site and understand your product' },
            { step: '2', title: 'Generate', desc: 'AI creates SEO articles targeting high-intent queries' },
            { step: '3', title: 'Embed', desc: 'Smart lead magnets capture visitors automatically' },
            { step: '4', title: 'Grow', desc: 'Watch traffic and leads come in on autopilot' },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-4">
              <div className="text-6xl font-bold">{item.step}</div>
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
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
