import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Sparkles, TrendingUp, Shield, Users, Clock, ShoppingBag } from "lucide-react";

import BrandSelector from "../components/search/BrandSelector";
import QuestionInput from "../components/search/QuestionInput";
import CategoryFilter from "../components/search/CategoryFilter";
import SignupPrompt from "../components/auth/SignupPrompt";

import { useAuth } from "../components/hooks/useAuth";
import { useSessionTracking } from "../components/hooks/useSessionTracking";
import { findSimilarCachedResults } from "../components/utils/cacheUtils";

// Local createPageUrl function
const createPageUrl = (page) => {
  const pages = {
    "Home": "/",
    "Results": "/results",
    "Settings": "/settings",
    "ManageAffiliate": "/manage-affiliate"
  };
  return pages[page] || "/";
};

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { sessionData, incrementSearchCount } = useSessionTracking();
  
  const [searchData, setSearchData] = useState({
    brand: "",
    model: "",
    category: "",
    question: ""
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [similarResults, setSimilarResults] = useState([]);

  // Check for similar cached results when brand and model are selected
  useEffect(() => {
    if (searchData.brand && searchData.model) {
      loadSimilarResults();
    } else {
      setSimilarResults([]);
    }
  }, [searchData.brand, searchData.model]);

  const loadSimilarResults = async () => {
    try {
      const similar = await findSimilarCachedResults(
        searchData.brand, 
        searchData.model, 
        searchData.question || "general review", 
        3
      );
      setSimilarResults(similar);
    } catch (error) {
      console.error("Error loading similar results:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchData.brand || !searchData.model || !searchData.question) {
      return;
    }

    // Check if user needs to sign up (only for non-authenticated users)
    if (!isAuthenticated && sessionData && sessionData.requires_signup) {
      setShowSignupPrompt(true);
      return;
    }

    setIsSearching(true);
    
    // FIXED: Navigate to results with state instead of URL parameters
    navigate("/results", {
      state: {
        brand: searchData.brand,
        model: searchData.model,
        category: searchData.category,
        question: searchData.question
      }
    });
  };

  const handleUseSimilarResult = (result) => {
    // FIXED: Navigate with state instead of URL parameters
    navigate("/results", {
      state: {
        brand: result.brand,
        model: result.model,
        category: result.category || "",
        question: result.user_question
      }
    });
  };

  const updateSearchData = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupPromptClose = (allowOneMore = false) => {
    setShowSignupPrompt(false);
    if (allowOneMore) {
      // Continue with search after allowing one more
      handleSearch();
    }
  };

  const isSearchReady = searchData.brand && searchData.model && searchData.question;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Search Interface - Now at the top */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Product Research
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Make The Right Choice,
                <br/>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Every Time.
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                Skip the endless research - get unbiased, AI-powered insights from thousands of reviews to find the perfect product for your needs.
              </p>
              
              {!isAuthenticated && (
                <div className="text-sm">
                  {sessionData?.search_count >= 1 ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-200 text-amber-800 rounded-full">
                      ⚠️ Sign up to continue searching
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-full">
                      💡 1 free search for guests
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sleek-card p-8 md:p-10">
              <div className="space-y-8">
                <CategoryFilter 
                  value={searchData.category}
                  onChange={(value) => updateSearchData("category", value)}
                />
                
                <BrandSelector
                  category={searchData.category}
                  brand={searchData.brand}
                  model={searchData.model}
                  onBrandChange={(value) => updateSearchData("brand", value)}
                  onModelChange={(value) => updateSearchData("model", value)}
                />
                
                <QuestionInput
                  value={searchData.question}
                  onChange={(value) => updateSearchData("question", value)}
                  brand={searchData.brand}
                  model={searchData.model}
                />

                {similarResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Clock className="w-4 h-4" />
                      Popular questions for {searchData.brand} {searchData.model}:
                    </div>
                    <div className="grid gap-3">
                      {similarResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleUseSimilarResult(result)}
                          className="text-left p-4 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                              "{result.user_question}"
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Users className="w-3 h-3" />
                              {result.usage_count} searches
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleSearch}
                    disabled={!isSearchReady || isSearching}
                    className="sleek-button px-10 py-4 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        Get AI Insights
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - More natural and less template-ish */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Why thousands trust ProductSense
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Skip the endless research. Get the answers you need in seconds.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="sleek-card p-8 text-left">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg">Real insights, not marketing</h3>
                <p className="text-slate-600">Our AI reads thousands of actual customer reviews to give you unbiased pros and cons specific to your question - not just the good ones.</p>
              </div>

              <div className="sleek-card p-8 text-left">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg">Verified information only</h3>
                <p className="text-slate-600">We analyze reviews from verified purchases and trusted sources, filtering out fake reviews and promotional content.</p>
              </div>

              <div className="sleek-card p-8 text-left">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg">Best deals, automatically</h3>
                <p className="text-slate-600">Find the best prices across multiple retailers without opening dozens of tabs or comparing manually.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SignupPrompt 
        isOpen={showSignupPrompt}
        onClose={handleSignupPromptClose}
      />
    </>
  );
}