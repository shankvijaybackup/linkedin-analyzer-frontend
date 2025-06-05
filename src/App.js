import React, { useState, useEffect, useRef } from 'react';
import OutreachMessages from './components/OutreachMessages';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// All your SVG icons remain unchanged...

const LinkedInAnalyzer = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({ progress: 0, stage: '' });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [activeTab, setActiveTab] = useState('analyze');
  const [profileData, setProfileData] = useState(null);
  const [strategicSummary, setStrategicSummary] = useState('');
  const [outreachMessages, setOutreachMessages] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [knowledgeTab, setKnowledgeTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'outreach_templates', label: 'Outreach Templates' },
    { id: 'product_information', label: 'Product Information' },
    { id: 'industry_insights', label: 'Industry Insights' },
    { id: 'competitor_analysis', label: 'Competitor Analysis' },
    { id: 'case_studies', label: 'Case Studies' },
    { id: 'sales_playbooks', label: 'Sales Playbooks' },
    { id: 'technical_documentation', label: 'Technical Docs' },
    { id: 'general', label: 'General' }
  ];

  useEffect(() => {
    if (activeTab === 'knowledge') {
      fetchKnowledgeItems();
      fetchStats();
    }
  }, [activeTab]);

  const fetchKnowledgeItems = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/knowledge`);
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/knowledge/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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
        setStrategicSummary(result.data.strategicSummary);
        setOutreachMessages(result.data.outreachMessages);
        setCompanyData(result.data.company);
        setMetrics(result.data.metrics);
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
      {/* Header remains unchanged */}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Tab Navigation remains unchanged */}

        {/* Analysis Tab remains unchanged */}

        {/* Results Tab remains unchanged */}

        {/* Outreach Tab - Refactored to use OutreachMessages.js */}
        {activeTab === 'outreach' && outreachMessages.length > 0 && (
          <OutreachMessages
            profileName={profileData?.name}
            outreachMessages={outreachMessages}
            copied={copied}
            handleCopy={handleCopy}
          />
        )}

        {/* Knowledge Base Tab remains unchanged */}

        {/* No Results State remains unchanged */}
      </div>
    </div>
  );
};

export default LinkedInAnalyzer;
