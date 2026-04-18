import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CaptchaChallenge from '../components/CaptchaChallenge';

const AuthParams = ({ type, setUser }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Show CAPTCHA before allowing login
      setShowCaptcha(true);
    } else {
      // Signup goes directly
      performAuth();
    }
  };

  const performAuth = async () => {
    setLoading(true);
    const url = `http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate(data.user.isVerified ? '/dashboard' : '/verify');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    performAuth();
  };

  const handleCaptchaCancel = () => {
    setShowCaptcha(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }} className="fade-in">
      
      {/* CAPTCHA Overlay (Login only) */}
      {showCaptcha && (
        <CaptchaChallenge 
          onSuccess={handleCaptchaSuccess} 
          onCancel={handleCaptchaCancel} 
        />
      )}

      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        
        {error && <div className="status-card error">{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '1rem' }}>
          {!isLogin && (
            <div>
              <label className="label">Full Name</label>
              <input 
                type="text" 
                placeholder="Jane Doe" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              placeholder="jane@example.com" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Join TrustLink')}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? '/signup' : '/login'} style={{ color: 'var(--primary-accent)' }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthParams;
