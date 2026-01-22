'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Sparkles, Copy, Edit } from 'lucide-react';
import { LeadMagnet } from '@/types';

export default function LeadMagnetsPage() {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeadMagnets();
  }, []);

  const loadLeadMagnets = async () => {
    try {
      const response = await api.get<{ leadMagnets: LeadMagnet[] }>('/lead-magnets');
      setLeadMagnets(response.data.leadMagnets);
    } catch (error) {
      console.error('Failed to load lead magnets:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyEmbedCode = (embedCode: string) => {
    const code = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${embedCode}.js"></script>`;
    navigator.clipboard.writeText(code);
    alert('Embed code copied to clipboard!');
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Lead Magnets</h1>
          <Link
            href="/dashboard/lead-magnets/new"
            className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Create Lead Magnet
          </Link>
        </div>

        {leadMagnets.length === 0 ? (
          <div className="border-2 border-gray-200 p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No lead magnets yet</p>
            <Link
              href="/dashboard/lead-magnets/new"
              className="inline-block px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Create Your First Lead Magnet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadMagnets.map((magnet) => (
              <div
                key={magnet.id}
                className="border-2 border-black p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">{magnet.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{magnet.description}</p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="px-3 py-1 bg-gray-100 rounded">{magnet.type}</span>
                  <span>{magnet.conversions} conversions</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyEmbedCode(magnet.embedCode)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Embed
                  </button>
                  <Link
                    href={`/dashboard/lead-magnets/${magnet.id}`}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
