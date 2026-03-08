import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Sparkles, TrendingUp, Shield, Users, Clock, ShoppingBag } from "lucide-react";

import BrandSelector from "../components/search/BrandSelector";
import QuestionInput from "../components/search/QuestionInput";
import CategoryFilter from "../components/search/CategoryFilter";
import SignupPrompt from "../components/auth/SignupPrompt";
import Stepper from "../components/Stepper";
import { saveProductSearchToSupabase, findSimilarCachedResults } from "../services/productSearchService";
import { useAuth } from "../components/hooks/useAuth";
import { useSessionTracking } from "../components/hooks/useSessionTracking";
import { STEPS, STEP_CONFIG } from "../config/steps";

// Import tracking service
import { trackPageView, trackTimeOnPage, trackClick } from "../services/trackingService";

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
  
  // Track which step is currently active for highlighting
  const [activeStep, setActiveStep] = useState(1);
  const [stepData, setStepData] = useState({
    category: "",
    brand: "", 
    model: "",
    question: ""
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [similarResults, setSimilarResults] = useState([]);
  const [showManualModelInput, setShowManualModelInput] = useState(false);

  // Track page view when component mounts
  useEffect(() => {
    trackPageView('home_page');
  }, []);

  // Track time spent on page when component unmounts
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackTimeOnPage('home_page', timeSpent);
    };
  }, []);

  // Load suggestions on initial mount and when brand/model changes
  useEffect(() => {
    loadSimilarResults();
  }, [stepData.brand, stepData.model]);

  const loadSimilarResults = async () => {
    try {
      // If brand and model are selected, load specific suggestions
      if (stepData.brand && stepData.model) {
        const similar = await findSimilarCachedResults(
          stepData.brand, 
          stepData.model, 
          stepData.category || "general",
          stepData.question || ""
        );
        setSimilarResults(similar.slice(0, 5));
      } 
      // Otherwise, load general/trending suggestions
      else {
        // You might want to create a new function for general suggestions
        // For now, we'll show some placeholder or load from a default category
        const generalSuggestions = [
          { user_question: "Is it good for gaming?", usage_count: 45 },
          { user_question: "How is the battery life?", usage_count: 32 },
          { user_question: "Is it worth the price?", usage_count: 28 },
          { user_question: "How does the camera perform?", usage_count: 24 },
          { user_question: "Is it durable and long-lasting?", usage_count: 19 }
        ];
        setSimilarResults(generalSuggestions);
      }
    } catch (error) {
      console.error("Error loading similar results:", error);
      // Show default suggestions even on error
      const defaultSuggestions = [
        { user_question: "Is it good for gaming?", usage_count: 0 },
        { user_question: "How is the battery life?", usage_count: 0 },
        { user_question: "Is it worth the price?", usage_count: 0 }
      ];
      setSimilarResults(defaultSuggestions);
    }
  };

  const handleSearch = async () => {
    // Track the search button click
    trackClick('search_button', 'Get AI Insights', {
      brand: stepData.brand,
      model: stepData.model,
      question: stepData.question,
      category: stepData.category,
      isAuthenticated
    });

    if (!stepData.brand || !stepData.model || !stepData.question) {
      return;
    }

    if (!isAuthenticated && sessionData && sessionData.requires_signup) {
      setShowSignupPrompt(true);
      return;
    }

    setIsSearching(true);

    let searchId = null;
    
    try {
      searchId = await saveProductSearchToSupabase({
        brand: stepData.brand,
        model: stepData.model,
        category: stepData.category,
        user_question: stepData.question,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error("Failed to save search:", error);
    }
    
    navigate("/results", {
      state: {
        brand: stepData.brand,
        model: stepData.model,
        category: stepData.category,
        question: stepData.question,
        searchId: searchId
      }
    });
  };

  const handleUseSimilarResult = (result) => {
    // Track suggestion click
    trackClick('suggestion_click', result.user_question, {
      brand: stepData.brand,
      model: stepData.model
    });
    
    updateStepData("question", result.user_question);
  };

  const updateStepData = (field, value) => {
    setStepData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupPromptClose = (allowOneMore = false) => {
    setShowSignupPrompt(false);
    if (allowOneMore) {
      handleSearch();
    }
  };

  const isSearchReady = stepData.brand && stepData.model && stepData.question;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
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
              <div className="mb-10">
                <Stepper currentStep={activeStep} steps={STEPS} />
              </div>
              
              <div className="space-y-10">
                {/* Step 1: Category */}
                <div className={`step-section ${activeStep >= 1 ? 'active' : ''}`}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{STEP_CONFIG[1].title}</h3>
                    <p className="text-slate-600">{STEP_CONFIG[1].description}</p>
                  </div>
                  <CategoryFilter 
                    value={stepData.category}
                    onChange={(value) => {
                      // Update category
                      updateStepData("category", value);
                      // Reset brand and model when category changes
                      setStepData(prev => ({ ...prev, brand: "", model: "" }));
                    }}
                  />
                </div>
                
                {/* Step 2: Product */}
                <div className={`step-section ${activeStep >= 2 ? 'active' : ''}`}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{STEP_CONFIG[2].title}</h3>
                    <p className="text-slate-600">{STEP_CONFIG[2].description}</p>
                  </div>
                  <BrandSelector
                    category={stepData.category}
                    brand={stepData.brand}
                    model={stepData.model}
                    onBrandChange={(value) => updateStepData("brand", value)}
                    onModelChange={(value) => updateStepData("model", value)}
                    showManualInput={showManualModelInput}
                    onShowManualInput={setShowManualModelInput}
                  />
                </div>
                
                {/* Step 3: Question */}
                <div className={`step-section ${activeStep >= 3 ? 'active' : ''}`}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{STEP_CONFIG[3].title}</h3>
                    <p className="text-slate-600">{STEP_CONFIG[3].description}</p>
                  </div>
                  <QuestionInput
                    value={stepData.question}
                    onChange={(value) => updateStepData("question", value)}
                    brand={stepData.brand}
                    model={stepData.model}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
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

        {/* Benefits Section */}
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