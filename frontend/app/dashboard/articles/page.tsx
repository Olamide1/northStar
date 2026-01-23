'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { KeywordMetricsBadge } from '@/components/KeywordMetrics';
import api from '@/lib/api';
import { FileText, Eye, Edit, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { Article } from '@/types';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadArticles();
  }, [filter]);

  const loadArticles = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== 'all') {
        params.status = filter.toUpperCase();
      }
      const response = await api.get<{ articles: Article[] }>('/articles', { params });
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-soft-green text-green-700 border border-green-200';
      case 'DRAFT':
        return 'bg-cool-100 text-cool-700 border border-cool-200';
      case 'NEEDS_REVIEW':
        return 'bg-soft-amber text-amber-700 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">Articles</h1>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 md:px-4 py-2 border-2 border-black text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="border-2 border-gray-200 p-8 md:p-12 text-center bg-gradient-to-br from-gray-50 to-white">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2">No articles yet</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
              Generate SEO-optimized articles from your project keywords. Each article is designed to rank and convert.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                View Your Projects
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create a Project
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block border-2 border-gray-200 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Title & Keyword</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">SEO Metrics</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Performance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => (
                    <tr
                      key={article.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Keyword:</span> {article.keyword}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {article.keywordMetrics ? (
                          <KeywordMetricsBadge metrics={{ ...article.keywordMetrics, keyword: article.keyword }} />
                        ) : (
                          <span className="text-xs text-gray-400">No metrics</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(article.status)}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          {article.views || 0} views
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/articles/${article.id}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-cool-DEFAULT hover:text-cool-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/dashboard/articles/${article.id}`}
                  className="block border-2 border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base flex-1 pr-2">{article.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Keyword:</span> {article.keyword}
                  </div>

                  {article.keywordMetrics && (
                    <div className="mb-3">
                      <KeywordMetricsBadge metrics={{ ...article.keywordMetrics, keyword: article.keyword }} />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {article.views || 0} views
                    </div>
                    <div className="flex items-center gap-2 text-cool-DEFAULT font-medium">
                      Edit
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
