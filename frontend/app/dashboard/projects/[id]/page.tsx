'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { KeywordMetricsCard, KeywordMetricsBadge } from '@/components/KeywordMetrics';
import api from '@/lib/api';
import { Plus, FileText, Sparkles, ArrowRight, CheckCircle2, Loader2, Zap, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Project, Article, KeywordMetrics } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<(KeywordMetrics & { keyword: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState('');
  const [showKeywordAnalysis, setShowKeywordAnalysis] = useState(false);

  useEffect(() => {
    loadProject();
    loadArticles();
    loadKeywordAnalysis();
  }, [params.id]);

  const loadProject = async () => {
    try {
      const response = await api.get<{ project: Project }>(`/projects/${params.id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await api.get<{ articles: Article[] }>('/articles', {
        params: { projectId: params.id }
      });
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  };

  const loadKeywordAnalysis = async () => {
    try {
      const response = await api.get<{ keywords: (KeywordMetrics & { keyword: string })[] }>(
        `/projects/${params.id}/keyword-analysis`
      );
      setKeywordAnalysis(response.data.keywords);
    } catch (error) {
      console.error('Failed to load keyword analysis:', error);
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleGenerateAllArticles = async () => {
    if (!project) return;
    const remainingKeywords = project.seedKeywords.length - articles.length;
    
    if (!confirm(`Generate ${remainingKeywords} articles from your remaining keywords?`)) return;
    
    setGenerating(true);
    setGeneratingProgress('Starting generation...');
    
    try {
      setGeneratingProgress(`Generating ${remainingKeywords} articles...`);
      await api.post('/articles/generate', {
        projectId: params.id,
        count: remainingKeywords,
      });
      
      setGeneratingProgress('Articles generated! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard/articles');
      }, 1500);
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Failed to generate articles');
      setGenerating(false);
      setGeneratingProgress('');
    }
  };

  const hasArticleForKeyword = (keyword: string) => {
    return articles.some(article => article.keyword === keyword);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Project not found</div>
      </DashboardLayout>
    );
  }

  const articlesGenerated = articles.length;
  const totalKeywords = project.seedKeywords.length;
  const progressPercentage = (articlesGenerated / totalKeywords) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black mb-2 inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{project.name || project.websiteUrl}</h1>
          <p className="text-sm md:text-base text-gray-600 break-all">{project.websiteUrl}</p>
        </div>

        {/* Progress Banner */}
        {articlesGenerated < totalKeywords && (
          <div className="border-2 border-black p-4 md:p-6 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2">Ready to Generate Articles</h3>
                <p className="text-sm md:text-base text-gray-600">
                  You have {totalKeywords - articlesGenerated} keywords ready for article generation
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold">{articlesGenerated}/{totalKeywords}</div>
                <div className="text-xs md:text-sm text-gray-500">articles</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <button
              onClick={handleGenerateAllArticles}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-black text-white text-sm md:text-base font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {generatingProgress}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate All Remaining Articles
                </>
              )}
            </button>
          </div>
        )}

        {/* Keyword SEO Analysis */}
        {keywordAnalysis.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Keyword SEO Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">
                  AI-powered analysis of your keywords' difficulty, volume, and opportunity
                </p>
              </div>
              <button
                onClick={() => setShowKeywordAnalysis(!showKeywordAnalysis)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
              >
                <Target className="w-4 h-4" />
                {showKeywordAnalysis ? 'Hide' : 'Show'} Analysis
              </button>
            </div>

            {showKeywordAnalysis && !loadingKeywords && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 border-2 border-green-200 p-4">
                    <div className="text-sm text-green-700 font-medium mb-1">High Priority</div>
                    <div className="text-2xl md:text-3xl font-bold text-green-900">
                      {keywordAnalysis.filter(k => k.priority === 'High').length}
                    </div>
                    <div className="text-xs text-green-600 mt-1">keywords</div>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 p-4">
                    <div className="text-sm text-yellow-700 font-medium mb-1">Medium Priority</div>
                    <div className="text-2xl md:text-3xl font-bold text-yellow-900">
                      {keywordAnalysis.filter(k => k.priority === 'Medium').length}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">keywords</div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 p-4">
                    <div className="text-sm text-blue-700 font-medium mb-1">Avg Difficulty</div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-900">
                      {Math.round(keywordAnalysis.reduce((sum, k) => sum + k.difficulty, 0) / keywordAnalysis.length)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">out of 100</div>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 p-4">
                    <div className="text-sm text-purple-700 font-medium mb-1">Total Traffic Potential</div>
                    <div className="text-2xl md:text-3xl font-bold text-purple-900">
                      {Math.round(keywordAnalysis.reduce((sum, k) => sum + k.trafficPotential, 0) / 1000)}K
                    </div>
                    <div className="text-xs text-purple-600 mt-1">visits/month</div>
                  </div>
                </div>

                {/* Detailed Keyword Analysis */}
                <div className="space-y-4">
                  {keywordAnalysis.slice(0, 5).map((kw, i) => (
                    <KeywordMetricsCard key={i} metrics={kw} />
                  ))}
                  {keywordAnalysis.length > 5 && (
                    <div className="text-center py-4 bg-gray-50 border-2 border-gray-200">
                      <p className="text-sm text-gray-600">
                        Showing top 5 keywords. {keywordAnalysis.length - 5} more available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {loadingKeywords && (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Analyzing keywords...
              </div>
            )}
          </div>
        )}

        {/* Keywords with Article Status */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Keywords & Articles</h2>
          <div className="grid grid-cols-1 gap-3">
            {project.seedKeywords.map((keyword: string, i: number) => {
              const hasArticle = hasArticleForKeyword(keyword);
              const article = articles.find(a => a.keyword === keyword);
              
              return (
                <div
                  key={i}
                  className={`border-2 p-4 flex items-center justify-between gap-4 transition-all ${
                    hasArticle 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-black hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {hasArticle ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${hasArticle ? 'text-gray-500' : 'text-black'} mb-2`}>
                        {keyword}
                      </div>
                      {keywordAnalysis.find(ka => ka.keyword === keyword) && (
                        <div className="mb-2">
                          <KeywordMetricsBadge metrics={keywordAnalysis.find(ka => ka.keyword === keyword)!} />
                        </div>
                      )}
                      {hasArticle && article && (
                        <div className="text-sm text-gray-500">
                          Article: {article.title}
                        </div>
                      )}
                    </div>
                  </div>
                  {hasArticle && article ? (
                    <Link
                      href={`/dashboard/articles/${article.id}`}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-black hover:bg-white transition-colors text-sm whitespace-nowrap"
                    >
                      Edit Article
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                      <TrendingUp className="w-4 h-4" />
                      Ready to generate
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Value Props */}
        <div className="border-2 border-gray-200 p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Value Propositions</h2>
          <ul className="space-y-3">
            {project.valueProps.map((prop: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{prop}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="border-t-2 border-gray-200 pt-6 md:pt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/articles"
              className="border-2 border-black p-4 hover:bg-gray-50 transition-colors group"
            >
              <FileText className="w-6 h-6 mb-2" />
              <div className="font-semibold mb-1">View All Articles</div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                Manage your content
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link
              href="/dashboard/lead-magnets/new"
              className="border-2 border-black p-4 hover:bg-gray-50 transition-colors group"
            >
              <Sparkles className="w-6 h-6 mb-2" />
              <div className="font-semibold mb-1">Create Lead Magnet</div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                Start capturing leads
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="border-2 border-black p-4 hover:bg-gray-50 transition-colors group"
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <div className="font-semibold mb-1">View Analytics</div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                Track performance
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
