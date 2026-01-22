'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Project, LeadMagnet } from '@/types';

export default function NewLeadMagnetPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    type: 'CHECKLIST',
    articleId: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get<{ projects: Project[] }>('/projects');
      setProjects(response.data.projects);
      if (response.data.projects.length > 0) {
        setFormData({ ...formData, projectId: response.data.projects[0].id });
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<{ leadMagnet: LeadMagnet }>('/lead-magnets/generate', {
        projectId: formData.projectId,
        type: formData.type,
        articleId: formData.articleId || undefined,
      });

      router.push(`/dashboard/lead-magnets/${response.data.leadMagnet.id}`);
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Failed to create lead magnet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold">Create Lead Magnet</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="projectId" className="block text-sm font-semibold mb-2">
              Project *
            </label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name || project.websiteUrl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-semibold mb-2">
              Lead Magnet Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="CALCULATOR">Calculator</option>
              <option value="TEMPLATE_DOWNLOAD">Template Download</option>
              <option value="AUDIT_REQUEST">Audit Request</option>
              <option value="STARTER_PACK">Starter Pack</option>
              <option value="CHECKLIST">Checklist</option>
            </select>
          </div>

          <div>
            <label htmlFor="articleId" className="block text-sm font-semibold mb-2">
              Article Context (optional)
            </label>
            <input
              id="articleId"
              type="text"
              value={formData.articleId}
              onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
              placeholder="Article ID for context"
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-sm text-gray-600">
              Leave empty to generate based on project only
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Lead Magnet'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
