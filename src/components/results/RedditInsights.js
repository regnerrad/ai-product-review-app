import React from 'react';
import { MessageCircle, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';

const RedditInsights = ({ data }) => {
  // Handle missing or empty data
  if (!data || data.total_posts_analyzed === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900">Reddit Community Insights</h3>
        </div>
        <p className="text-slate-500 text-sm">No Reddit discussions found for this product yet. Be the first to share your experience!</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    const trend = data.recent_trend?.toLowerCase() || 'stable';
    if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendText = () => {
    const trend = data.recent_trend?.toLowerCase() || 'stable';
    if (trend === 'rising') return 'Improving';
    if (trend === 'falling') return 'Declining';
    return 'Stable';
  };

  // Ensure we have valid numbers
  const positive = data.positive || 0;
  const neutral = data.neutral || 0;
  const negative = data.negative || 0;
  const total = positive + neutral + negative || 100;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-sm">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Reddit Community Insights</h3>
          <p className="text-xs text-slate-500">
            Based on {data.total_posts_analyzed || 0} discussions
          </p>
        </div>
      </div>

      {/* Sentiment Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xl font-bold">{positive}%</span>
          </div>
          <p className="text-xs text-slate-500">Positive</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="text-slate-500 mb-1">
            <span className="text-xl font-bold">{neutral}%</span>
          </div>
          <p className="text-xs text-slate-500">Neutral</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
            <ThumbsDown className="w-4 h-4" />
            <span className="text-xl font-bold">{negative}%</span>
          </div>
          <p className="text-xs text-slate-500">Negative</p>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
        <div className="flex h-full">
          <div className="bg-emerald-500 h-full" style={{ width: `${positive}%` }} />
          <div className="bg-slate-400 h-full" style={{ width: `${neutral}%` }} />
          <div className="bg-red-500 h-full" style={{ width: `${negative}%` }} />
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-orange-200">
        <span className="text-sm text-slate-600">Community Trend</span>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className="text-sm font-medium capitalize">{getTrendText()}</span>
        </div>
      </div>

      {/* Top Discussions */}
      {data.top_mentions && data.top_mentions.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-800 mb-3 text-sm">Top Discussions</h4>
          <div className="space-y-3">
            {data.top_mentions.slice(0, 3).map((mention, idx) => (
              <a
                key={idx}
                href={mention.url || `https://reddit.com/r/${mention.subreddit}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-3 hover:shadow-md transition-all group border border-orange-100"
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    mention.sentiment === 'positive' ? 'bg-emerald-500' :
                    mention.sentiment === 'negative' ? 'bg-red-500' : 'bg-slate-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {mention.text || 'Reddit discussion'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>r/{mention.subreddit || 'technology'}</span>
                      <span>👍 {mention.score || 0}</span>
                      <span>💬 {mention.comments || 0}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-orange-200 italic">
        * Reddit data is refreshed periodically. Join the conversation to share your thoughts!
      </p>
    </div>
  );
};

export default RedditInsights;