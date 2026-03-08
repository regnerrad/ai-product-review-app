import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, ShoppingBag, Zap, User, LogOut, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import { useAuth } from "./components/hooks/useAuth";
import SignupPrompt from "./components/auth/SignupPrompt";

// Simple dropdown components since dropdown-menu.js doesn't exist
const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;
const DropdownMenuTrigger = ({ asChild, children, ...props }) => 
  asChild ? children : <button {...props}>{children}</button>;
const DropdownMenuContent = ({ children, className, align }) => (
  <div className={`absolute bg-white border rounded-lg shadow-lg mt-1 z-50 ${className} ${align === 'end' ? 'right-0' : 'left-0'}`}>
    {children}
  </div>
);
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

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const handleSignupPromptClose = (allowOneMore = false) => {
    setShowSignupPrompt(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <style>
        {`
          :root {
            --background: #f8fafc;
            --surface: #ffffff;
            --primary: #0f172a;
            --primary-muted: #64748b;
            --accent: #4f46e5;
            --accent-hover: #4338ca;
            --border: #e2e8f0;
            --border-hover: #cbd5e1;
          }
          
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          }
          
          .sleek-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .sleek-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07);
          }
          
          .sleek-button {
            background-color: var(--accent);
            border-radius: 12px;
            font-weight: 600;
            padding: 12px 24px;
            color: white;
            box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.1), inset 0 2px 0 0 rgba(255, 255, 255, 0.1);
            transition: all 0.2s ease-in-out;
          }

          .sleek-button:hover {
            transform: translateY(-1px);
            background-color: var(--accent-hover);
            box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
          }
          
          .sleek-input {
            background: #f1f5f9;
            border: 1px solid var(--border);
            border-radius: 12px;
            color: var(--primary);
            transition: all 0.2s ease;
          }
          
          .sleek-input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            background: var(--surface);
          }
          
          .nav-link {
            padding: 8px 16px;
            border-radius: 999px;
            font-weight: 500;
            font-size: 0.875rem;
            color: var(--primary-muted);
            transition: all 0.2s ease;
          }
          
          .nav-link.active {
            color: var(--accent);
            background-color: #eef2ff;
          }
          
          .nav-link:hover:not(.active) {
            color: var(--primary);
          }
          
          .light-header {
            background-color: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
          }

          .prose {
             color: var(--primary);
          }
          .prose-slate {
             --tw-prose-body: #334155;
             --tw-prose-headings: #0f172a;
             --tw-prose-lead: #475569;
             --tw-prose-bold: #0f172a;
             --tw-prose-counters: #64748b;
             --tw-prose-bullets: #cbd5e1;
          }
        `}
      </style>

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
              </nav>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 rounded-full p-1 transition-all duration-300">
                      <div className="w-9 h-9 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
                        <span className="text-sm font-bold text-indigo-700">
                          {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-slate-200 shadow-xl rounded-xl w-56" align="end">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("Settings")} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex items-center p-2 rounded-md">
                            <SettingsIcon className="w-4 h-4 mr-3" />
                            App Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("ManageAffiliate")} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex items-center p-2 rounded-md">
                            <ShoppingBag className="w-4 h-4 mr-3" />
                            Manage Affiliate Links
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 cursor-pointer flex items-center p-2 rounded-md">
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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