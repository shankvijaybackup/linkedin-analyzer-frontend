import React, { useState, useEffect } from 'react';
import './App.css';

// Get API URL from environment variable or default to relative path
const API_URL = process.env.REACT_APP_API_URL || '';

interface AnalysisResult {
  status: string;
  progress: number;
  stage: string;
  data?: {
    profile: any;
    company: any;
    strategicSummary: string;
    outreachMessages: any[];
    metrics: any;
  };
  error?: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [analysisId, setAnalysisId] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  // Poll for analysis progress
  useEffect(() => {
    if (!analysisId || !isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/analyze/${analysisId}`);
        if (!res.ok) {
          throw new Error('Failed to check analysis progress');
        }
        
        const data: AnalysisResult = await res.json();
        
        setProgress(data.progress || 0);
        setStage(data.stage || '');
        setStatus(data.status);

        if (data.status === 'completed') {
          setResult(data);
          setIsPolling(false);
          setStatus('completed');
        } else if (data.status === 'error') {
          setError(data.error || 'Analysis failed');
          setIsPolling(false);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err.message);
        setIsPolling(false);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [analysisId, isPolling]);

  const handleSubmit = async () => {
    if (!url) {
      setError('Please enter a LinkedIn URL');
      return;
    }

    // Reset state
    setError('');
    setResult(null);
    setProgress(0);
    setStage('Starting analysis...');

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setAnalysisId(data.analysisId);
        setStatus('started');
        setIsPolling(true);
      } else {
        throw new Error(data.error || 'Failed to start analysis');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ color: '#4f46e5', marginBottom: '10px' }}>LinkedIn Intent Analyzer</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          Analyze LinkedIn profiles for sales intelligence
        </p>

        <div style={{ marginBottom: '20px', width: '100%', maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="https://linkedin.com/in/username"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              marginBottom: '10px'
            }}
          />
          <button 
            onClick={handleSubmit}
            disabled={!url || isPolling}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: (!url || isPolling) ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (!url || isPolling) ? 'not-allowed' : 'pointer'
            }}
          >
            {isPolling ? 'Analyzing...' : 'Analyze Profile'}
          </button>
        </div>

        {/* Sample URLs */}
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
          <span>Try these examples: </span>
          <button
            onClick={() => setUrl('https://www.linkedin.com/in/joseph-rabbia/')}
            style={{
              color: '#4f46e5',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            joseph-rabbia
          </button>
          <button
            onClick={() => setUrl('https://www.linkedin.com/in/ayushasingh/')}
            style={{
              color: '#4f46e5',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            ayushasingh
          </button>
        </div>

        {/* Progress Bar */}
        {isPolling && (
          <div style={{ width: '100%', maxWidth: '500px', marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>{stage}</span>
              <span>{progress}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#4f46e5',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}

        {/* Status */}
        {status && !isPolling && (
          <p style={{ color: status === 'completed' ? '#10b981' : '#6b7280' }}>
            Status: {status}
          </p>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '6px', 
            padding: '12px',
            color: '#7f1d1d',
            maxWidth: '500px',
            width: '100%'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && result.data && (
          <div style={{ 
            width: '100%', 
            maxWidth: '800px', 
            marginTop: '30px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#111827', marginBottom: '20px' }}>Analysis Results</h2>
            
            {/* Profile Summary */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <h3 style={{ color: '#4f46e5', marginBottom: '10px' }}>Profile</h3>
              <p><strong>Name:</strong> {result.data.profile.name}</p>
              <p><strong>Title:</strong> {result.data.profile.title}</p>
              <p><strong>Company:</strong> {result.data.profile.company}</p>
              <p><strong>Location:</strong> {result.data.profile.location}</p>
            </div>

            {/* Metrics */}
            {result.data.metrics && (
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <h3 style={{ color: '#4f46e5', marginBottom: '10px' }}>Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <p><strong>Decision Authority:</strong> {result.data.metrics.decisionAuthority}%</p>
                  <p><strong>Buying Intent:</strong> {result.data.metrics.buyingIntent}%</p>
                  <p><strong>Budget Influence:</strong> {result.data.metrics.budgetInfluence}%</p>
                  <p><strong>Overall Score:</strong> {result.data.metrics.overallScore}%</p>
                </div>
              </div>
            )}

            {/* Raw Data (Collapsible) */}
            <details style={{ marginTop: '20px' }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: '#4f46e5',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                View Raw Data
              </summary>
              <pre style={{ 
                textAlign: 'left', 
                backgroundColor: '#f3f4f6',
                padding: '15px',
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '50px', fontSize: '12px', color: '#9ca3af' }}>
          <p>Built with React & Node.js | Deployed on Vercel & Render</p>
        </div>
      </header>
    </div>
  );
}

export default App;