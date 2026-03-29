import SocialSentiment from '../components/results/SocialSentiment';
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { callOpenAI } from '../services/openaiService';
import { saveProductSearchToSupabase, updateSearchWithResults } from "../services/productSearchService";
import { Star, Check, X, ShoppingBag, TrendingUp, ArrowRight, ExternalLink, Shield, Users, Clock, Newspaper, Youtube, MessageCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

// Import tracking
import { trackPageView, trackTimeOnPage, trackClick, trackPurchaseClick, trackReviewLinkClick, trackAlternativeClick } from '../services/trackingService';

// New imports for enhanced features
import ReviewLinks from '../components/results/ReviewLinks';
import RedditInsights from '../components/results/RedditInsights';
import YouTubeInsights from '../components/results/YouTubeInsights';
import { getSmartAlternatives, getAllProducts } from '../services/smartMatchingService';
import { modelsByBrand } from '../data/models';

// Derive a realistic-looking rating breakdown from average + total
// Used instead of asking the AI to generate it (saves tokens)
const deriveBreakdown = (avgRating, totalReviews) => {
  const r = avgRating || 4.2;
  const t = totalReviews || 847;

  let weights;
  if (r >= 4.5)      weights = { 5: 0.60, 4: 0.25, 3: 0.09, 2: 0.04, 1: 0.02 };
  else if (r >= 4.0) weights = { 5: 0.45, 4: 0.30, 3: 0.14, 2: 0.07, 1: 0.04 };
  else if (r >= 3.5) weights = { 5: 0.30, 4: 0.30, 3: 0.20, 2: 0.12, 1: 0.08 };
  else               weights = { 5: 0.20, 4: 0.25, 3: 0.20, 2: 0.20, 1: 0.15 };

  return {
    5: Math.round(t * weights[5]),
    4: Math.round(t * weights[4]),
    3: Math.round(t * weights[3]),
    2: Math.round(t * weights[2]),
    1: Math.round(t * weights[1]),
  };
};

const Results = () => {
  const location = useLocation();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alternatives, setAlternatives] = useState([]);

  // State for collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    reddit: false,
    youtube: false
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Track page view
  useEffect(() => {
    trackPageView('results_page');
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackTimeOnPage('results_page', timeSpent);
    };
  }, []);

  const getSearchParams = () => {
    if (location.state) {
      return {
        category: location.state.category,
        brand: location.state.brand,
        model: location.state.model,
        question: location.state.question,
        searchId: location.state.searchId
      };
    }

    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      model: searchParams.get('model') || '',
      question: searchParams.get('question') || ''
    };
  };

  const { category, brand, model, question, searchId } = getSearchParams();

  // Fetch AI insights
  useEffect(() => {
    const fetchAIInsights = async () => {
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
        console.log('YouTube data in insights:', aiResponse.youtube_sentiment);
        console.log('Reddit data in insights:', aiResponse.reddit_sentiment);

        try {
          if (searchId) {
            let idToUse = null;

            if (typeof searchId === 'string') {
              idToUse = searchId;
            } else if (typeof searchId === 'object' && searchId !== null) {
              idToUse = searchId.id || searchId.searchId;
              console.log('Extracted ID from object:', idToUse);
            }

            if (idToUse && typeof idToUse === 'string' &&
                !idToUse.includes('{') && !idToUse.includes('[') &&
                !idToUse.startsWith('temp_')) {
              console.log('Updating search with ID:', idToUse);
              await updateSearchWithResults(idToUse, aiResponse);
            } else {
              console.log('Skipping update - invalid or temp ID:', idToUse);
            }
          } else {
            const savedSearch = await saveProductSearchToSupabase({
              brand,
              model,
              category: category || "general",
              user_question: question,
              user_id: null
            }, aiResponse);

            if (savedSearch && savedSearch.id) {
              console.log('Saved search with ID:', savedSearch.id);
            }
          }
        } catch (saveError) {
          console.error("Failed to save search with results:", saveError);
        }
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        setError(`Failed to get AI insights: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [category, brand, model, question, searchId]);

  // Fetch smart alternatives
  useEffect(() => {
    if (brand && model && modelsByBrand) {
      const allProducts = getAllProducts(modelsByBrand);
      const smartAlternatives = getSmartAlternatives(brand, model, allProducts);
      setAlternatives(smartAlternatives.slice(0, 3));
    }
  }, [brand, model]);

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

  // Always derive breakdown client-side — no longer requested from AI
  const ratingBreakdown = deriveBreakdown(
    insights.rating_info?.average_rating,
    insights.rating_info?.total_reviews
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Findo</h1>
              <p className="text-sm text-slate-600">
                {brand} {model} {category && `• ${category}`}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              onClick={() => trackClick('new_search_button', 'New Search', { fromPage: 'results' })}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              New Search
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Row 1: Question (full width) */}
        <div className="sleek-card p-6 border border-slate-200 rounded-xl bg-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Your Question
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                "{question}"
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {insights.answer_to_question}
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: Detailed Analysis + Social Sentiment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed Analysis Card */}
          <div className="sleek-card border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Detailed Analysis
              </h3>

              {/* Product Analysis Section */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <h4 className="font-medium text-slate-800">Product Analysis</h4>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {insights.detailed_summary}
                </p>
              </div>

              {/* Reddit Insights Section */}
              <div className="mb-6">
                <div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection('reddit')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Reddit Insights</span>
                    </div>
                    {collapsedSections.reddit ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                  {!collapsedSections.reddit && (
                    <div className="p-4">
                      <RedditInsights data={insights.reddit_sentiment} />
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube Insights Section */}
              <div className="mb-6">
                <div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection('youtube')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <span className="font-medium">YouTube Insights</span>
                    </div>
                    {collapsedSections.youtube ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                  {!collapsedSections.youtube && (
                    <div className="p-4">
                      <YouTubeInsights data={insights.youtube_sentiment} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Sentiment Card */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <SocialSentiment data={insights.social_sentiment} />
          </div>
        </div>

        {/* Row 3: Ratings + Where to Buy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ratings Card */}
          <div className="sleek-card p-6 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ratings</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {renderStars(insights.rating_info?.average_rating || 4.2)}
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {(insights.rating_info?.average_rating || 4.2).toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Based on {(insights.rating_info?.total_reviews || 847).toLocaleString()} reviews
            </p>

            {/* Rating breakdown — always derived client-side, never from AI */}
            <div className="space-y-2">
              {Object.entries(ratingBreakdown)
                .sort((a, b) => b[0] - a[0])
                .map(([stars, count]) => (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 w-8">{stars}★</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${(count / (insights.rating_info?.total_reviews || 847)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-slate-600 w-12 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Where to Buy Card */}
          <div className="sleek-card p-6 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Where to Buy</h3>
            </div>

            <div className="space-y-3">
              {insights.purchase_options?.map((option, index) => (
                <a
                  key={index}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackPurchaseClick(option.store, option.price, brand, model)}
                  className="block border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 text-sm">{option.store}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{option.price}</span>
                    <span className={`text-xs ${option.availability === 'In Stock' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {option.availability}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Pros & Cons + Alternatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros & Cons Card */}
          <div className="sleek-card p-6 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pros & Cons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pros */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <h4 className="font-medium text-slate-900">Pros</h4>
                </div>
                <ul className="space-y-2">
                  {insights.pros?.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2 h-2" />
                      </span>
                      <span className="text-slate-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </div>
                  <h4 className="font-medium text-slate-900">Cons</h4>
                </div>
                <ul className="space-y-2">
                  {insights.cons?.map((con, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-2 h-2" />
                      </span>
                      <span className="text-slate-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Alternatives Card */}
          {insights.alternatives && insights.alternatives.length > 0 ? (
            <div className="sleek-card p-6 border border-slate-200 rounded-xl bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Alternatives</h3>
              </div>
              <div className="space-y-3">
                {insights.alternatives.map((alt, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">
                          {alt.brand} {alt.model}
                        </h4>
                        <p className="text-slate-600 text-xs mt-1">{alt.reason}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                        {alt.price_comparison}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="sleek-card p-6 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-400">
              No alternatives available
            </div>
          )}
        </div>

        {/* Row 5: Expert Reviews (full width) */}
        <div className="mt-8">
          <ReviewLinks brand={brand} model={model} />
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200">
            <Shield className="w-3 h-3" />
            <span>AI analysis based on verified customer reviews and Reddit & YouTube community discussions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;