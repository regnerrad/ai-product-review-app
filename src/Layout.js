import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, ShoppingBag, Zap, User, LogOut, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import { useAuth } from "./components/hooks/useAuth";
import SignupPrompt from "./components/auth/SignupPrompt";

// Simple dropdown components with state handling
const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;
const DropdownMenuTrigger = ({ asChild, children, onClick, ...props }) => 
  asChild ? children : <button onClick={onClick} {...props}>{children}</button>;
const DropdownMenuContent = ({ children, className, align, open }) => {
  if (!open) return null;
  return (
    <div className={`absolute bg-white border rounded-lg shadow-lg mt-1 z-50 ${className} ${align === 'end' ? 'right-0' : 'left-0'}`}>
      {children}
    </div>
  );
};
const DropdownMenuItem = ({ asChild, children, className, onClick }) => 
  asChild ? children : <div className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${className}`} onClick={onClick}>{children}</div>;
const DropdownMenuSeparator = ({ className }) => <div className={`border-t my-1 ${className}`} />;

// Simple createPageUrl function
const createPageUrl = (page) => {
  const pages = {
    "Home": "/",
    "History": "/history",
    "Settings": "/settings",
    "ManageAffiliate": "/manage-affiliate"
  };
  return pages[page] || "/";
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // State for signup prompt
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupMode, setSignupMode] = useState('signin');
  
  // State for dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const handleSignupPromptClose = (allowOneMore = false) => {
    setShowSignupPrompt(false);
  };

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <style>{/* ... keep your existing styles ... */}</style>

      {/* Header */}
      <header className="light-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Findo
              </h1>
            </Link>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-full">
                {/* Navigation links if any */}
              </nav>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 rounded-full p-1 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
                      <span className="text-sm font-bold text-indigo-700">
                        {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </Button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 shadow-xl rounded-xl z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <>
                          <Link
                            to={createPageUrl("Settings")}
                            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <SettingsIcon className="w-4 h-4 mr-3" />
                            App Settings
                          </Link>
                          <Link
                            to={createPageUrl("ManageAffiliate")}
                            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <ShoppingBag className="w-4 h-4 mr-3" />
                            Manage Affiliate Links
                          </Link>
                        </>
                      )}
                      <div className="border-t border-slate-200 my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSignupMode('signin');
                      setShowSignupPrompt(true);
                    }}
                    className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-5 py-2 rounded-lg transition-all font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setSignupMode('signup');
                      setShowSignupPrompt(true);
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] font-medium"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 mt-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-600 font-medium">Findo</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} • AI-Powered Product Research
            </div>
          </div>
        </div>
      </footer>

      {/* Signup Prompt Modal */}
      <SignupPrompt 
        isOpen={showSignupPrompt}
        onClose={handleSignupPromptClose}
        initialMode={signupMode}
      />
    </div>
  );
}