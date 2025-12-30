import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ResultsFallback() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand');
    const model = urlParams.get('model');
    const question = urlParams.get('question');
    
    setSearchData({ brand, model, question });
  }, []);

  if (!searchData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
        
        <div className="revolut-card">
          <h1 className="text-2xl font-bold text-white mb-4">
            Search Results for: {searchData.brand} {searchData.model}
          </h1>
          <p className="text-gray-300 mb-6">
            Question: "{searchData.question}"
          </p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">AI Analysis</h2>
            <p className="text-gray-400">
              The AI search feature is being configured. This is a placeholder result.
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Key Insights</h2>
            <ul className="text-gray-300 list-disc pl-5 space-y-2">
              <li>Product analysis coming soon</li>
              <li>Review summaries will appear here</li>
              <li>Price comparisons from multiple retailers</li>
              <li>Alternative recommendations</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Next Steps</h2>
            <p className="text-gray-400">
              The AI integration is being set up with OpenRouter. Once configured, 
              you'll get detailed analysis of {searchData.brand} {searchData.model} 
              answering: "{searchData.question}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
