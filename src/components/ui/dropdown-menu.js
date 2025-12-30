import React from 'react';

export const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;

export const DropdownMenuTrigger = ({ asChild, children, ...props }) => 
  asChild ? children : <button {...props}>{children}</button>;

export const DropdownMenuContent = ({ children, className, align }) => (
  <div className={`absolute bg-white border rounded-lg shadow-lg mt-1 z-50 ${className} ${align === 'end' ? 'right-0' : 'left-0'}`}>
    {children}
  </div>
);

export const DropdownMenuItem = ({ asChild, children, className, onClick }) => 
  asChild ? children : <div className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${className}`} onClick={onClick}>{children}</div>;

export const DropdownMenuSeparator = ({ className }) => <div className={`border-t my-1 ${className}`} />;
