import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { callOpenAI } from '../services/openaiService';
import { Star, Check, X, ShoppingBag, TrendingUp, ArrowRight, ExternalLink, Shield, Users, Clock } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract parameters from both location.state and URL params
  const getSearchParams = () => {
    // Try to get from state first (new method)
    if (location.state) {
      return {
        category: location.state.category,
        brand: location.state.brand,
        model: location.state.model,
        question: location.state.question
      };
    }
    
    // Fallback to URL params (old method for compatibility)
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      model: searchParams.get('model') || '',
      question: searchParams.get('question') || ''
    };
  };

  const { category, brand, model, question } = getSearchParams();

  useEffect(() => {
    const fetchAIInsights = async () => {
      // Check if all required parameters exist
      if (!brand || !model || !question) {
        setError('Missing search parameters. Please start a new search.');
        setLoading(false);
        return;
      }

      try {
        const aiResponse = await callOpenAI({
          category: category || 'general',
          brand,
          model,
          question
        });
        
        setInsights(aiResponse);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        setError(`Failed to get AI insights: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [category, brand, model, question]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">Analyzing {brand} {model}</h2>
            <p className="mt-2 text-slate-600">Our AI is researching thousands of reviews to answer your question...</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              This usually takes 10-15 seconds
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="sleek-card p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Start New Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="sleek-card p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No insights available</h2>
            <p className="text-slate-600 mb-6">We couldn't generate insights for this product.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Start New Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 fill-slate-200 text-slate-200" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Product Analysis</h1>
              <p className="text-slate-600 mt-1">
                {brand} {model} {category && `• ${category}`}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              New Search
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Question & Direct Answer */}
        <div className="sleek-card p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Your Question
                </span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                "{question}"
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  {insights.answer_to_question}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Summary */}
            <div className="sleek-card p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Analysis</h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  {insights.detailed_summary}
                </p>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pros */}
              <div className="sleek-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Pros</h3>
                </div>
                <ul className="space-y-3">
                  {insights.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-slate-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="sleek-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Cons</h3>
                </div>
                <ul className="space-y-3">
                  {insights.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3" />
                      </div>
                      <span className="text-slate-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alternatives */}
            {insights.alternatives && insights.alternatives.length > 0 && (
              <div className="sleek-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Alternative Options</h3>
                </div>
                <div className="grid gap-4">
                  {insights.alternatives.map((alt, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900">
                            {alt.brand} {alt.model}
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">{alt.reason}</p>
                        </div>
                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                          {alt.price_comparison}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* Rating Info */}
            <div className="sleek-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Ratings</h3>
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {renderStars(insights.rating_info.average_rating)}
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold text-slate-900">{insights.rating_info.average_rating.toFixed(1)}</span>
                  <span className="text-slate-500">/ 5</span>
                </div>
                <p className="text-slate-600 text-sm mt-1">
                  Based on {insights.rating_info.total_reviews.toLocaleString()} reviews
                </p>
              </div>
              
              {insights.rating_info.rating_breakdown && (
                <div className="space-y-3 mt-6">
                  {Object.entries(insights.rating_info.rating_breakdown).map(([stars, count]) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-12">{stars}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full"
                          style={{ 
                            width: `${(count / insights.rating_info.total_reviews) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 w-12 text-right">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase Options */}
            <div className="sleek-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Where to Buy</h3>
              </div>
              
              <div className="space-y-4">
                {insights.purchase_options.map((option, index) => (
                  <a
                    key={index}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block border rounded-lg p-4 hover:shadow-sm transition-shadow ${option.is_shopee ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-medium ${option.is_shopee ? 'text-indigo-700' : 'text-slate-900'}`}>
                          {option.store}
                        </span>
                        {option.is_shopee && (
                          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">{option.price}</span>
                      <span className={`text-sm ${option.availability === 'In Stock' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {option.availability}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="sleek-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-indigo-300" />
                <h3 className="text-lg font-semibold">Trusted Analysis</h3>
              </div>
              <p className="text-slate-300 text-sm">
                This analysis is generated by AI trained on thousands of verified customer reviews and technical specifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;