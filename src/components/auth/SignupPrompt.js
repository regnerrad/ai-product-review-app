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

  // Get header title based on mode
  const getHeaderTitle = () => {
    if (showForgotPassword) return "Reset Password";
    return isSignUp ? "Create Account" : "Sign In";
  };

  // Render forgot password view (keeping purple header for this one)
  if (showForgotPassword) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setShowForgotPassword(false);
          onClose(false);
        }
      }}>
        <DialogContent className="bg-white border-slate-200 max-w-md p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-8 text-white flex-shrink-0 relative">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                {getHeaderTitle()}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Scrollable Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mx-auto block hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular sign in/sign up view
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose(false);
    }}>
      <DialogContent className="bg-white border-slate-200 max-w-md p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Simple title */}
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">
          {getHeaderTitle()}
        </h2>
        
        <div className="space-y-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Sign In Form - Moved above Google */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* Google Sign In Button - Moved below */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Benefits Section - Added back */}
          <div className="pt-4">
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400">Why join?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-xs font-medium text-slate-700">Unlimited searches</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span className="text-xs font-medium text-slate-700">Save history</span>
              </div>
            </div>
          </div>

          {/* Forgot Password Link (only for sign in) */}
          {!isSignUp && (
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mx-auto block hover:underline"
            >
              Forgot your password?
            </button>
          )}

          {/* Toggle between Sign In / Sign Up */}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mx-auto block hover:underline"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"}
          </button>

          {/* Continue as Guest */}
          <button
            onClick={handleContinueAsGuest}
            className="w-full text-sm text-slate-400 hover:text-indigo-600 transition-colors py-2 border-t border-slate-100 mt-2"
          >
            Continue as Guest (1 more search)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}