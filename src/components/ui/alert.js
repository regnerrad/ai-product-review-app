import React from 'react';

export function Alert({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '' }) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
}

export default Alert;
