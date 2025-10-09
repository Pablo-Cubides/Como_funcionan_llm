interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={`relative flex-1 ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-blue-600" />
                </div>
                <button
                  onClick={() => onStepChange(stepIdx)}
                  className="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">{step}</span>
                </button>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-700" />
                </div>
                <button
                  onClick={() => onStepChange(stepIdx)}
                  className="relative w-8 h-8 flex items-center justify-center bg-slate-800 border-2 border-blue-600 rounded-full"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </button>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-700" />
                </div>
                <button
                  onClick={() => onStepChange(stepIdx)}
                  className="group relative w-8 h-8 flex items-center justify-center bg-slate-800 border-2 border-slate-700 rounded-full hover:border-slate-500"
                >
                  <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-slate-500" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </button>
              </>
            )}
             <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-400 whitespace-nowrap">{step}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
