interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <div className="bg-[#1f1f23] border-b border-gray-600 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Paso {currentStep + 1} de {steps.length}
        </h2>
        <div className="text-lg text-gray-300">
          {Math.round(((currentStep) / (steps.length - 1)) * 100)}% completado
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <button
              onClick={() => onStepChange(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                index <= currentStep
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              } ${index < currentStep ? 'hover:bg-red-500' : ''}`}
              disabled={index > currentStep}
            >
              {index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 transition-all duration-200 ${
                  index < currentStep ? 'bg-red-600' : 'bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              index === currentStep
                ? 'bg-red-600 text-white'
                : index < currentStep
                ? 'bg-gray-600 text-white hover:bg-gray-500'
                : 'bg-gray-700 text-gray-400'
            }`}
            disabled={index > currentStep}
          >
            {step}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="navigation-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>
        
        <button
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="navigation-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
