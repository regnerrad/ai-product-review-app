import React, { useState, useEffect } from 'react';
import { ExternalLink, Youtube, FileText, Video, Star, ThumbsUp, Clock, ChevronRight } from 'lucide-react';

// Mock review data - in production, this would come from your database or API
const generateReviewLinks = (brand, model) => {
  const searchQuery = `${brand} ${model} review`.replace(/ /g, '+');
  
  return {
    expertReviews: [
      {
        title: `${brand} ${model} Review: The Ultimate Guide`,
        site: 'TechCrunch',
        url: `https://techcrunch.com/search/${searchQuery}`,
        date: '2026-02-15',
        excerpt: 'A comprehensive look at performance, battery life, and value...',
        author: 'John Smith',
        rating: 4.5,
        type: 'expert'
      },
      {
        title: `${brand} ${model} vs Competition`,
        site: 'CNET',
        url: `https://www.cnet.com/search/?query=${searchQuery}`,
        date: '2026-01-20',
        excerpt: 'How does it stack up against the alternatives? We tested everything...',
        author: 'Sarah Johnson',
        rating: 4,
        type: 'expert'
      },
      {
        title: `${brand} ${model}: Long-term Review`,
        site: 'The Verge',
        url: `https://www.theverge.com/search?q=${searchQuery}`,
        date: '2026-02-01',
        excerpt: 'After 3 months of daily use, here\'s what we think...',
        author: 'Mike Chen',
        rating: 4.5,
        type: 'expert'
      }
    ],
    videoReviews: [
      {
        title: `${brand} ${model} Review: The Truth After 30 Days`,
        channel: 'TechReviewer',
        url: `https://www.youtube.com/results?search_query=${searchQuery}`,
        views: '245K',
        duration: '12:34',
        thumbnail: '/api/placeholder/320/180',
        date: '2 weeks ago',
        type: 'video'
      },
      {
        title: `${brand} ${model} vs ${brand} Previous Model`,
        channel: 'GadgetLab',
        url: `https://www.youtube.com/results?search_query=${brand}+${model}+vs`,
        views: '89K',
        duration: '8:21',
        thumbnail: '/api/placeholder/320/180',
        date: '1 month ago',
        type: 'video'
      }
    ],
    userReviews: [
      {
        title: 'Real user experiences',
        site: 'Reddit',
        url: `https://www.reddit.com/search/?q=${searchQuery}`,
        posts: 234,
        discussions: 'Active',
        type: 'community'
      },
      {
        title: 'Verified owner reviews',
        site: 'Amazon',
        url: `https://www.amazon.com/s?k=${brand}+${model}`,
        rating: 4.3,
        reviewCount: 1256,
        type: 'commerce'
      }
    ],
    buyingGuides: [
      {
        title: `What to know before buying ${brand} ${model}`,
        site: 'BuyingGuide',
        url: `https://www.consumerreports.org/search/?query=${searchQuery}`,
        type: 'guide'
      }
    ]
  };
};

export default function ReviewLinks({ brand, model }) {
  const [reviews, setReviews] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brand && model) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setReviews(generateReviewLinks(brand, model));
        setLoading(false);
      }, 500);
    }
  }, [brand, model]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-100 rounded"></div>
            <div className="h-20 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reviews) return null;

  const tabs = [
    { id: 'all', label: 'All Reviews', count: Object.values(reviews).flat().length },
    { id: 'expert', label: 'Expert Reviews', count: reviews.expertReviews.length },
    { id: 'video', label: 'Video Reviews', count: reviews.videoReviews.length },
    { id: 'community', label: 'Community', count: reviews.userReviews.length }
  ];

  const filteredReviews = () => {
    if (activeTab === 'all') {
      return [
        ...reviews.expertReviews,
        ...reviews.videoReviews,
        ...reviews.userReviews,
        ...reviews.buyingGuides
      ];
    }
    if (activeTab === 'expert') return reviews.expertReviews;
    if (activeTab === 'video') return reviews.videoReviews;
    if (activeTab === 'community') return reviews.userReviews;
    return [];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Expert Reviews & Resources
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Trusted reviews and buying guides for {brand} {model}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <nav className="flex px-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Review List */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {filteredReviews().map((review, index) => (
          <a
            key={index}
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {review.type === 'video' ? (
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                ) : review.type === 'expert' ? (
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                ) : review.type === 'community' ? (
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-orange-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {review.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="font-medium">{review.site || review.channel}</span>
                      
                      {review.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {review.rating}/5
                        </span>
                      )}
                      
                      {review.views && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {review.views} views
                        </span>
                      )}
                      
                      {review.date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {review.date}
                        </span>
                      )}
                    </div>
                    
                    {review.excerpt && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {review.excerpt}
                      </p>
                    )}
                  </div>
                  
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <a
          href={`https://www.google.com/search?q=${brand}+${model}+review`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          See more reviews on Google
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}