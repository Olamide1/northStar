'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { Project } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
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

  const handleGenerateArticles = async () => {
    if (!confirm('Generate 10 articles for this project?')) return;
    try {
      await api.post('/articles/generate', {
        projectId: params.id,
        count: 10,
      });
      alert('Articles generated successfully!');
      loadProject();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Failed to generate articles');
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{project.name || project.websiteUrl}</h1>
          <p className="text-gray-600">{project.websiteUrl}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-bold mb-4">Seed Keywords</h2>
            <ul className="space-y-2">
              {project.seedKeywords.map((keyword: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  {keyword}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-bold mb-4">Value Props</h2>
            <ul className="space-y-2">
              {project.valueProps.map((prop: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  {prop}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Actions</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateArticles}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Generate Articles
            </button>
            <Link
              href="/dashboard/lead-magnets/new"
              className="flex items-center gap-2 px-6 py-3 border-2 border-black hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Create Lead Magnet
            </Link>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/articles"
              className="px-4 py-2 border-2 border-black hover:bg-gray-50 transition-colors"
            >
              View All Articles
            </Link>
            <Link
              href="/dashboard/lead-magnets"
              className="px-4 py-2 border-2 border-black hover:bg-gray-50 transition-colors"
            >
              View All Lead Magnets
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
