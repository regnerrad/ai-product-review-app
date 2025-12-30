import React from "react";
import { Package, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function SearchSummary({ searchResult }) {
  if (!searchResult) return null;

  return (
    <div className="flex items-center gap-4 text-gray-400">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5" />
        <span className="font-medium text-white">
          {searchResult.brand} {searchResult.model}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4" />
        <span>Analyzed {format(new Date(searchResult.created_date), "MMM d, yyyy")}</span>
      </div>
    </div>
  );
}