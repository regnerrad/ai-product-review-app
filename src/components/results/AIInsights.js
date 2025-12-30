import React from 'react';

export default function AIInsights({ answer, summary, usedCache }) {
  return (
    <div className="revolut-card p-6">
      <h3 className="font-semibold text-white mb-4">AI Insights</h3>
      {answer && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-blue-400 mb-2">Answer to your question:</h4>
          <p className="text-gray-300">{answer}</p>
        </div>
      )}
      {summary && (
        <div>
          <h4 className="text-lg font-medium text-blue-400 mb-2">Detailed Analysis:</h4>
          <p className="text-gray-300">{summary}</p>
        </div>
      )}
      {usedCache && (
        <div className="mt-4 text-sm text-green-400">
          ⚡ Instant result from cache
        </div>
      )}
    </div>
  );
}
