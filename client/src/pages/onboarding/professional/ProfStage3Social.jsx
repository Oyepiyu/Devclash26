import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Plus, Trash2, ArrowRight, ArrowLeft, FileText, Upload } from 'lucide-react';
import { API_URL } from '../../../apiConfig';

const ProfStage3Social = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [socialLinks, setSocialLinks] = useState(user?.profProfile?.socialLinks || {
    linkedin: '',
    github: '',
    portfolio: '',
    others: []
  });

  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState(user?.profProfile?.resumeUrl ? 'Current Resume Uploaded' : 'No file chosen');

  const handleLinkChange = (field, value) => {
    setSocialLinks(prev => ({ ...prev, [field]: value }));
  };

  const handleOtherLinkChange = (index, field, value) => {
    const newOthers = [...socialLinks.others];
    newOthers[index][field] = value;
    setSocialLinks(prev => ({ ...prev, others: newOthers }));
  };

  const addOtherLink = () => {
    setSocialLinks(prev => ({ 
      ...prev, 
      others: [...prev.others, { label: '', url: '' }] 
    }));
  };

  const removeOtherLink = (index) => {
    setSocialLinks(prev => ({ 
      ...prev, 
      others: prev.others.filter((_, i) => i !== index) 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Max 10MB.');
        return;
      }
      setResume(file);
      setResumeName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('socialLinks', JSON.stringify(socialLinks));
    if (resume) {
      formData.append('resume', resume);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/professional/stage3`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        // Onboarding complete, App.jsx routing should now take them to dashboard
        navigate('/dashboard/professional');
      } else {
        setError(data.message || 'Failed to finalise profile');
      }
    } catch (err) {
      setError('Connection error during upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel slide-up" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary-accent)' }}>
          <Share2 size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Links & Social Presence</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connect your professional footprints across the web.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>LinkedIn Profile URL</label>
            <input 
              type="url" 
              placeholder="https://linkedin.com/in/username" 
              value={socialLinks.linkedin}
              onChange={(e) => handleLinkChange('linkedin', e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>GitHub URL</label>
            <input 
              type="url" 
              placeholder="https://github.com/username" 
              value={socialLinks.github}
              onChange={(e) => handleLinkChange('github', e.target.value)}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Portfolio Website</label>
            <input 
              type="url" 
              placeholder="https://yourportfolio.com" 
              value={socialLinks.portfolio}
              onChange={(e) => handleLinkChange('portfolio', e.target.value)}
            />
          </div>
        </div>

        {/* Other Links Area */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Additional Links</label>
            <button type="button" onClick={addOtherLink} style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={14} /> Add Link
            </button>
          </div>
          {socialLinks.others.map((link, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Label (e.g. Medium, Dribbble)" 
                value={link.label} 
                onChange={(e) => handleOtherLinkChange(i, 'label', e.target.value)}
                style={{ flex: 1 }}
              />
              <input 
                type="url" 
                placeholder="URL" 
                value={link.url} 
                onChange={(e) => handleOtherLinkChange(i, 'url', e.target.value)}
                style={{ flex: 2 }}
              />
              <Trash2 size={18} style={{ color: '#f87171', cursor: 'pointer' }} onClick={() => removeOtherLink(i)} />
            </div>
          ))}
        </div>

        {/* Resume Upload Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', fontSize: '0.95rem' }}>Resume Upload (PDF Recommended)</label>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.01)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => document.getElementById('resume-upload').click()}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <input 
              id="resume-upload"
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ color: 'var(--primary-accent)', marginBottom: '1rem' }}>
              <Upload size={32} style={{ margin: '0 auto' }} />
            </div>
            <p style={{ fontWeight: '500', marginBottom: '4px' }}>{resumeName}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to upload or drag and drop. Max 10MB.</p>
          </div>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button type="button" onClick={() => navigate('/professional-onboarding/stage2')} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <button type="submit" disabled={loading} style={{ 
            padding: '0.75rem 3rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'var(--primary-accent)',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}>
            {loading ? 'Finalising...' : 'Finish Onboarding'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfStage3Social;
