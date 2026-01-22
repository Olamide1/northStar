'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Download } from 'lucide-react';
import { Lead } from '@/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await api.get<{ leads: Lead[] }>('/analytics/leads');
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/analytics/leads/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export leads');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Leads</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="border-2 border-gray-200 p-12 text-center">
            <p className="text-gray-600">No leads yet</p>
          </div>
        ) : (
          <div className="border-2 border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Source</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">{lead.email}</td>
                      <td className="px-6 py-4">{lead.name ?? 'N/A'}</td>
                      <td className="px-6 py-4">{lead.source ?? 'N/A'}</td>
                      <td className="px-6 py-4">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
