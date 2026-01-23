'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Plus, FileText, Sparkles, Users, TrendingUp, ArrowRight, CheckCircle2, Circle, Rocket, Target, Zap } from 'lucide-react';
import { DashboardData, Project } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    loadData();
    checkIfNewUser();
  }, []);

  const checkIfNewUser = () => {
    // Check if this is first visit (within 24 hours of account creation)
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          setShowWelcome(true);
          setIsNewUser(true);
          localStorage.setItem('hasSeenWelcome', 'true');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  };

  const loadData = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:42',message:'loadData: starting',data:{hasToken:!!localStorage.getItem('token')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    try {
      const [statsRes, projectsRes] = await Promise.all([
        api.get<DashboardData>('/analytics/dashboard'),
        api.get<{ projects: Project[] }>('/projects'),
      ]);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:52',message:'loadData: data received',data:{projectCount:projectsRes.data.projects.length,totalArticles:statsRes.data.stats.totalArticles,firstProjectId:projectsRes.data.projects[0]?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      setDashboardData(statsRes.data);
      setProjects(projectsRes.data.projects);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:62',message:'loadData: ERROR',data:{error:error instanceof Error?error.message:String(error),isAxiosError:!!(error as any).response,status:(error as any).response?.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  const getCompletionSteps = () => {
    const hasProject = projects.length > 0;
    const hasArticles = (dashboardData?.stats.totalArticles ?? 0) > 0;
    const hasMagnets = (dashboardData?.stats.totalLeadMagnets ?? 0) > 0;
    const hasLeads = (dashboardData?.stats.totalLeads ?? 0) > 0;

    return {
      steps: [
        { label: 'Create a project', completed: hasProject, link: '/dashboard/projects/new' },
        { label: 'Generate articles', completed: hasArticles, link: projects[0] ? `/dashboard/projects/${projects[0].id}` : '/dashboard/projects' },
        { label: 'Create lead magnet', completed: hasMagnets, link: '/dashboard/lead-magnets/new' },
        { label: 'Capture first lead', completed: hasLeads, link: '/dashboard/leads' },
      ],
      completedCount: [hasProject, hasArticles, hasMagnets, hasLeads].filter(Boolean).length,
      totalCount: 4,
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  const progress = getCompletionSteps();
  const newestProject = projects.length > 0 ? projects[0] : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Banner for New Users */}
        {showWelcome && (
          <div className="border-2 border-black p-4 md:p-6 bg-gradient-to-br from-blue-50 to-white relative">
            <button
              onClick={dismissWelcome}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2">
                  {newestProject ? `Welcome! Your analysis for ${newestProject.websiteUrl} is ready` : 'Welcome to Northstar!'}
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  {newestProject 
                    ? "We've analyzed your website and found SEO opportunities. Let's turn them into traffic and leads!"
                    : "Get started by creating your first project to unlock SEO insights and generate content."}
                </p>
                {newestProject ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/dashboard/projects/${newestProject.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                    >
                      View Your Analysis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/projects/${newestProject.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 border-2 border-black hover:bg-gray-50 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Generate Articles
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/dashboard/projects/new"
                    className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Project
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {progress.completedCount < progress.totalCount && (
          <div className="border-2 border-gray-200 p-4 md:p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold">Quick Start Guide</h3>
              <span className="text-sm text-gray-500">
                {progress.completedCount}/{progress.totalCount} completed
              </span>
            </div>
            <div className="space-y-3">
              {progress.steps.map((step, index) => (
                <Link
                  key={index}
                  href={step.link}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors rounded"
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={step.completed ? 'text-gray-500 line-through' : 'font-medium'}>
                    {step.label}
                  </span>
                  {!step.completed && <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Dashboard</h1>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white text-sm md:text-base font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-cool-200/50 group w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-300" />
            New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="border-2 border-black p-4 md:p-6 bg-gradient-to-br from-cool-50/50 to-white hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-cool-DEFAULT group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-cool-DEFAULT to-cool-300 bg-clip-text text-transparent">
              {dashboardData?.stats.totalArticles ?? 0}
            </div>
            <div className="text-sm md:text-base text-gray-600">Total Articles</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
              {dashboardData?.stats.publishedArticles ?? 0} published
            </div>
          </div>

          <div className="border-2 border-black p-4 md:p-6 bg-gradient-to-br from-warm-50/50 to-white hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-warm-DEFAULT group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-warm-DEFAULT to-warm-300 bg-clip-text text-transparent">
              {dashboardData?.stats.totalLeadMagnets ?? 0}
            </div>
            <div className="text-sm md:text-base text-gray-600">Lead Magnets</div>
          </div>

          <div className="border-2 border-black p-4 md:p-6 bg-gradient-to-br from-soft-green/30 to-white hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-green-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              {dashboardData?.stats.totalLeads ?? 0}
            </div>
            <div className="text-sm md:text-base text-gray-600">Total Leads</div>
          </div>

          <div className="border-2 border-black p-4 md:p-6 bg-gradient-to-br from-soft-purple/30 to-white hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">
              {dashboardData?.stats.totalLeads && dashboardData?.stats.totalLeadMagnets
                ? Math.round((dashboardData.stats.totalLeads / dashboardData.stats.totalLeadMagnets) * 10) / 10
                : 0}
            </div>
            <div className="text-sm md:text-base text-gray-600">Avg per Magnet</div>
          </div>
        </div>

        {/* Quick Actions */}
        {projects.length > 0 && (dashboardData?.stats.totalArticles === 0 || dashboardData?.stats.totalLeadMagnets === 0) && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData?.stats.totalArticles === 0 && (
                <Link
                  href={`/dashboard/projects/${projects[0].id}`}
                  className="border-2 border-black p-4 md:p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md group"
                >
                  <FileText className="w-8 h-8 mb-3 text-cool-DEFAULT" />
                  <h3 className="font-bold mb-2">Generate Articles</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Create SEO-optimized content from your keywords
                  </p>
                  <div className="flex items-center text-sm font-semibold group-hover:gap-2 transition-all">
                    Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}
              {dashboardData?.stats.totalLeadMagnets === 0 && (
                <Link
                  href="/dashboard/lead-magnets/new"
                  className="border-2 border-black p-4 md:p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md group"
                >
                  <Sparkles className="w-8 h-8 mb-3 text-warm-DEFAULT" />
                  <h3 className="font-bold mb-2">Create Lead Magnet</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Start capturing leads from your content
                  </p>
                  <div className="flex items-center text-sm font-semibold group-hover:gap-2 transition-all">
                    Create Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}
              <Link
                href="/dashboard/analytics"
                className="border-2 border-black p-4 md:p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md group"
              >
                <Target className="w-8 h-8 mb-3 text-purple-500" />
                <h3 className="font-bold mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Track your performance and conversions
                </p>
                <div className="flex items-center text-sm font-semibold group-hover:gap-2 transition-all">
                  View Stats <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <div className="border-2 border-gray-200 p-8 md:p-12 text-center bg-gradient-to-br from-gray-50 to-white">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">No projects yet</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
                Create your first project by entering your website URL. We'll analyze it and generate SEO content automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black hover:bg-gray-50 transition-colors"
                >
                  Try the Landing Page Demo
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {projects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className={`border-2 p-4 md:p-6 hover:bg-gray-50 transition-all duration-200 relative group ${
                    index === 0 ? 'border-black bg-gradient-to-br from-blue-50/50 to-white' : 'border-gray-200'
                  }`}
                >
                  {index === 0 && isNewUser && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-black text-white text-xs font-bold">
                      NEW
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg md:text-xl font-bold">{project.name || project.websiteUrl}</h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-black transition-all" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4 break-all">{project.websiteUrl}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {project._count?.articles ?? 0} articles
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {project._count?.leadMagnets ?? 0} magnets
                    </span>
                  </div>
                  {index === 0 && (project._count?.articles ?? 0) === 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Ready to generate articles
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        {dashboardData?.recentLeads && dashboardData.recentLeads.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Recent Leads</h2>
            <div className="border-2 border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Email</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Source</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{lead.email}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">{lead.source ?? 'N/A'}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
