import React from 'react';
import { Youtube, ThumbsUp, ThumbsDown, Meh, TrendingUp, ExternalLink } from 'lucide-react';

const YouTubeInsights = ({ data }) => {
  if (!data || data.total_comments_analyzed === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <Youtube className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900">YouTube Community Insights</h3>
        </div>
        <p className="text-slate-500 text-sm">No YouTube comments found for this product yet.</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (data.recent_trend === 'rising') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    return <Meh className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-sm">
          <Youtube className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">YouTube Community Insights</h3>
          <p className="text-xs text-slate-500">
            Based on {data.total_comments_analyzed} comments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xl font-bold">{data.positive}%</span>
          </div>
          <p className="text-xs text-slate-500">Positive</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="text-slate-500 mb-1">
            <span className="text-xl font-bold">{data.neutral}%</span>
          </div>
          <p className="text-xs text-slate-500">Neutral</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
            <ThumbsDown className="w-4 h-4" />
            <span className="text-xl font-bold">{data.negative}%</span>
          </div>
          <p className="text-xs text-slate-500">Negative</p>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
        <div className="flex h-full">
          <div className="bg-emerald-500 h-full" style={{ width: `${data.positive}%` }} />
          <div className="bg-slate-400 h-full" style={{ width: `${data.neutral}%` }} />
          <div className="bg-red-500 h-full" style={{ width: `${data.negative}%` }} />
        </div>
      </div>

      {data.top_mentions && data.top_mentions.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-800 mb-3 text-sm">Top Comments</h4>
          <div className="space-y-3">
            {data.top_mentions.slice(0, 3).map((mention, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    mention.sentiment === 'positive' ? 'bg-emerald-500' :
                    mention.sentiment === 'negative' ? 'bg-red-500' : 'bg-slate-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {mention.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>👍 {mention.likes}</span>
                      <span>@{mention.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-red-200 italic">
        * YouTube comments from top review videos. Refreshed periodically.
      </p>
    </div>
  );
};

export default YouTubeInsights;