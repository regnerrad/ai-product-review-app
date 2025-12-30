import React from 'react';

export function Dialog({ children, open, onOpenChange }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function DialogHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = '' }) {
  return <p className={`text-gray-600 mt-2 ${className}`}>{children}</p>;
}

export function DialogFooter({ children, className = '' }) {
  return <div className={`mt-6 flex justify-end gap-3 ${className}`}>{children}</div>;
}

export default Dialog;
