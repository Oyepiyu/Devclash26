import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { API_URL } from '../../apiConfig';

const Stage3DocumentUpload = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});

  const isRoleSpecial = ['HR', 'AuthorizedRep'].some(r => user.orgRole?.includes(r));
  
  const docOptions = [
    { id: 'GST', label: 'GST Certificate', icon: <FileText />, description: 'Most common in India. Primary proof of business.' },
    { id: 'COI', label: 'Certificate of Incorporation (COI)', icon: <Shield />, description: 'Strongest proof. Matches director names.', recommended: true },
    { id: 'MSME', label: 'MSME / Udyam Certificate', icon: <FileText />, description: 'For small businesses and startups.' },
    { id: 'PAN', label: 'Company PAN Card', icon: <FileText />, description: 'Supporting document.' },
  ];

  const roleDocs = [
    { id: 'Authorization Letter', label: 'Authorization Letter', icon: <FileText />, description: 'Required for HR and Representatives.' }
  ];

  const handleFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large (max 5MB)');
        return;
      }
      setFiles(prev => ({ ...prev, [docId]: file }));
      setPreviews(prev => ({ ...prev, [docId]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(files).length === 0) {
      setError('Please upload at least one primary document');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    Object.entries(files).forEach(([docId, file]) => {
      formData.append(docId, file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organisation/stage3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/onboarding/stage4');
      } else {
        setError(data.message || 'Error uploading documents');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = (docId) => ({
    background: files[docId] ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
    border: `2px dashed ${files[docId] ? 'var(--primary-accent)' : 'var(--border-color)'}`,
    borderRadius: '16px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative'
  });

  return (
    <div className="glass-panel slide-up" style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Stage 3: Document Upload</h2>
        <p style={{ color: 'var(--text-muted)' }}>Provide official documents to verify your organisation's identity.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--primary-accent)' }}>Primary Documents (Upload at least one)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {docOptions.map(doc => (
              <label key={doc.id} style={cardStyle(doc.id)} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-accent)'} onMouseLeave={e => !files[doc.id] && (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, doc.id)} />
                <div style={{ color: files[doc.id] ? 'var(--primary-accent)' : 'var(--text-muted)', marginBottom: '1rem' }}>
                  {files[doc.id] ? <CheckCircle size={32} /> : doc.icon}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{doc.label}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{doc.description}</p>
                {doc.recommended && !files[doc.id] && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-accent)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px', marginTop: '0.5rem' }}>Recommended</span>
                )}
                {files[doc.id] && <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem' }}>Selected: {files[doc.id].name.substring(0, 15)}...</span>}
              </label>
            ))}
          </div>
        </div>

        {isRoleSpecial && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--primary-accent)' }}>Role-Specific Proof</h3>
            <div style={{ maxWidth: '300px' }}>
              {roleDocs.map(doc => (
                <label key={doc.id} style={cardStyle(doc.id)}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, doc.id)} />
                  <div style={{ color: files[doc.id] ? 'var(--primary-accent)' : 'var(--text-muted)', marginBottom: '1rem' }}>
                    {files[doc.id] ? <CheckCircle size={32} /> : doc.icon}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{doc.label}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{doc.description}</p>
                  {files[doc.id] && <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem' }}>Selected: {files[doc.id].name.substring(0, 15)}...</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <div className="status-card error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <AlertCircle style={{ color: 'var(--primary-accent)' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>
            Our AI (Tesseract) will analyze your documents to verify company details and ownership. Clear images lead to faster approval.
          </p>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '1.25rem' }}>
          {loading ? (
            <><Loader2 className="spin" /> Verifying Documents & Calculating Score...</>
          ) : (
            'Upload & Proceed to Email Verification'
          )}
        </button>
      </form>
    </div>
  );
};

export default Stage3DocumentUpload;
