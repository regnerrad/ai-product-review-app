import React from 'react';

export function Progress({ value = 0, className = '' }) {
  return (
    <div className={`bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default Progress;
