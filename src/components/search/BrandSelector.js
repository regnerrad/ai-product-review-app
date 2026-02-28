import React, { useState, useEffect } from "react";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ChevronDown, Search, Plus, X } from "lucide-react";
import { getModelsForBrand } from "../../data/models";

export default function BrandSelector({ 
  category, 
  brand, 
  model, 
  onBrandChange, 
  onModelChange,
  showManualInput,
  onShowManualInput
}) {
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);

  // Update available models when brand changes
  useEffect(() => {
    if (brand) {
      const models = getModelsForBrand(brand);
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }
  }, [brand]);

  // Mock brand list (you can expand this)
  const popularBrands = [
    "Apple", "Samsung", "Google", "OnePlus", "Xiaomi",
    "Sony", "Bose", "Sennheiser", "Beats",
    "Dell", "HP", "Lenovo", "ASUS", "Acer", "Microsoft",
    "LG", "TCL", "Hisense"
  ];

  const filteredBrands = popularBrands.filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredModels = availableModels.filter(m => 
    m.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleSelectBrand = (selectedBrand) => {
    onBrandChange(selectedBrand);
    onModelChange(""); // Reset model when brand changes
    setBrandSearch("");
    setShowBrandDropdown(false);
  };

  const handleSelectModel = (selectedModel) => {
    onModelChange(selectedModel);
    setModelSearch("");
    setShowModelDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* Brand Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium text-slate-700">Brand</Label>
        <div className="relative">
          <div
            onClick={() => setShowBrandDropdown(!showBrandDropdown)}
            className={`w-full px-4 py-3 bg-white border rounded-lg flex items-center justify-between transition-all duration-200 cursor-pointer ${
              showBrandDropdown 
                ? 'border-indigo-500 ring-2 ring-indigo-200' 
                : 'border-slate-200 hover:border-indigo-200'
            }`}
          >
            <span className={brand ? "text-slate-900" : "text-slate-400"}>
              {brand || "Select a brand"}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-all duration-200 ${
              showBrandDropdown ? "rotate-180 text-indigo-500" : ""
            }`} />
          </div>

          {showBrandDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    autoFocus
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => handleSelectBrand(b)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        brand === b 
                          ? "bg-indigo-50 text-indigo-700" 
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-400 italic">
                    No brands found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-slate-700">Model</Label>
          {brand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowManualInput(!showManualInput)}
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              {showManualInput ? (
                <span className="flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Hide manual input
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Can't find your model?
                </span>
              )}
            </Button>
          )}
        </div>

        {showManualInput ? (
          <Input
            placeholder="Enter model manually (e.g., iPhone 14 Pro)"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="sleek-input"
          />
        ) : (
          <div className="relative">
            <div
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`w-full px-4 py-3 bg-white border rounded-lg flex items-center justify-between transition-all duration-200 ${
                !brand ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${
                showModelDropdown 
                  ? 'border-indigo-500 ring-2 ring-indigo-200' 
                  : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <span className={model ? "text-slate-900" : "text-slate-400"}>
                {model || (brand ? "Select a model" : "Select a brand first")}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-all duration-200 ${
                showModelDropdown ? "rotate-180 text-indigo-500" : ""
              }`} />
            </div>

            {showModelDropdown && brand && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      autoFocus
                      placeholder="Search models..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((m) => (
                      <button
                        key={m}
                        onClick={() => handleSelectModel(m)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          model === m 
                            ? "bg-indigo-50 text-indigo-700" 
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-400 italic">
                      {availableModels.length === 0 
                        ? "No models available for this brand" 
                        : "No matching models found"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {brand && availableModels.length > 0 && !showManualInput && (
          <p className="text-xs text-slate-400 mt-1">
            {availableModels.length} models available
          </p>
        )}
      </div>
    </div>
  );
}