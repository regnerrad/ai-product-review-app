import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      {...props}
    />
  );
}

export default Input;
