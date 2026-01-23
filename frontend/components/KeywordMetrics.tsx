'use client';

interface KeywordMetrics {
  keyword: string;
  searchVolume: number;
  searchVolumeRange: string;
  trafficPotential: number;
  difficulty: number;
  difficultyLabel: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  competition: 'Low' | 'Medium' | 'High';
  type: 'short-tail' | 'mid-tail' | 'long-tail' | 'question';
  wordCount: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  opportunityScore: number;
  priority: 'High' | 'Medium' | 'Low';
  estimatedCPC: number;
  contentLengthRecommendation: number;
  hasFeaturedSnippetPotential: boolean;
  seasonalityScore: number;
}

interface KeywordMetricsProps {
  metrics: KeywordMetrics;
  compact?: boolean;
}

export function KeywordMetricsCard({ metrics, compact = false }: KeywordMetricsProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600 bg-green-50';
    if (difficulty < 60) return 'text-yellow-600 bg-yellow-50';
    if (difficulty < 80) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High') return 'bg-green-100 text-green-800 border-green-200';
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (compact) {
    return (
      <div className="inline-flex flex-wrap items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(metrics.difficulty)}`}>
          {metrics.difficultyLabel}
        </span>
        <span className="text-gray-600">
          📊 {metrics.searchVolumeRange}
        </span>
        <span className={`px-2 py-1 rounded-full font-medium border ${getPriorityBadge(metrics.priority)}`}>
          {metrics.priority} Priority
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg md:text-xl break-words">{metrics.keyword}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {metrics.type}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
              {metrics.intent}
            </span>
            {metrics.hasFeaturedSnippetPotential && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                ⭐ Snippet Potential
              </span>
            )}
          </div>
        </div>
        <div className={`px-4 py-3 rounded-lg border-2 ${getOpportunityColor(metrics.opportunityScore)} text-center flex-shrink-0`}>
          <div className="text-2xl md:text-3xl font-bold">{metrics.opportunityScore}</div>
          <div className="text-xs font-medium">Opportunity</div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Volume */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <div className="text-xs text-blue-600 font-medium mb-1">Search Volume</div>
          <div className="text-xl md:text-2xl font-bold text-blue-900">
            {metrics.searchVolume.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 mt-1">{metrics.searchVolumeRange}/month</div>
        </div>

        {/* Difficulty */}
        <div className={`border rounded-lg p-3 md:p-4 ${getDifficultyColor(metrics.difficulty).replace('text-', 'border-').replace('bg-', 'bg-')}`}>
          <div className="text-xs font-medium mb-1 opacity-80">Keyword Difficulty</div>
          <div className="text-xl md:text-2xl font-bold">{metrics.difficulty}/100</div>
          <div className="text-xs mt-1 font-medium">{metrics.difficultyLabel}</div>
        </div>

        {/* Traffic Potential */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
          <div className="text-xs text-green-600 font-medium mb-1">Traffic Potential</div>
          <div className="text-xl md:text-2xl font-bold text-green-900">
            ~{metrics.trafficPotential.toLocaleString()}
          </div>
          <div className="text-xs text-green-600 mt-1">visits/month (rank #1)</div>
        </div>

        {/* Priority */}
        <div className={`border rounded-lg p-3 md:p-4 ${getPriorityBadge(metrics.priority).replace('bg-', 'bg-').replace('border-', 'border-')}`}>
          <div className="text-xs font-medium mb-1 opacity-80">Priority Level</div>
          <div className="text-xl md:text-2xl font-bold">{metrics.priority}</div>
          <div className="text-xs mt-1 font-medium">{metrics.competition} Competition</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-500 mb-1">Est. CPC</div>
          <div className="font-bold text-sm md:text-base">${metrics.estimatedCPC.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Word Count</div>
          <div className="font-bold text-sm md:text-base">{metrics.wordCount} words</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Recommended Length</div>
          <div className="font-bold text-sm md:text-base">{metrics.contentLengthRecommendation.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Seasonality</div>
          <div className="font-bold text-sm md:text-base">
            {metrics.seasonalityScore > 0 ? `${metrics.seasonalityScore}%` : 'None'}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
        <h4 className="font-bold text-sm mb-2 text-blue-900">💡 Why This Keyword?</h4>
        <ul className="text-xs md:text-sm text-blue-800 space-y-1">
          {metrics.type === 'long-tail' && (
            <li>✅ Long-tail keyword = easier to rank with less competition</li>
          )}
          {metrics.difficulty < 40 && (
            <li>✅ Low difficulty = achievable ranking with quality content</li>
          )}
          {metrics.searchVolume >= 1000 && (
            <li>✅ Good search volume = meaningful traffic potential</li>
          )}
          {metrics.intent === 'commercial' || metrics.intent === 'transactional' ? (
            <li>✅ High commercial intent = better conversion potential</li>
          ) : null}
          {metrics.hasFeaturedSnippetPotential && (
            <li>✅ Featured snippet opportunity = extra visibility in search</li>
          )}
          {metrics.opportunityScore >= 70 && (
            <li>🎯 Excellent opportunity score = high priority for content creation</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function KeywordMetricsBadge({ metrics }: { metrics: KeywordMetrics }) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-500';
    if (difficulty < 60) return 'bg-yellow-500';
    if (difficulty < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(metrics.difficulty)}`} />
        <span className="text-gray-600">{metrics.difficultyLabel}</span>
      </div>
      <span className="text-gray-400">•</span>
      <span className="text-gray-600">📊 {metrics.searchVolumeRange}</span>
      <span className="text-gray-400">•</span>
      <span className={`font-medium ${
        metrics.priority === 'High' ? 'text-green-600' :
        metrics.priority === 'Medium' ? 'text-yellow-600' :
        'text-gray-600'
      }`}>
        {metrics.priority} Priority
      </span>
    </div>
  );
}
