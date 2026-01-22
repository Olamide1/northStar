'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Plus, FileText, Sparkles, Users, TrendingUp } from 'lucide-react';
import { DashboardData, Project } from '@/types';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        api.get<DashboardData>('/analytics/dashboard'),
        api.get<{ projects: Project[] }>('/projects'),
      ]);
      setDashboardData(statsRes.data);
      setProjects(projectsRes.data.projects);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-4xl font-bold mb-1">{dashboardData?.stats.totalArticles ?? 0}</div>
            <div className="text-gray-600">Total Articles</div>
            <div className="text-sm text-gray-500 mt-2">
              {dashboardData?.stats.publishedArticles ?? 0} published
            </div>
          </div>

          <div className="border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-4xl font-bold mb-1">{dashboardData?.stats.totalLeadMagnets ?? 0}</div>
            <div className="text-gray-600">Lead Magnets</div>
          </div>

          <div className="border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-4xl font-bold mb-1">{dashboardData?.stats.totalLeads ?? 0}</div>
            <div className="text-gray-600">Total Leads</div>
          </div>

          <div className="border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-4xl font-bold mb-1">
              {dashboardData?.stats.totalLeads && dashboardData?.stats.totalLeadMagnets
                ? Math.round((dashboardData.stats.totalLeads / dashboardData.stats.totalLeadMagnets) * 10) / 10
                : 0}
            </div>
            <div className="text-gray-600">Avg per Magnet</div>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <div className="border-2 border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Link
                href="/dashboard/projects/new"
                className="inline-block px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="border-2 border-black p-6 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold mb-2">{project.name || project.websiteUrl}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.websiteUrl}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{project._count?.articles ?? 0} articles</span>
                    <span>{project._count?.leadMagnets ?? 0} magnets</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        {dashboardData?.recentLeads && dashboardData.recentLeads.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Leads</h2>
            <div className="border-2 border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Source</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">{lead.email}</td>
                      <td className="px-6 py-4">{lead.source ?? 'N/A'}</td>
                      <td className="px-6 py-4">
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
