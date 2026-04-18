import React, { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { API_URL } from '../apiConfig';

const ReportOrgButton = ({ orgId }) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    'This company does not exist',
    'Person is not who they claim to be',
    'Fake or forged documents suspected',
    'Impersonating a real company',
    'Spam or misleading content',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/report/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orgId, reason, details })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setReason('');
          setDetails('');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <button 
        onClick={() => setShowModal(true)}
        style={{ 
          color: 'var(--text-muted)', 
          background: 'transparent', 
          border: 'none', 
          fontSize: '0.8rem', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          margin: '0 auto'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--error)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
      >
        <Flag size={14} /> Report this organisation
      </button>

      {submitted && !showModal && (
        <p style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: '8px' }}>
          ✅ Report submitted. Our team will review within 24 hours.
        </p>
      )}

      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.85)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem', textAlign: 'left', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Report Organisation</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                {reasons.map((r, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="radio" 
                      name="reason" 
                      value={r} 
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ accentColor: 'var(--primary-accent)' }}
                    />
                    {r}
                  </label>
                ))}
              </div>

              <textarea 
                placeholder="Any additional details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  color: '#fff', 
                  width: '100%', 
                  height: '80px', 
                  resize: 'none',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}
              />

              {error && <div className="status-card error" style={{ marginBottom: '1rem' }}>{error}</div>}
              {submitted && <div className="status-card success" style={{ marginBottom: '1rem' }}>Report sent! Closing...</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  disabled={loading || submitted}
                  style={{ flex: 2 }}
                >
                  {loading ? <Loader2 className="spin" /> : 'Submit Report'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportOrgButton;
