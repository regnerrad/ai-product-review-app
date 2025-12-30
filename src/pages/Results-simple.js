import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Results() {
  console.log("🚨 RESULTS COMPONENT MOUNTING");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  console.log("=== RESULTS PAGE DEBUG ===");
  console.log("Brand:", params.get('brand'));
  console.log("Model:", params.get('model'));
  console.log("Category:", params.get('category'));
  console.log("Question:", params.get('question'));
  console.log("========================");

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Insights</h1>
        <p className="text-slate-600 mb-8">Analysis for {params.get('brand')} {params.get('model')}</p>
        
        <div className="sleek-card p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Question</h2>
          <p className="text-lg text-slate-700">"{params.get('question')}"</p>
        </div>

        <div className="sleek-card p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">AI Analysis</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">OpenRouter API Status</h3>
              <p className="text-blue-700">API call would be made here with the search parameters.</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">Next Steps</h3>
              <p className="text-amber-700">Once this simple page loads, we'll restore the full AI insights functionality.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
