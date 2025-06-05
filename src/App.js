import React, { useState, useEffect, useRef } from 'react';
import OutreachMessages from './components/OutreachMessages';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const LinkedInAnalyzer = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({ progress: 0, stage: '' });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [activeTab, setActiveTab] = useState('analyze');
  const [profileData, setProfileData] = useState(null);
  const [outreachMessages, setOutreachMessages] = useState([]);

  const analyzeProfile = async () => {
    if (!linkedinUrl) {
      setError('Please enter a LinkedIn URL');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisProgress({ progress: 0, stage: 'Starting analysis...' });

    try {
      const response = await fetch(`${BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisId(result.analysisId);
    } catch (err) {
      setError(err.message);
      setIsAnalyzing(false);
    }
  };

  const checkProgress = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/analyze/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check progress');
      }

      const result = await response.json();

      setAnalysisProgress({
        progress: result.progress || 0,
        stage: result.stage || ''
      });

      if (result.status === 'completed') {
        setProfileData(result.data.profile);
        setOutreachMessages(result.data.outreachMessages);
        setIsAnalyzing(false);
        setActiveTab('results');
      } else if (result.status === 'error') {
        setError(result.error);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('Progress check error:', err);
      setError('Failed to check analysis progress: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => {
      setCopied({ ...copied, [id]: false });
    }, 2000);
  };

  useEffect(() => {
    let interval;
    if (analysisId && isAnalyzing) {
      interval = setInterval(() => {
        checkProgress(analysisId);
      }, 2000);
    }
    return () => interval && clearInterval(interval);
  }, [analysisId, isAnalyzing]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab === 'outreach' && outreachMessages.length > 0 && (
          <OutreachMessages
            profileName={profileData?.name}
            outreachMessages={outreachMessages}
            copied={copied}
            handleCopy={handleCopy}
          />
        )}
      </div>
    </div>
  );
};

export default LinkedInAnalyzer;
