'use client';

import { useState } from 'react';

export default function TestPage() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');

  const handleRestart = () => {
    console.log('Test restart clicked');
    setStep(0);
    setMessage('Reiniciado!');
    setTimeout(() => setMessage(''), 2000);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-4">Test Restart Functionality</h1>
      
      <div className="mb-4">
        <p>Current Step: {step}</p>
        {message && <p className="text-green-400">{message}</p>}
      </div>

      <div className="space-x-4 mb-8">
        <button 
          onClick={nextStep}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Next Step
        </button>
        
        <button 
          onClick={handleRestart}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          🔄 Restart
        </button>
      </div>

      <div className="mt-8">
        <button 
          onClick={() => window.location.href = '/'}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          ← Back to main app
        </button>
      </div>
    </div>
  );
}
