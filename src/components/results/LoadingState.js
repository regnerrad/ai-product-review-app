import React from "react";
import { Sparkles, Search, TrendingUp, Database, Clock } from "lucide-react";

export default function LoadingState({ usedCache = false }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-xl animate-ping" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          {usedCache ? "Loading Cached Results" : "Analyzing Product Reviews"}
        </h2>
        
        <div className="space-y-3 mb-8">
          {usedCache ? (
            <>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Database className="w-4 h-4" />
                <span>Found cached analysis...</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Loading instantly...</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Search className="w-4 h-4" />
                <span>Searching latest reviews...</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Analyzing user feedback...</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Generating insights...</span>
              </div>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {usedCache ? "Almost ready!" : "This usually takes 10-15 seconds"}
        </div>
      </div>
    </div>
  );
}