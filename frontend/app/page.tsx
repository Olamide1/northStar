'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Lock, TrendingUp, Users, Target } from 'lucide-react';
import api from '@/lib/api';
import { ProjectCreateResponse } from '@/types';
import { AxiosError } from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<ProjectCreateResponse | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await api.post<ProjectCreateResponse>('/projects', {
        websiteUrl: url,
      });
      setPlanData(response.data);
      // Show teaser first, no email gate yet
      setShowEmailGate(false);
      setShowFullPlan(false);
      
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('plan-results')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      alert(axiosError.response?.data?.error || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    setShowEmailGate(true);
    setTimeout(() => {
      document.getElementById('email-gate')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !planData) return;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:81',message:'handleEmailSubmit: starting registration',data:{email,hasName:!!name,hasPassword:!!password,hasPlanData:!!planData,keywordCount:planData?.analysis?.seedKeywords?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,E'})}).catch(()=>{});
    // #endregion

    setLoading(true);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:89',message:'handleEmailSubmit: calling API',data:{endpoint:'/auth/register-with-analysis',email,websiteUrl:url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion
      
      // Register user with analysis data
      const response = await api.post('/auth/register-with-analysis', {
        name,
        email,
        password,
        websiteUrl: url,
        analysisData: planData.analysis,
        crawledData: planData.crawledData,
        source: 'landing_page',
        referrer: document.referrer || undefined,
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:105',message:'handleEmailSubmit: API response received',data:{hasToken:!!response.data.token,hasUser:!!response.data.user,hasProject:!!response.data.project,projectId:response.data.project?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C,D'})}).catch(()=>{});
      // #endregion

      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:115',message:'handleEmailSubmit: token stored in localStorage',data:{tokenLength:response.data.token.length,userId:response.data.user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:122',message:'handleEmailSubmit: about to redirect',data:{targetUrl:'/dashboard'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:130',message:'handleEmailSubmit: ERROR caught',data:{error:error instanceof Error?error.message:String(error),isAxiosError:!!(error as any).response,status:(error as any).response?.status,errorData:(error as any).response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,F'})}).catch(()=>{});
      // #endregion
      
      const axiosError = error as AxiosError<{ error: string; code?: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to create account. Please try again.';
      
      // If user already exists, show helpful message
      if (axiosError.response?.data?.code === 'USER_EXISTS') {
        alert(`${errorMessage}\n\nPlease log in instead.`);
        window.location.href = `/login?email=${encodeURIComponent(email)}`;
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl md:text-2xl font-bold">Northstar</div>
            <Link
              href="/login"
              className="px-4 md:px-6 py-2 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-32 text-center relative">
        <div className="absolute inset-0 opacity-50 -z-10" style={{
          background: 'linear-gradient(to bottom right, #F5F9FF, #FFFFFF, #FFF8F5)'
        }} />
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight">
          Get 1,000 customers<br />without writing a word
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
          Automate user acquisition with programmatic SEO articles and smart lead magnets. 
          No setup. No writing. All signal.
        </p>
        <p className="text-sm text-gray-500 mb-6 md:mb-8">
          Enter your website URL to see your SEO potential. No signup required.
        </p>

        <form onSubmit={handleGeneratePlan} className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 md:px-6 py-3 md:py-4 border-2 border-black text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 md:px-8 py-3 md:py-4 bg-black text-white text-base md:text-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl whitespace-nowrap"
              style={{ boxShadow: '0 10px 25px -5px rgba(107, 163, 255, 0.3)' }}
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </form>
      </section>

      {/* Plan Preview - Teaser */}
      {planData && !showEmailGate && !showFullPlan && (
        <section id="plan-results" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24 border-t border-gray-200">
          <div className="space-y-8 md:space-y-12">
            {/* Success message */}
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-50 border-2 border-green-500 rounded-lg">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="text-sm md:text-base font-semibold text-green-900">Analysis Complete!</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold px-4">Here's a preview of your SEO potential</h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 px-4">
                We've identified <span className="font-bold text-[#6BA3FF]">{planData.analysis.seedKeywords.length} keywords</span>, 
                <span className="font-bold text-[#FF9A6B]"> {planData.analysis.valueProps.length} unique value propositions</span>, and 
                <span className="font-bold text-[#A855F7]"> {planData.analysis.targetPersonas.length} target personas</span> for your business.
              </p>
            </div>

            {/* Teaser Content - Show partial data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {/* Keywords Teaser */}
              <div className="border-2 border-black p-4 md:p-6 lg:p-8 relative overflow-hidden hover:shadow-lg transition-all duration-300" style={{
                background: 'linear-gradient(to bottom right, #F5F9FF, #FFFFFF)'
              }}>
                <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                  <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#6BA3FF]" />
                    Top Keywords
                  </h3>
                  <div className="px-2 md:px-3 py-1 bg-[#6BA3FF] text-white text-xs font-bold rounded-full whitespace-nowrap">
                    3 of {planData.analysis.seedKeywords.length}
                  </div>
                </div>
                <ul className="space-y-3 mb-4">
                  {planData.analysis.seedKeywords.slice(0, 3).map((keyword: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 group/item">
                      <CheckCircle2 className="w-5 h-5 text-[#6BA3FF] group-hover/item:scale-110 transition-transform" />
                      <span className="text-lg group-hover/item:text-[#6BA3FF] transition-colors">{keyword}</span>
                    </li>
                  ))}
                </ul>
                {/* Blur effect for locked content */}
                <div className="relative">
                  <div className="blur-sm opacity-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                      <div className="h-4 bg-gray-300 rounded w-3/4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                      <div className="h-4 bg-gray-300 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Value Props Teaser */}
              <div className="border-2 border-black p-8 relative overflow-hidden hover:shadow-lg transition-all duration-300" style={{
                background: 'linear-gradient(to bottom right, #FFF8F5, #FFFFFF)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF9A6B]" />
                    Value Propositions
                  </h3>
                  <div className="px-3 py-1 bg-[#FF9A6B] text-white text-xs font-bold rounded-full">
                    Showing 2 of {planData.analysis.valueProps.length}
                  </div>
                </div>
                <ul className="space-y-3 mb-4">
                  {planData.analysis.valueProps.slice(0, 2).map((prop: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 group/item">
                      <Sparkles className="w-5 h-5 text-[#FF9A6B] mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-sm group-hover/item:text-[#FF9A6B] transition-colors">{prop}</span>
                    </li>
                  ))}
                </ul>
                {/* Blur effect for locked content */}
                <div className="relative">
                  <div className="blur-sm opacity-50 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-300 rounded w-full" />
                        <div className="h-3 bg-gray-300 rounded w-4/5" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="border-2 border-black p-4 md:p-6 text-center hover:shadow-md transition-all duration-300" style={{
                background: 'linear-gradient(to bottom right, rgba(107, 163, 255, 0.1), #FFFFFF)'
              }}>
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#6BA3FF] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-[#6BA3FF]">{planData.analysis.competitorAngles.length}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Competitive Advantages</div>
              </div>
              <div className="border-2 border-black p-4 md:p-6 text-center hover:shadow-md transition-all duration-300" style={{
                background: 'linear-gradient(to bottom right, rgba(255, 154, 107, 0.1), #FFFFFF)'
              }}>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-[#FF9A6B] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-[#FF9A6B]">{planData.analysis.targetPersonas.length}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Target Personas</div>
              </div>
              <div className="border-2 border-black p-4 md:p-6 text-center hover:shadow-md transition-all duration-300" style={{
                background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), #FFFFFF)'
              }}>
                <Target className="w-6 h-6 md:w-8 md:h-8 text-[#A855F7] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-[#A855F7]">{planData.analysis.useCases.length}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Use Cases</div>
              </div>
            </div>

            {/* CTA to unlock */}
            <div className="max-w-3xl mx-auto border-2 border-black p-6 md:p-10 lg:p-12 text-center" style={{
              background: 'linear-gradient(to bottom right, rgba(107, 163, 255, 0.05), rgba(255, 154, 107, 0.05))'
            }}>
              <Lock className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-gray-400" />
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 px-4">Want to see the complete analysis?</h3>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 px-4">
                Unlock the full report including all {planData.analysis.seedKeywords.length} keywords, 
                detailed competitor analysis, persona breakdowns, article ideas, and a custom growth roadmap.
              </p>
              <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Complete keyword list with search volumes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>10+ ready-to-publish article ideas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Detailed target persona profiles</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Lead magnet recommendations</span>
                </li>
              </ul>
              <button
                onClick={handleUnlockClick}
                className="inline-flex items-center justify-center gap-2 px-6 md:px-10 py-4 md:py-5 bg-black text-white text-base md:text-lg font-bold hover:bg-gray-800 transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105 group w-full md:w-auto"
              >
                <Lock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="truncate">Unlock Full Analysis</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">Free • No credit card required • Instant access</p>
            </div>
          </div>
        </section>
      )}

      {/* Signup Gate */}
      {planData && showEmailGate && !showFullPlan && (
        <section id="email-gate" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24 border-t border-gray-200">
          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-black p-6 md:p-10 lg:p-12 text-center" style={{
              background: 'linear-gradient(to bottom right, #F5F9FF, #FFFFFF)'
            }}>
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-[#6BA3FF] rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-4">Create Your Free Account</h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 px-4">
                Get instant access to your complete SEO plan and start generating articles
              </p>
              
              <div className="bg-white border-2 border-gray-200 p-4 md:p-6 mb-6 md:mb-8 text-left">
                <h3 className="font-bold mb-3 md:mb-4 text-base md:text-lg">What you'll get access to:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">All {planData.analysis.seedKeywords.length} Keywords</div>
                      <div className="text-sm text-gray-600">With search intent analysis</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">AI Article Generator</div>
                      <div className="text-sm text-gray-600">Create content instantly</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Target Personas</div>
                      <div className="text-sm text-gray-600">Detailed breakdowns</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Lead Magnets</div>
                      <div className="text-sm text-gray-600">Capture your visitors</div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3 md:space-y-4 text-left">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-black text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#6BA3FF]"
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-black text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#6BA3FF]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-black text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#6BA3FF]"
                    required
                    minLength={8}
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 md:px-8 py-4 md:py-5 bg-black text-white text-base md:text-lg font-bold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl md:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : (
                    <>
                      <span className="hidden md:inline">Create Free Account & View Analysis →</span>
                      <span className="md:hidden">Create Account →</span>
                    </>
                  )}
                </button>
              </form>
              <p className="text-sm text-gray-500 mt-4">
                Already have an account? <Link href="/login" className="text-[#6BA3FF] font-semibold hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Full Plan */}
      {planData && showFullPlan && (
        <section id="full-plan" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24 border-t border-gray-200">
          <div className="space-y-10 md:space-y-16">
            {/* Success Message */}
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-50 border-2 border-green-500 rounded-lg">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="text-sm md:text-base font-semibold text-green-900">Plan Unlocked! Check your email for a PDF copy.</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">Your Complete SEO Plan</h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 px-4">
                Here's everything we found for <span className="font-bold break-all">{url}</span>
              </p>
            </div>

            {/* Full Keywords */}
            <div className="border-2 border-black p-4 md:p-6 lg:p-8" style={{
              background: 'linear-gradient(to bottom right, #F5F9FF, #FFFFFF)'
            }}>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6BA3FF]" />
                All {planData.analysis.seedKeywords.length} Target Keywords
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {planData.analysis.seedKeywords.map((keyword: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded hover:border-[#6BA3FF] transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-[#6BA3FF] flex-shrink-0" />
                    <span>{keyword}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Value Props */}
            <div className="border-2 border-black p-8" style={{
              background: 'linear-gradient(to bottom right, #FFF8F5, #FFFFFF)'
            }}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF9A6B]" />
                Your Unique Value Propositions
              </h3>
              <ul className="space-y-4">
                {planData.analysis.valueProps.map((prop: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded hover:border-[#FF9A6B] transition-colors">
                    <Sparkles className="w-5 h-5 text-[#FF9A6B] mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{prop}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitive Advantages */}
            <div className="border-2 border-black p-8" style={{
              background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), #FFFFFF)'
            }}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                Competitive Advantages
              </h3>
              <ul className="space-y-4">
                {planData.analysis.competitorAngles.map((angle: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded hover:border-[#A855F7] transition-colors">
                    <TrendingUp className="w-5 h-5 text-[#A855F7] mt-0.5 flex-shrink-0" />
                    <span>{angle}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Personas */}
            <div className="border-2 border-black p-8" style={{
              background: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), #FFFFFF)'
            }}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                Target Personas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planData.analysis.targetPersonas.map((persona: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded hover:border-[#10B981] transition-colors">
                    <Users className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <span>{persona}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="border-2 border-black p-8" style={{
              background: 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.1), #FFFFFF)'
            }}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                Primary Use Cases
              </h3>
              <ul className="space-y-4">
                {planData.analysis.useCases.map((useCase: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded hover:border-[#FBBF24] transition-colors">
                    <Target className="w-5 h-5 text-[#FBBF24] mt-0.5 flex-shrink-0" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="border-t-2 border-black pt-12">
              <h3 className="text-3xl font-bold mb-8 text-center">Ready to turn this into traffic?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-12 py-6 bg-black text-white text-xl font-bold hover:bg-gray-800 transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105 group"
                >
                  Start Getting Traffic Today
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-sm text-gray-500 mt-4">Join 1,000+ companies using Northstar to grow</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {!planData && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16">
            <div className="space-y-3 md:space-y-4 group">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold" style={{ 
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
      )}

      {/* Product Section - 4 Steps */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24 border-t border-gray-200 relative">
        <div className="absolute inset-0 -z-10" style={{
          background: 'linear-gradient(to right, transparent, rgba(245, 249, 255, 0.3), transparent)'
        }} />
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 md:mb-16 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-center">How Lead Management Works</h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 md:mb-12 text-center">
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
      <footer className="border-t border-gray-200 py-8 md:py-12 mt-12 md:mt-20 lg:mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
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
