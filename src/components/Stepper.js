import React from 'react';

export default function Stepper({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${currentStep >= step.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
                }`}
            >
              {step.id}
            </div>
            <span className="text-xs mt-2 text-slate-600 font-medium">
              {step.title}
            </span>
          </div>
          
          {/* Connector line - only if not last step */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-4 bg-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}