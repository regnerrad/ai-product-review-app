import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Star, ThumbsUp, ThumbsDown, BarChart3 } from "lucide-react";
import { Progress } from "../../components/ui/progress";

export default function ReviewAnalysis({ rating, pros, cons, ratingBreakdown }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-600"
        }`}
      />
    ));
  };

  return (
    <Card className="revolut-card border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="w-5 h-5" />
          Review Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Overall Rating */}
        {rating?.average_rating && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">
                {rating.average_rating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {renderStars(rating.average_rating)}
              </div>
              <div className="text-sm text-gray-400">
                Based on {rating.total_reviews?.toLocaleString()} reviews
              </div>
            </div>

            {ratingBreakdown && (
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingBreakdown[`${stars === 1 ? 'one' : stars === 2 ? 'two' : stars === 3 ? 'three' : stars === 4 ? 'four' : 'five'}_star`] || 0;
                  const percentage = rating.total_reviews ? (count / rating.total_reviews) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-12 text-gray-300">{stars} star</span>
                      <Progress value={percentage} className="flex-1 h-2 bg-gray-700" />
                      <span className="w-12 text-gray-400">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-8">
          {pros && pros.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-green-400 mb-4">
                <ThumbsUp className="w-5 h-5" />
                What Users Love
              </h4>
              <ul className="space-y-2">
                {pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cons && cons.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-red-400 mb-4">
                <ThumbsDown className="w-5 h-5" />
                Common Complaints
              </h4>
              <ul className="space-y-2">
                {cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}