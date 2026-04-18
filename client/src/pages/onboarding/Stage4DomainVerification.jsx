import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../../apiConfig';

const Stage4DomainVerification = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organisation/stage4/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setSuccessMsg('OTP has been sent to your organisation email. Since this is a demo, please check the server terminal console to find the code.');
      } else {
        setError(data.message || 'Error sending OTP');
      }
    } catch (err) {
      setError('Connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organisation/stage4/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        // Stage 4 complete, will redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard/organisation');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel slide-up" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Stage 4: Domain & Email</h2>
        <p style={{ color: 'var(--text-muted)' }}>Proving you belong to the organisation via official domain access.</p>
      </div>

      {user?.isVerified && step === 2 && !error && (
        <div className="fade-in" style={{ padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '2rem' }}>
          <CheckCircle2 size={48} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verification Complete!</h3>
          <p style={{ color: 'var(--text-muted)' }}>Your organisation is now approved. Redirecting to dashboard...</p>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="fade-in">
          <div style={{ marginBottom: '2rem' }}>
            <label className="label" style={{ textAlign: 'left' }}>Organisation Email ID</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{ 
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 12px 12px 45px',
                  color: '#fff',
                  width: '100%',
                  fontSize: '1rem'
                }}
              />
              <Mail size={20} style={{ position: 'absolute', left: '15px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'left' }}>
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
              We only send emails to domains matching your official website.
            </p>
          </div>

          {error && <div className="status-card error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <Loader2 className="spin" /> : <><Send size={18} /> Send OTP Verification</>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="fade-in">
          <div style={{ marginBottom: '2rem' }}>
            {successMsg && <div className="status-card success" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>{successMsg}</div>}
            
            <label className="label">Enter 6-Digit OTP</label>
            <input 
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              required
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--primary-accent)',
                borderRadius: '8px',
                padding: '15px',
                color: '#fff',
                width: '100%',
                fontSize: '1.5rem',
                letterSpacing: '5px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            />
          </div>

          {error && <div className="status-card error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <Loader2 className="spin" /> : 'Complete Final Step'}
          </button>

          <button 
            type="button" 
            onClick={() => setStep(1)} 
            style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', marginTop: '1rem', fontSize: '0.9rem' }}
          >
            Change Email Address
          </button>
        </form>
      )}

      <div style={{ marginTop: '3rem', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          This step uses our smart domain verification engine. Users with matching company email domains receive an immediate trust score boost.
        </p>
      </div>
    </div>
  );
};

export default Stage4DomainVerification;
