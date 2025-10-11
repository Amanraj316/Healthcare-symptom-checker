import { useState } from 'react';
import './App.css';

function App() {
  // The result state will now hold an object, not a string
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

      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
      
      // The entire JSON object is now in the state
      setResult(data);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      // Displaying the error in a more structured way
      setResult({ error: `Error: ${error.message}. Please check the backend console and make sure it is running.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Healthcare Symptom Checker 🩺</h1>
      {/* The main disclaimer from the assignment is always visible */}
      <p className="main-disclaimer">
        This tool is for educational purposes only and is not a substitute for professional medical advice.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter your symptoms here... (e.g., 'I have a sore throat, a mild fever, and a headache.')"
          rows="6"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !symptoms}>
          {isLoading ? 'Analyzing...' : 'Check Symptoms'}
        </button>
      </form>
      
      {result && (
        <div className="result-container">
          {/* Check if there was an error */}
          {result.error ? (
            <p className="error-message">{result.error}</p>
          ) : (
            <>
              {/* Display the AI's disclaimer */}
              <p className="disclaimer">{result.disclaimer}</p>

              {/* Display the conditions */}
              <h2>Probable Conditions</h2>
              <ul className="conditions-list">
                {result.conditions.map((condition, index) => (
                  <li key={index}>
                    <strong>{condition.name}:</strong> {condition.explanation}
                  </li>
                ))}
              </ul>

              {/* Display the next steps */}
              <h2>Recommended Next Steps</h2>
              <ul className="steps-list">
                {result.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;