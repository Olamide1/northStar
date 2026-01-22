'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Article } from '@/types';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      const response = await api.get<{ article: Article }>(`/articles/${params.id}`);
      setArticle(response.data.article);
      setEditedContent(response.data.article.content);
    } catch (error) {
      console.error('Failed to load article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    try {
      const response = await api.patch<{ article: Article }>(`/articles/${params.id}`, {
        content: editedContent,
        title: article.title,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
      });
      setArticle(response.data.article);
      alert('Article saved successfully');
    } catch (error) {
      alert('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this article?')) return;
    try {
      await api.post<{ article: Article }>(`/articles/${params.id}/publish`);
      loadArticle();
      alert('Article published successfully');
    } catch (error) {
      alert('Failed to publish article');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
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
      <div className="max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{article.title}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-50 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            {article.status !== 'PUBLISHED' && (
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                Publish
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Content (Markdown)</label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-[600px] px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Preview</label>
                <div className="h-[600px] overflow-y-auto px-6 py-4 border-2 border-gray-200 bg-white">
                  <article className="prose prose-lg max-w-none">
                    <ReactMarkdown>{editedContent}</ReactMarkdown>
                  </article>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Article Info */}
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Meta Title</label>
              <input
                type="text"
                value={article?.metaTitle || ''}
                onChange={(e) => {
                  if (article) {
                    setArticle({ ...article, metaTitle: e.target.value });
                  }
                }}
                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <div className="px-4 py-2 border-2 border-gray-200 bg-gray-50">
                {article.status}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Views</label>
              <div className="px-4 py-2 border-2 border-gray-200 bg-gray-50">
                {article.views}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
