import { useState } from 'react';
import './App.css';

// --- SVG Icons as React Components for easy use ---
const StethoscopeIcon = () => (
  <svg fill="#007aff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a9 9 0 0 0-9 9c0 2.43 1 4.63 2.65 6.22L5 21.5a1 1 0 0 0 1 1.5 1 1 0 0 0 1-.5l.65-3.22A9 9 0 1 0 12 2zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/>
    <path d="M12 7a1 1 0 0 0-1 1v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2h-3V8a1 1 0 0 0-1-1z"/>
  </svg>
);

const ListIcon = () => (
  <svg fill="#007aff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2zm16 4H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2zm0 6H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2z"/>
  </svg>
);

const WarningIcon = () => (
  <svg fill="#f39c12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 4.97a.75.75 0 0 1 1.06 0l.97.97a.75.75 0 0 1 0 1.06l-.97.97a.75.75 0 0 1-1.06 0l-.97-.97a.75.75 0 0 1 0-1.06l.97-.97zM12 15.75a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75z"/>
  </svg>
);


// --- The Main App Component ---
function App() {
  const [result, setResult] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:5001/api/check-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Network error'); }
      setResult(data);
    } catch (error) {
      setResult({ error: `Error: ${error.message}. Please check the backend console.` });
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="skeleton-loader">
      <div className="skeleton-bar h-30 w-40"></div>
      <div className="skeleton-bar h-20 w-100"></div>
      <div className="skeleton-bar h-20 w-80"></div>
      <br />
      <div className="skeleton-bar h-30 w-40"></div>
      <div className="skeleton-bar h-20 w-100"></div>
      <div className="skeleton-bar h-20 w-80"></div>
    </div>
  );

  return (
    <div className="app-container">
      <header>
        <h1>Health Symptom Checker</h1>
        <p className="main-disclaimer">
          This AI-powered tool is for educational purposes only and is not a substitute for professional medical advice.
        </p>
      </header>
      
      <main>
        <form onSubmit={handleSubmit}>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms in detail... (e.g., 'I have a persistent dry cough, a headache, and feel very tired.')"
            rows="6"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !symptoms}>
            {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </form>
        
        {isLoading && <LoadingSkeleton />}

        {result && !isLoading && (
          <div className="result-container">
            {result.error ? (
              <p className="error-message">{result.error}</p>
            ) : (
              <>
                {result.disclaimer && (
                  <div className="result-card disclaimer-card">
                    <div className="card-header">
                      <WarningIcon />
                      <h2>Disclaimer</h2>
                    </div>
                    <p>{result.disclaimer}</p>
                  </div>
                )}
                
                {Array.isArray(result.conditions) && (
                  <div className="result-card">
                    <div className="card-header">
                      <StethoscopeIcon />
                      <h2>Probable Conditions</h2>
                    </div>
                    <ul className="conditions-list">
                      {result.conditions.map((condition, index) => (
                        <li key={index}>
                          <strong>{condition.name}:</strong> {condition.explanation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(result.nextSteps) && (
                   <div className="result-card">
                     <div className="card-header">
                       <ListIcon />
                       <h2>Recommended Next Steps</h2>
                     </div>
                     <ul className="steps-list">
                      {result.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;