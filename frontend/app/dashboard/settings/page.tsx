'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  createdAt: string;
}

interface UsageStats {
  projectsUsed: number;
  projectsLimit: number;
  articlesUsed: number;
  articlesLimit: number;
  leadMagnetsUsed: number;
  leadMagnetsLimit: number;
}

const PLAN_FEATURES = {
  FREE: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    projects: 1,
    articles: 3,
    leadMagnets: 1,
    analytics: 'Basic',
    support: 'Community',
    popular: false,
    features: [
      '1 project',
      '3 AI-generated articles',
      '1 lead magnet',
      'Basic analytics',
      'Community support',
      'Email capture',
    ],
  },
  STARTER: {
    name: 'Starter',
    price: '$29',
    period: 'per month',
    projects: 3,
    articles: 25,
    leadMagnets: 5,
    analytics: 'Advanced',
    support: 'Email',
    popular: true,
    features: [
      '3 projects',
      '25 AI-generated articles/month',
      '5 lead magnets',
      'Advanced analytics',
      'Email support',
      'Custom branding',
      'Export leads',
    ],
  },
  GROWTH: {
    name: 'Growth',
    price: '$79',
    period: 'per month',
    projects: 10,
    articles: 100,
    leadMagnets: -1, // unlimited
    analytics: 'Advanced',
    support: 'Priority',
    popular: false,
    features: [
      '10 projects',
      '100 AI-generated articles/month',
      'Unlimited lead magnets',
      'Advanced analytics',
      'Priority email support',
      'Custom branding',
      'Export leads',
      'API access',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: '$199',
    period: 'per month',
    projects: -1, // unlimited
    articles: -1, // unlimited
    leadMagnets: -1, // unlimited
    analytics: 'Custom',
    support: 'Dedicated',
    popular: false,
    features: [
      'Unlimited projects',
      'Unlimited AI-generated articles',
      'Unlimited lead magnets',
      'Custom analytics & reports',
      'Dedicated account manager',
      'White-label options',
      'Custom integrations',
      'API access',
      'SLA guarantee',
    ],
  },
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'account' | 'billing' | 'usage'>('account');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.user);

      // Get usage stats (we'll create this endpoint)
      try {
        const usageRes = await api.get('/analytics/usage');
        setUsage(usageRes.data);
      } catch (error) {
        // If endpoint doesn't exist yet, show placeholder data
        const currentPlan = PLAN_FEATURES[userRes.data.user.plan as keyof typeof PLAN_FEATURES];
        setUsage({
          projectsUsed: 0,
          projectsLimit: currentPlan.projects,
          articlesUsed: 0,
          articlesLimit: currentPlan.articles,
          leadMagnetsUsed: 0,
          leadMagnetsLimit: currentPlan.leadMagnets,
        });
      }
    } catch (error) {
      console.error('Failed to load settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      alert('Password changed successfully');
      setShowPasswordChange(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      alert('Failed to change password. Please check your current password.');
    }
  };

  const handleUpgrade = (plan: string) => {
    alert(`Upgrade to ${plan} - Payment integration coming soon!`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = user ? PLAN_FEATURES[user.plan] : PLAN_FEATURES.FREE;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, billing, and usage</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'account', label: 'Account' },
              { id: 'billing', label: 'Billing & Plans' },
              { id: 'usage', label: 'Usage' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && user && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Plan</label>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {currentPlan.name}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Security</h2>
              {!showPasswordChange ? (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ current: '', new: '', confirm: '' });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{currentPlan.name} Plan</h2>
                  <p className="mt-1 text-indigo-100">
                    {currentPlan.price} {currentPlan.period}
                  </p>
                </div>
                {user?.plan !== 'ENTERPRISE' && (
                  <button
                    onClick={() => handleUpgrade('next tier')}
                    className="mt-4 md:mt-0 px-6 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 font-medium"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            {/* Pricing Plans */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`relative rounded-lg border-2 p-6 bg-white ${
                      plan.popular
                        ? 'border-indigo-500 shadow-lg'
                        : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute top-0 right-6 transform -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                        Popular
                      </span>
                    )}
                    {user?.plan === key && (
                      <span className="absolute top-0 left-6 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                        Current
                      </span>
                    )}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                        <span className="ml-2 text-gray-500">/{plan.period.split(' ')[1] || 'forever'}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {user?.plan === key ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-500 font-medium bg-gray-50 cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.name)}
                        className={`w-full py-2 px-4 rounded-md font-medium ${
                          plan.popular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {key === 'FREE' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

           
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && usage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Projects */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Projects</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{usage.projectsUsed}</span>
                  <span className="ml-2 text-gray-500">
                    / {usage.projectsLimit === -1 ? '∞' : usage.projectsLimit}
                  </span>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: usage.projectsLimit === -1 ? '0%' : `${Math.min((usage.projectsUsed / usage.projectsLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Articles */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Articles This Month</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{usage.articlesUsed}</span>
                  <span className="ml-2 text-gray-500">
                    / {usage.articlesLimit === -1 ? '∞' : usage.articlesLimit}
                  </span>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: usage.articlesLimit === -1 ? '0%' : `${Math.min((usage.articlesUsed / usage.articlesLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Lead Magnets */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lead Magnets</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{usage.leadMagnetsUsed}</span>
                  <span className="ml-2 text-gray-500">
                    / {usage.leadMagnetsLimit === -1 ? '∞' : usage.leadMagnetsLimit}
                  </span>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: usage.leadMagnetsLimit === -1 ? '0%' : `${Math.min((usage.leadMagnetsUsed / usage.leadMagnetsLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Upgrade Prompt */}
            {(usage.projectsUsed >= usage.projectsLimit * 0.8 ||
              usage.articlesUsed >= usage.articlesLimit * 0.8 ||
              usage.leadMagnetsUsed >= usage.leadMagnetsLimit * 0.8) &&
              user?.plan !== 'ENTERPRISE' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        You're approaching your plan limits
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Consider upgrading to continue generating content without interruption.</p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setActiveTab('billing')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
                        >
                          View Plans
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
