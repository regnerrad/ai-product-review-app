import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Sparkles, Star, TrendingUp, Shield, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function SignupPrompt({ isOpen, onClose, initialMode = 'signin' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Update isSignUp when initialMode changes
  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
    setShowForgotPassword(false);
    setError("");
    setSuccess("");
  }, [initialMode, isOpen]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setSuccess("Check your email for confirmation link!");
        setTimeout(() => onClose(false), 3000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onClose(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess("Password reset link sent! Check your email.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    onClose(true);
  };

  // Different content based on mode
  const getHeaderContent = () => {
    if (showForgotPassword) {
      return {
        title: "Reset Password",
        subtitle: "We'll send you a reset link"
      };
    } else if (isSignUp) {
      return {
        title: "Create Account",
        subtitle: "Join thousands making smarter choices"
      };
    } else {
      return {
        title: "Welcome Back",
        subtitle: "Sign in to continue"
      };
    }
  };

  const headerContent = getHeaderContent();

  // Render forgot password view
  if (showForgotPassword) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setShowForgotPassword(false);
          onClose(false);
        }
      }}>
        <DialogContent className="bg-white border-slate-200 max-w-sm mx-4 p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
          {/* Gradient Header - Smaller on mobile */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-6 text-white flex-shrink-0 relative">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold mb-1">
                {headerContent.title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-center text-indigo-100 text-xs max-w-xs mx-auto">
              {headerContent.subtitle}
            </p>
          </div>
          
          {/* Scrollable Content - Smaller padding on mobile */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-xs">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-2.5 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] hover:shadow-lg text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mx-auto block hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular sign in/sign up view - Mobile optimized
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose(false);
    }}>
      <DialogContent className="bg-white border-slate-200 max-w-sm mx-4 p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        {/* Gradient Header - Smaller on mobile */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-6 text-white flex-shrink-0 relative">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold mb-1">
              {headerContent.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-indigo-100 text-xs max-w-xs mx-auto">
            {headerContent.subtitle}
          </p>
          
          {/* Decorative sparkles - smaller on mobile */}
          <div className="absolute top-2 right-2 opacity-10">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Scrollable Content - Smaller padding on mobile */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-xs">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Google Sign In Button - Smaller on mobile */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 font-semibold py-2.5 px-3 rounded-xl transition-all hover:shadow-md text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 text-xs">Or with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-2.5 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] hover:shadow-lg text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mx-auto block hover:underline"
            >
              Forgot your password?
            </button>
          )}

          {/* Toggle between Sign In / Sign Up */}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mx-auto block hover:underline"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"}
          </button>

          {/* Benefits Section - Simplified on mobile */}
          <div className="pt-1">
            <div className="relative mb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 text-xs">Benefits</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-xs text-slate-600">Unlimited searches</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-xs text-slate-600">Save history</span>
              </div>
            </div>
          </div>

          {/* Continue as Guest */}
          <button
            onClick={handleContinueAsGuest}
            className="w-full text-xs text-slate-400 hover:text-indigo-600 transition-colors py-2 border-t border-slate-100 mt-1"
          >
            Continue as Guest (1 more search)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}