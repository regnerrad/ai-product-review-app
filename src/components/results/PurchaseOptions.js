import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ShoppingBag, ExternalLink, Star } from "lucide-react";

// Shopee logo SVG component
const ShopeeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2L13.09 8.26L22 9L13.09 15.74L22 22L12 18L2 22L10.91 15.74L2 9L10.91 8.26L12 2Z" />
  </svg>
);

export default function PurchaseOptions({ options, brand, model }) {
  if (!options || options.length === 0) {
    return (
      <Card className="revolut-card border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="w-5 h-5" />
            Purchase Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No purchase options found for {brand} {model}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="revolut-card border-0 shadow-lg lg:sticky lg:top-24">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <ShoppingBag className="w-5 h-5" />
          Purchase Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.map((option, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-xl p-4 hover:border-blue-600/50 transition-colors bg-gray-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {option.is_shopee && <ShopeeIcon className="text-orange-500" />}
                <span className="font-semibold text-white">
                  {option.store}
                </span>
              </div>
              {(index === 0 || option.is_shopee) && (
                <Badge className="bg-green-600/20 border border-green-600/30 text-green-400">
                  {option.is_shopee ? (
                    <>
                      <ShopeeIcon className="w-3 h-3 mr-1" />
                      Recommended
                    </>
                  ) : (
                    <>
                      <Star className="w-3 h-3 mr-1" />
                      Best Deal
                    </>
                  )}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-2xl font-bold text-white">
                {option.price}
              </div>
              {option.availability && (
                <div className="text-sm text-gray-400">
                  {option.availability}
                </div>
              )}
            </div>

            <Button
              className="revolut-button w-full text-white font-semibold"
              onClick={() => window.open(option.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Buy from {option.store}
            </Button>
          </div>
        ))}

        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-800">
          Prices and availability may vary. Links may contain affiliate codes.
        </div>
      </CardContent>
    </Card>
  );
}