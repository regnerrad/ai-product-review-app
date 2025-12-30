import React from 'react';

export function Button({ children, onClick, disabled, className = '', variant = 'default', size = 'default' }) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  const sizes = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
