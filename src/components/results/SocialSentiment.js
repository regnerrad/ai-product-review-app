import React from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Meh, TrendingUp, Twitter, MessageSquare } from 'lucide-react';

const SentimentBadge = ({ sentiment }) => {
  if (sentiment === 'positive') return <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Positive</span>;
  if (sentiment === 'neutral') return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Neutral</span>;
  if (sentiment === 'negative') return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Negative</span>;
  return null;
};

const SocialSentiment = ({ data }) => {
  if (!data) return null;

  const sentimentColor = data.overall > 0.3 ? 'text-emerald-600' : data.overall < -0.3 ? 'text-red-600' : 'text-amber-600';
  const sentimentIcon = data.overall > 0.3 ? <ThumbsUp className="w-5 h-5" /> : data.overall < -0.3 ? <ThumbsDown className="w-5 h-5" /> : <Meh className="w-5 h-5" />;

  return (
    <div className="sleek-card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-500" />
        Social Media Sentiment
      </h3>

      {/* Overall Sentiment */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${sentimentColor}`}>
          {sentimentIcon}
          <span className="text-2xl font-bold">{(data.overall * 100).toFixed(0)}%</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-emerald-600">Positive {data.positive}%</span>
            <span className="text-slate-500">Neutral {data.neutral}%</span>
            <span className="text-red-600">Negative {data.negative}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${data.positive}%` }} />
            <div className="bg-slate-400 h-full" style={{ width: `${data.neutral}%` }} />
            <div className="bg-red-500 h-full" style={{ width: `${data.negative}%` }} />
          </div>
        </div>
      </div>

      {/* Trend indicator */}
      {data.recent_trend && (
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <TrendingUp className="w-4 h-4" />
          <span>Trend: <span className="font-medium capitalize">{data.recent_trend}</span></span>
        </div>
      )}

      {/* Top Mentions */}
      <h4 className="font-medium text-slate-900 mb-3">Top Mentions</h4>
      <div className="space-y-3">
        {data.top_mentions.map((mention, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="mt-0.5">
              {mention.platform === 'Twitter' ? (
                <Twitter className="w-4 h-4 text-sky-500" />
              ) : (
                <MessageSquare className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">"{mention.text}"</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <SentimentBadge sentiment={mention.sentiment} />
                <span>❤️ {mention.likes || mention.upvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note about data source */}
      <p className="text-xs text-slate-400 mt-4 italic">
        * Sentiment based on recent public social media posts. Refreshed daily.
      </p>
    </div>
  );
};

export default SocialSentiment;