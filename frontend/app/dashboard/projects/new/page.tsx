'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    websiteUrl: '',
    name: '',
    description: '',
    targetAudience: '',
    productType: '',
    competitors: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const competitors = formData.competitors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const response = await api.post('/projects', {
        websiteUrl: formData.websiteUrl,
        name: formData.name || undefined,
        description: formData.description || undefined,
        targetAudience: formData.targetAudience || undefined,
        productType: formData.productType || undefined,
        competitors: competitors.length > 0 ? competitors : undefined,
      });

      // Generate articles
      await api.post('/articles/generate', {
        projectId: response.data.project.id,
        count: 10,
      });

      router.push(`/dashboard/projects/${response.data.project.id}`);
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold">Create New Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-semibold mb-2">
              Website URL *
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              required
              placeholder="https://example.com"
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-sm text-gray-600">
              We'll crawl your site to understand your product
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Project Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Product"
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="One-line description of your product"
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-semibold mb-2">
                Target Audience (optional)
              </label>
              <input
                id="targetAudience"
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Small business owners"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="productType" className="block text-sm font-semibold mb-2">
                Product Type (optional)
              </label>
              <select
                id="productType"
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select...</option>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="competitors" className="block text-sm font-semibold mb-2">
              Competitors (optional)
            </label>
            <input
              id="competitors"
              type="text"
              value={formData.competitors}
              onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
              placeholder="Competitor1, Competitor2, Competitor3"
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-sm text-gray-600">Comma-separated list</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating project...' : 'Create Project & Generate Articles'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
