'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { KeywordMetricsCard } from '@/components/KeywordMetrics';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import { Article } from '@/types';
import { ArrowLeft, Save, Eye, Edit2, Trash2 } from 'lucide-react';

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'NEEDS_REVIEW'>('DRAFT');

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  useEffect(() => {
    // Warn before leaving with unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadArticle = async () => {
    try {
      const response = await api.get<{ article: Article }>(`/articles/${params.id}`);
      const art = response.data.article;
      setArticle(art);
      setTitle(art.title);
      setKeyword(art.keyword);
      setContent(art.content);
      setMetaTitle(art.metaTitle || '');
      setMetaDescription(art.metaDescription || '');
      setStatus(art.status);
    } catch (error: any) {
      toast.handleApiError(error);
      router.push('/dashboard/articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;

    setSaving(true);

    try {
      await api.patch(`/articles/${article.id}`, {
        title,
        keyword,
        content,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        status,
      });

      setHasUnsavedChanges(false);
      toast.success('Article saved successfully');
      loadArticle(); // Reload to get updated data
    } catch (error: any) {
      toast.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;

    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      await api.delete(`/articles/${article.id}`);
      toast.success('Article deleted successfully');
      router.push('/dashboard/articles');
    } catch (error: any) {
      toast.handleApiError(error);
      setDeleting(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setHasUnsavedChanges(true);
    
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'keyword':
        setKeyword(value);
        break;
      case 'content':
        setContent(value);
        break;
      case 'metaTitle':
        setMetaTitle(value);
        break;
      case 'metaDescription':
        setMetaDescription(value);
        break;
      case 'status':
        setStatus(value);
        break;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'NEEDS_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading article...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Article not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/dashboard/articles"
              className="text-sm text-gray-500 hover:text-black mb-2 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">Edit Article</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-black transition-colors"
            >
              {previewMode ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 text-yellow-800">
            You have unsaved changes. Don't forget to save!
          </div>
        )}

        {/* Keyword Metrics */}
        {article.keywordMetrics && (
          <KeywordMetricsCard metrics={{ ...article.keywordMetrics, keyword: article.keyword }} />
        )}

        {/* Editor/Preview */}
        <div className="grid grid-cols-1 gap-6">
          {previewMode ? (
            /* Preview Mode */
            <div className="bg-white border-2 border-gray-200 p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${getStatusColor(status)}`}>
                  {status}
                </span>
                {article.keywordMetrics && (
                  <span className="text-sm text-gray-500">
                    Difficulty: {article.keywordMetrics.difficultyLabel} • 
                    Volume: {article.keywordMetrics.searchVolumeRange}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
              
              {metaDescription && (
                <p className="text-lg text-gray-600 mb-6">{metaDescription}</p>
              )}

              <div className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <span className="font-medium">Target Keyword:</span> {keyword}
              </div>

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
              />
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              {/* Title */}
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none text-lg font-semibold"
                  placeholder="Enter article title"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  {title.length} characters
                </p>
              </div>

              {/* Keyword */}
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Keyword *
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleFieldChange('keyword', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none"
                  placeholder="Enter target keyword"
                  required
                />
              </div>

              {/* Content */}
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Article Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none font-mono text-sm min-h-[500px]"
                  placeholder="Enter article content"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  {content.split(/\s+/).filter(Boolean).length} words •{' '}
                  {content.length} characters
                  {article.keywordMetrics && (
                    <span className="ml-4 text-blue-600">
                      Recommended: {article.keywordMetrics.contentLengthRecommendation} words
                    </span>
                  )}
                </p>
              </div>

              {/* Meta Title */}
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none"
                  placeholder="Leave empty to use article title"
                  maxLength={60}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {metaTitle.length}/60 characters
                  {metaTitle.length > 60 && (
                    <span className="text-red-600 ml-2">Too long for optimal SEO</span>
                  )}
                </p>
              </div>

              {/* Meta Description */}
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meta Description (SEO)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none"
                  placeholder="Brief description for search engines"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {metaDescription.length}/160 characters
                  {metaDescription.length > 160 && (
                    <span className="text-red-600 ml-2">Too long for optimal SEO</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
