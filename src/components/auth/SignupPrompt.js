import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Sparkles, Star, TrendingUp, Shield } from "lucide-react";

export default function SignupPrompt({ isOpen, onClose }) {
  const handleSignup = async () => {
    // This would normally redirect to a signup page
    // For now, just close the dialog
    console.log("Redirect to signup page");
    onClose(false);
    // In a real implementation, you would do:
    // window.location.href = "/signup";
  };

  const handleContinueAsGuest = () => {
    // Allow one more search as guest
    onClose(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-4">
            Unlock Full Access
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-300 leading-relaxed">
              You've used your free search! Sign up to get unlimited AI-powered product insights.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <span>Unlimited product searches</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Save your search history</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span>Faster results with cached insights</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignup}
              className="revolut-button w-full text-white font-semibold"
            >
              Sign Up - It's Free!
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Continue as Guest (1 more search)
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Sign up with Google • No spam, ever • Free forever
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
