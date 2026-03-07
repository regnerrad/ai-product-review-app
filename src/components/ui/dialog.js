import React, { useRef, useEffect } from 'react';

export function Dialog({ children, open, onOpenChange }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onOpenChange(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
      // Restore body scroll when dialog closes
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300"
      >
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