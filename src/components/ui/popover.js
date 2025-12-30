import React, { useState } from 'react';

export function Popover({ children, trigger }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function PopoverContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function PopoverTrigger({ children }) {
  return <>{children}</>;
}

export default Popover;
