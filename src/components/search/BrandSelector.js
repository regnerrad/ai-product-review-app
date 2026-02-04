import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { InvokeLLM } from "../../integrations/Core";

const categoryBrands = {
  smartphones: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Huawei", "Sony", "Motorola", "Nothing", "Oppo"],
  laptops: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI", "Razer", "Framework"],
  headphones: ["Sony", "Bose", "Apple", "Sennheiser", "Audio-Technica", "Beyerdynamic", "JBL", "Beats", "Focal", "Grado"],
  cameras: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus", "Leica", "Pentax", "Hasselblad", "GoPro"],
  tablets: ["Apple", "Samsung", "Microsoft", "Amazon", "Lenovo", "Huawei", "Google", "Xiaomi", "OnePlus", "ASUS"],
  smartwatches: ["Apple", "Samsung", "Garmin", "Fitbit", "Amazfit", "Fossil", "Suunto", "Polar", "TicWatch", "Withings"],
  speakers: ["Sonos", "JBL", "Bose", "Marshall", "KEF", "B&W", "Klipsch", "Harman Kardon", "Ultimate Ears", "Bang & Olufsen"],
  gaming: ["Sony", "Microsoft", "Nintendo", "ASUS", "MSI", "Alienware", "Corsair", "Razer", "SteelSeries", "Logitech"],
  home_appliances: ["Dyson", "Shark", "iRobot", "Nest", "Philips", "Samsung", "LG", "Whirlpool", "KitchenAid", "Breville"]
};

export default function BrandSelector({ 
  category, 
  brand, 
  model, 
  onBrandChange, 
  onModelChange,
  showManualInput = false,
  onShowManualInput 
}) {
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [loadModelsError, setLoadModelsError] = useState(false);
  const [customModel, setCustomModel] = useState("");

  const brands = category ? categoryBrands[category] || [] : Object.values(categoryBrands).flat();
  const uniqueBrands = [...new Set(brands)].sort();

  useEffect(() => {
    if (brand && category && !showManualInput) {
      loadModels();
    } else {
      setAvailableModels([]);
      setLoadModelsError(false);
    }
  }, [brand, category, showManualInput]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    setLoadModelsError(false);
    try {
      console.log('DEBUG: loadModels called with brand:', brand, 'category:', category);
      const response = await InvokeLLM({
        prompt: `List the most popular and current ${brand} ${category} models available in 2024. Include both current and recent models that people commonly search for. Focus on models that are widely reviewed and available for purchase. Return just the model names, one per line, without the brand name.`,
        add_context_from_internet: true
      });

      const models = response.split('\n')
        .filter(line => line.trim())
        .map(line => line.trim().replace(/^[-•*]\s*/, ''))
        .filter(model => model && !model.toLowerCase().includes(brand.toLowerCase()))
        .slice(0, 15);

      setAvailableModels(models);
      
      // If no models returned, show manual input
      if (models.length === 0) {
        setLoadModelsError(true);
        if (onShowManualInput) onShowManualInput(true);
      }
    } catch (error) {
      console.error('DEBUG: Error loading models:', error);
      setLoadModelsError(true);
      if (onShowManualInput) onShowManualInput(true);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelChange = (value) => {
    if (value === "custom") {
      setCustomModel("");
      onModelChange("");
      if (onShowManualInput) onShowManualInput(true);
    } else {
      setCustomModel("");
      onModelChange(value);
      if (onShowManualInput) onShowManualInput(false);
    }
  };

  const handleCustomModelChange = (e) => {
    const value = e.target.value;
    setCustomModel(value);
    onModelChange(value);
  };

  // Show manual input if: explicitly requested OR error loading models OR no models available
  const shouldShowManualInput = showManualInput || loadModelsError || (availableModels.length === 0 && brand && !isLoadingModels);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-gray-700 mb-3 block">
          2. Select Brand
        </Label>
        <Select value={brand} onValueChange={onBrandChange}>
          <SelectTrigger className="sleek-input h-12 text-base">
            <SelectValue placeholder="Choose a brand..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {uniqueBrands.map((brandName) => (
              <SelectItem key={brandName} value={brandName} className="text-base py-2.5 text-gray-700 hover:bg-gray-100">
                {brandName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-medium text-gray-700 mb-3 block">
          3. Select Model
        </Label>
        
        {isLoadingModels ? (
          <div className="h-12 border border-gray-200 bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
              Loading {brand} models...
            </div>
          </div>
        ) : shouldShowManualInput ? (
          <div className="space-y-3">
            {loadModelsError && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Unable to load model list. Please enter the model name manually.
              </div>
            )}
            <Input
              placeholder={`Enter the full model name (e.g., iPhone 15 Pro, Galaxy S24 Ultra)`}
              value={customModel || model}
              onChange={handleCustomModelChange}
              disabled={!brand}
              className="sleek-input h-12 text-base"
            />
            {availableModels.length > 0 && (
              <button
                onClick={() => onShowManualInput && onShowManualInput(false)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                ← Back to model list
              </button>
            )}
          </div>
        ) : (
          <>
            <Select 
              value={model && availableModels.includes(model) ? model : ""} 
              onValueChange={handleModelChange} 
              disabled={!brand}
            >
              <SelectTrigger className="sleek-input h-12 text-base">
                <SelectValue placeholder={brand ? `Choose ${brand} model...` : "Choose model (select brand first)"} />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {availableModels.map((modelName) => (
                  <SelectItem key={modelName} value={modelName} className="text-base py-2.5 text-gray-700 hover:bg-gray-100">
                    {modelName}
                  </SelectItem>
                ))}
                <SelectItem value="custom" className="text-base py-2.5 font-medium text-indigo-600 hover:bg-gray-100">
                  + Enter model manually
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}