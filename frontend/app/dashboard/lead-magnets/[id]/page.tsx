'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Copy, Save } from 'lucide-react';
import { LeadMagnet } from '@/types';

export default function LeadMagnetDetailPage() {
  const params = useParams();
  const [leadMagnet, setLeadMagnet] = useState<LeadMagnet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: '',
    theme: 'default',
    size: 'medium',
  });

  useEffect(() => {
    loadLeadMagnet();
  }, [params.id]);

  const loadLeadMagnet = async () => {
    try {
      const response = await api.get<{ leadMagnet: LeadMagnet }>(`/lead-magnets/${params.id}`);
      const magnet = response.data.leadMagnet;
      setLeadMagnet(magnet);
      setFormData({
        title: magnet.title,
        description: magnet.description,
        ctaText: magnet.ctaText,
        theme: magnet.theme,
        size: magnet.size,
      });
    } catch (error) {
      console.error('Failed to load lead magnet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch<{ leadMagnet: LeadMagnet }>(`/lead-magnets/${params.id}`, formData);
      setLeadMagnet(response.data.leadMagnet);
      alert('Lead magnet saved successfully');
    } catch (error) {
      alert('Failed to save lead magnet');
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = () => {
    if (!leadMagnet) return;
    const code = `<div id="northstar-lead-magnet-${leadMagnet.embedCode}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL}/api/embed/${leadMagnet.embedCode}.js';
    document.head.appendChild(script);
  })();
</script>`;
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

  if (!leadMagnet) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Lead magnet not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Edit Lead Magnet</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Save
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">CTA Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Preview</label>
              <div className="border-2 border-gray-200 p-8 bg-white">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">{formData.title}</h3>
                  <p className="text-gray-700">{formData.description}</p>
                  <button className="w-full px-6 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors">
                    {formData.ctaText}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Embed Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={leadMagnet.embedCode}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={copyEmbedCode}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-black hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <div className="border-2 border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Conversions:</strong> {leadMagnet.conversions}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Views:</strong> {leadMagnet.views}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
