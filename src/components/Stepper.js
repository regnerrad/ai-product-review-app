import React from 'react';

const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;
        
        return (
          <div key={index} className="step-item">
            <div className={`step-circle ${isActive ? 'active-step-circle' : ''} ${isCompleted ? 'completed-step-circle' : ''}`}>
              {isCompleted ? (
                <span className="checkmark">✓</span>
              ) : (
                <span className={`step-number ${isActive ? 'active-step-number' : ''}`}>
                  {index + 1}
                </span>
              )}
            </div>
            <span className={`step-label ${isActive ? 'active-step-label' : ''} ${isCompleted ? 'completed-step-label' : ''}`}>
              {step}
            </span>
          </div>
        );
      })}
      <div className="connector-line" />
      
      <style jsx>{`
        .stepper-container {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          position: relative;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background-color: #E0E0E0;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 8px;
        }
        .active-step-circle {
          background-color: #007AFF;
        }
        .completed-step-circle {
          background-color: #34C759;
        }
        .step-number {
          font-size: 16px;
          font-weight: 600;
          color: #666;
        }
        .active-step-number {
          color: #FFF;
        }
        .checkmark {
          font-size: 18px;
          font-weight: bold;
          color: #FFF;
        }
        .step-label {
          font-size: 12px;
          color: #999;
          text-align: center;
        }
        .active-step-label {
          color: #007AFF;
          font-weight: 600;
        }
        .completed-step-label {
          color: #34C759;
          font-weight: 600;
        }
        .connector-line {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          height: 2px;
          background-color: #E0E0E0;
          z-index: 0;
        }
      `}</style>
    </div>
  );
};

export default Stepper;