
import React from "react";
import { Label } from "../../components/ui/label";
import { Smartphone, Laptop, Headphones, Camera, Tablet, Watch, Speaker, Gamepad2, Home, Package } from "lucide-react";

const categories = [
  { id: "smartphones", label: "Smartphones", icon: Smartphone },
  { id: "laptops", label: "Laptops", icon: Laptop },
  { id: "headphones", label: "Headphones", icon: Headphones },
  { id: "cameras", label: "Cameras", icon: Camera },
  { id: "tablets", label: "Tablets", icon: Tablet },
  { id: "smartwatches", label: "Smartwatches", icon: Watch },
  { id: "speakers", label: "Speakers", icon: Speaker },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "home_appliances", label: "Home", icon: Home },
  { id: "other", label: "Other", icon: Package }
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-slate-700">
        1. Select a category
      </Label>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = value === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onChange(isSelected ? "" : category.id)}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-6 h-6" />
              <div className="text-sm font-medium">{category.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
