import React from 'react';

export function Select({ children, value, onValueChange, className = '' }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className={`border border-gray-300 rounded-lg px-3 py-2 w-full bg-white ${className}`}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children, className = '', asChild }) {
  // If asChild is true, return children directly without wrapper
  if (asChild) {
    return <>{children}</>;
  }
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SelectItem({ children, value, className = '' }) {
  return (
    <option value={value} className={className}>
      {children}
    </option>
  );
}
