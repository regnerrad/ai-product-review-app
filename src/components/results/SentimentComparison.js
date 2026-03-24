import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart } from 'lucide-react';

const SentimentComparison = ({ redditData, youtubeData }) => {
  if (!redditData && !youtubeData) return null;

  const getTrendIcon = (trend) => {
    if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getPlatformWinner = () => {
    const redditPositive = redditData?.positive || 0;
    const youtubePositive = youtubeData?.positive || 0;
    if (redditPositive > youtubePositive) return 'Reddit';
    if (youtubePositive > redditPositive) return 'YouTube';
    return 'Both';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-slate-900">Sentiment Comparison</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Reddit Card */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-800">Reddit</span>
            <div className="flex items-center gap-1">
              {getTrendIcon(redditData?.recent_trend)}
              <span className="text-xs text-slate-500 capitalize">{redditData?.recent_trend || 'stable'}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {redditData?.overall_percentage || 0}%
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span className="text-emerald-600">👍 {redditData?.positive || 0}%</span>
            <span>😐 {redditData?.neutral || 0}%</span>
            <span className="text-red-600">👎 {redditData?.negative || 0}%</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {redditData?.total_posts_analyzed || 0} discussions
          </div>
        </div>

        {/* YouTube Card */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-800">YouTube</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 capitalize">stable</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {youtubeData?.overall_percentage || 0}%
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span className="text-emerald-600">👍 {youtubeData?.positive || 0}%</span>
            <span>😐 {youtubeData?.neutral || 0}%</span>
            <span className="text-red-600">👎 {youtubeData?.negative || 0}%</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {youtubeData?.total_comments_analyzed || 0} comments
          </div>
        </div>
      </div>

      {/* Winner Badge */}
      <div className="bg-indigo-50 rounded-lg p-3 text-center">
        <span className="text-sm text-indigo-700">
          🏆 More positive on <span className="font-semibold">{getPlatformWinner()}</span>
        </span>
      </div>

      {/* Sentiment Bar Comparison */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Positive</span>
          <span>Neutral</span>
          <span>Negative</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div className="bg-emerald-500 h-full" style={{ width: `${redditData?.positive || 0}%` }} />
              <div className="bg-slate-400 h-full" style={{ width: `${redditData?.neutral || 0}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${redditData?.negative || 0}%` }} />
            </div>
          </div>
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div className="bg-emerald-500 h-full" style={{ width: `${youtubeData?.positive || 0}%` }} />
              <div className="bg-slate-400 h-full" style={{ width: `${youtubeData?.neutral || 0}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${youtubeData?.negative || 0}%` }} />
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Reddit</span>
          <span>YouTube</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentComparison;