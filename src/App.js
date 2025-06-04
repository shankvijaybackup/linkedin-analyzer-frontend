import React, { useState, useEffect, useRef } from 'react';
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Icons (using simple SVG since we can't import lucide-react)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="21 21l-4.35-4.35"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12h4m4 0h4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

const LinkedInAnalyzer = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({ progress: 0, stage: '' });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [activeTab, setActiveTab] = useState('analyze');
  
  // Analysis results
  const [profileData, setProfileData] = useState(null);
  const [strategicSummary, setStrategicSummary] = useState('');
  const [outreachMessages, setOutreachMessages] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Knowledge Base state
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

  // Load knowledge items and stats when knowledge tab is active
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

  // File upload handling
  const handleFileUpload = async (uploadFiles, category = 'general') => {
    const formData = new FormData();
    
    Array.from(uploadFiles).forEach(file => {
      formData.append('documents', file);
    });
    
    formData.append('category', category);

    setUploading(true);
    setUploadSuccess(false);

    try {
      const response = await fetch(`${BASE_URL}/api/knowledge/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        setUploadSuccess(true);
        await fetchKnowledgeItems();
        await fetchStats();
        setFiles([]);
        
        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handling
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Delete knowledge item
  const handleDeleteKnowledge = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/knowledge/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchKnowledgeItems();
          await fetchStats();
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // Filter knowledge items
  const filteredItems = knowledgeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.metadata?.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Poll for analysis progress
  useEffect(() => {
    let interval;
    if (analysisId && isAnalyzing) {
      interval = setInterval(() => {
        checkProgress(analysisId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisId, isAnalyzing]);

  // API calls
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
    setCopied({...copied, [id]: true});
    setTimeout(() => {
      setCopied({...copied, [id]: false});
    }, 2000);
  };

  // Add CSS animation for spinner
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
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: '#4f46e5', 
              padding: '0.75rem', 
              borderRadius: '0.75rem',
              color: 'white'
            }}>
              <SearchIcon />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                LinkedIn Intent Analyzer
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                Enterprise-grade prospect intelligence & outreach automation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          backgroundColor: '#f3f4f6',
          padding: '0.25rem',
          borderRadius: '0.5rem',
          width: 'fit-content'
        }}>
          {[
            { id: 'analyze', label: 'Analysis', icon: SearchIcon },
            { id: 'results', label: 'Results', icon: UserIcon },
            { id: 'outreach', label: 'Outreach', icon: MailIcon },
            { id: 'knowledge', label: 'Knowledge Base', icon: BookIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#4f46e5' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analysis Tab */}
        {activeTab === 'analyze' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Input Section */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
                Profile Analysis
              </h2>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={analyzeProfile}
                  disabled={!linkedinUrl || isAnalyzing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: (!linkedinUrl || isAnalyzing) ? '#9ca3af' : '#4f46e5',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: (!linkedinUrl || isAnalyzing) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                >
                  {isAnalyzing ? <LoaderIcon /> : <SearchIcon />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>

              {/* Sample URLs */}
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <span>Try these examples: </span>
                {[
                  'https://www.linkedin.com/in/joseph-rabbia/',
                  'https://www.linkedin.com/in/ayushasingh/'
                ].map(url => (
                  <button
                    key={url}
                    onClick={() => setLinkedinUrl(url)}
                    style={{
                      color: '#4f46e5',
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      margin: '0 0.5rem'
                    }}
                  >
                    {url.split('/in/')[1]?.replace('/', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                color: '#7f1d1d'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Progress Display */}
            {isAnalyzing && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <LoaderIcon />
                  <h3 style={{ fontWeight: '600', margin: 0 }}>Processing Analysis</h3>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {analysisProgress.progress}% complete
                  </span>
                </div>
                
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '9999px', 
                  height: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div 
                    style={{ 
                      backgroundColor: '#4f46e5', 
                      height: '100%', 
                      borderRadius: '9999px', 
                      transition: 'width 0.5s ease',
                      width: `${analysisProgress.progress}%`
                    }}
                  />
                </div>
                
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  {analysisProgress.stage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && profileData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Profile Overview */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <UserIcon />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Profile Overview</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>
                    {profileData.name}
                  </h3>
                  <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>{profileData.title}</p>
                  <p style={{ color: '#6b7280', margin: 0 }}>{profileData.company}</p>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>{profileData.location}</p>
                </div>
                
                {metrics && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                        {metrics.decisionAuthority}%
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Decision Authority</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        {metrics.buyingIntent}%
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Buying Intent</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Summary */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Strategic Summary</h2>
                <button
                  onClick={() => handleCopy(strategicSummary, 'summary')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: copied.summary ? '#10b981' : '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {copied.summary ? <CheckIcon /> : <CopyIcon />}
                  {copied.summary ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                whiteSpace: 'pre-line',
                lineHeight: '1.6',
                fontSize: '0.875rem'
              }}>
                {strategicSummary}
              </div>
            </div>

            {/* Company Information */}
            {companyData && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <BuildingIcon />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Company Intelligence</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(250px, 1fr))', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                      {companyData.name}
                    </h3>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                      {companyData.industry}
                    </p>
                    {companyData.company_size && (
                      <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                        {companyData.company_size.toLocaleString()} employees
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outreach Tab */}
        {activeTab === 'outreach' && outreachMessages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <MailIcon />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Personalized Outreach Messages</h2>
              </div>
              
              <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
                AI-generated messages tailored for {profileData?.name} based on their profile and role.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outreachMessages.map((message, index) => (
                  <div 
                    key={index}
                    style={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '0.5rem', 
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: '#111827' }}>
                          From: {message.sender}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                          {message.focus}
                        </p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
                          Subject: {message.subject}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(message.message, `message-${index}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: copied[`message-${index}`] ? '#10b981' : '#4f46e5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {copied[`message-${index}`] ? <CheckIcon /> : <CopyIcon />}
                        {copied[`message-${index}`] ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '1rem', 
                      borderRadius: '0.375rem',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6',
                      fontSize: '0.875rem'
                    }}>
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Knowledge Base Header */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <BookIcon />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Knowledge Base Manager</h2>
              </div>
              
              <p style={{ color: '#6b7280', margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
                Upload documents to improve AI personalization and outreach quality. Supported formats: PDF, DOCX, DOC, TXT, MD, JSON
              </p>

              {/* Success Message */}
              {uploadSuccess && (
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: '0.5rem', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  color: '#15803d'
                }}>
                  <CheckIcon />
                  <span>Documents uploaded successfully! Knowledge base updated.</span>
                </div>
              )}

              {/* Stats */}
              {stats.totalDocuments !== undefined && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                      {stats.totalDocuments}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Documents</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {Object.keys(stats.categories || {}).length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Categories</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {Math.round((stats.totalSize || 0) / 1024 / 1024 * 100) / 100}MB
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Size</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                      {stats.recentUploads || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Recent Uploads</div>
                  </div>
                </div>
              )}
            </div>

            {/* Knowledge Tab Navigation */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem',
              borderRadius: '0.5rem',
              width: 'fit-content'
            }}>
              {[
                { id: 'upload', label: 'Upload Documents', icon: UploadIcon },
                { id: 'browse', label: 'Browse Knowledge', icon: SearchIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setKnowledgeTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: knowledgeTab === tab.id ? 'white' : 'transparent',
                    color: knowledgeTab === tab.id ? '#4f46e5' : '#6b7280',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: knowledgeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Upload Tab */}
            {knowledgeTab === 'upload' && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Category Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Document Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {categories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragActive ? '#4f46e5' : '#d1d5db'}`,
                    borderRadius: '0.5rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: dragActive ? '#f8fafc' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                    Drop files here or click to browse
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                    Supports PDF, DOCX, DOC, TXT, MD, JSON files up to 50MB each
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt,.md,.json"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Selected Files ({files.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {files.map((file, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileIcon />
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{file.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {Math.round(file.size / 1024)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleFileUpload(files, selectedCategory)}
                      disabled={uploading}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: uploading ? '#9ca3af' : '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Browse Tab */}
            {knowledgeTab === 'browse' && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Search and Filter */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search knowledge base..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div style={{ minWidth: '200px' }}>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Knowledge Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <div 
                        key={item.id || index}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <FileIcon />
                              <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                {item.filename}
                              </h3>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                {categories.find(cat => cat.id === item.metadata?.category)?.label || 'General'}
                              </span>
                            </div>
                            
                            <p style={{ 
                              color: '#6b7280', 
                              margin: '0 0 0.5rem 0', 
                              fontSize: '0.875rem',
                              lineHeight: '1.4'
                            }}>
                              {item.content?.substring(0, 200)}...
                            </p>
                            
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                              <span>Uploaded: {new Date(item.metadata?.uploadDate).toLocaleDateString()}</span>
                              <span>Size: {Math.round((item.metadata?.fileSize || 0) / 1024)} KB</span>
                              <span>Type: {item.metadata?.fileType}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteKnowledge(item.id)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              marginLeft: '1rem'
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem',
                      color: '#6b7280'
                    }}>
                      <BookIcon />
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '1rem 0 0.5rem 0' }}>
                        No Knowledge Items Found
                      </h3>
                      <p style={{ margin: 0 }}>
                        {searchQuery || selectedCategory !== 'all' 
                          ? 'Try adjusting your search or filter criteria.' 
                          : 'Upload some documents to get started with your knowledge base.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results State */}
        {(activeTab === 'results' || activeTab === 'outreach') && !profileData && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <SearchIcon />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '1rem 0 0.5rem 0', color: '#111827' }}>
              No Analysis Results
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
              Run an analysis first to see detailed results and outreach messages.
            </p>
            <button
              onClick={() => setActiveTab('analyze')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Start Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInAnalyzer;