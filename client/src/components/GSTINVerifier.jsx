import React, { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { API_URL } from '../apiConfig';

const GSTINVerifier = ({ companyName, onVerified }) => {
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { valid: bool, apiCompanyName: string, reason: string, fallback: bool }

  const handleVerify = async () => {
    if (gstin.length !== 15) {
      setResult({ valid: false, reason: 'GSTIN must be exactly 15 characters' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organisation/verify-gstin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gstin, companyName })
      });

      const data = await response.json();
      setResult(data);

      if (data.valid || data.fallback) {
        onVerified(true);
      }
    } catch (error) {
      console.error('GSTIN verification failed:', error);
      setResult({ 
        valid: false, 
        reason: 'Verification service unavailable. Document will be reviewed manually.', 
        fallback: true 
      });
      onVerified(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    color: '#fff',
    flex: 1,
    outline: 'none',
    fontSize: '0.9rem'
  };

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>GSTIN Number</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={gstin} 
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          placeholder="Enter 15-character GSTIN"
          maxLength={15}
          style={inputStyle}
        />
        <button 
          onClick={handleVerify} 
          disabled={loading || !gstin}
          style={{ width: 'auto', padding: '0 20px', whiteSpace: 'nowrap' }}
        >
          {loading ? <Loader2 className="spin" size={18} /> : 'Verify GSTIN'}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <Loader2 className="spin" size={16} /> Verifying with government records...
        </div>
      )}

      {result && !loading && (
        <div style={{ marginTop: '12px' }}>
          {result.valid && (
            <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} /> ✅ GSTIN Verified — {result.apiCompanyName}
            </div>
          )}
          
          {!result.valid && !result.fallback && (
            <div style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <XCircle size={16} /> {result.reason}
            </div>
          )}

          {result.fallback && (
            <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '5px' }}>
              <AlertTriangle size={16} /> ⚠️ Live verification unavailable. Document will be reviewed manually.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GSTINVerifier;
