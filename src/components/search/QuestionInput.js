
import React, { useState } from "react";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Lightbulb } from "lucide-react";

const suggestedQuestions = [
  "Is this worth the price?",
  "How does it compare to competitors?",
  "What are the main pros and cons?",
  "Is it good for beginners?",
  "How's the build quality?",
  "What do long-term users say?",
  "Any common issues or problems?",
  "Is it good value for money?"
];

export default function QuestionInput({ value, onChange, brand, model }) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const productName = brand && model ? `${brand} ${model}` : "this product";

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
        4. Ask a question
      </Label>
      {/* Guiding text for the user */}
      <p className="text-sm text-slate-500">
        Ask a specific question about {productName} to receive a tailored review focusing on what matters to you.
      </p>
      
      <Textarea
        placeholder={`e.g., "How is the battery life?" or "Is it good for gaming?"`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sleek-input min-h-[120px] text-base resize-none p-4"
        onFocus={() => setShowSuggestions(false)}
      />

      {showSuggestions && !value && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Suggestions:
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(question)}
                className="text-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 transition-colors"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
