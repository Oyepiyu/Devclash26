import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { API_URL } from '../apiConfig';

function Welcome({ user, setUser }) {
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handleSelectIntent = async (intentSelected) => {
    setLoading(intentSelected);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/intent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ intent: intentSelected })
      });
      
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate(`/dashboard/${intentSelected}`);
      } else {
        console.error('Failed to set intent:', data.message);
      }
    } catch (error) {
      console.error('Server error setting intent:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass-panel slide-up" style={{ 
      maxWidth: '800px', 
      margin: '4rem auto', 
      textAlign: 'center',
      padding: '3rem 2rem'
    }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome precisely to your space!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          You've successfully completed the security verification. Now, let's tailor the experience to your needs. What brings you here today?
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {/* Professional Card */}
        <div 
          onClick={() => !loading && handleSelectIntent('professional')}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${loading === 'professional' ? 'var(--primary-accent)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            color: '#60a5fa'
          }}>
            <Briefcase size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>Professional</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            "I want to network, find jobs, and explore opportunities"
          </p>
          
          <button style={{
            width: '100%',
            padding: '1rem',
            background: loading === 'professional' ? 'var(--primary-accent)' : 'transparent',
            border: `1px solid ${loading === 'professional' ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            marginTop: 'auto'
          }}>
            {loading === 'professional' ? (
              <><Loader2 size={18} className="spin" /> Updating space...</>
            ) : (
              <>Select This <ChevronRight size={18} /></>
            )}
          </button>
        </div>

        {/* Organisation Card */}
        <div 
          onClick={() => !loading && handleSelectIntent('organisation')}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${loading === 'organisation' ? '#10b981' : 'var(--border-color)'}`,
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            color: '#34d399'
          }}>
            <Building2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>Organisation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            "I want to hire, host events, or collaborate as a company"
          </p>
          
          <button style={{
            width: '100%',
            padding: '1rem',
            background: loading === 'organisation' ? '#10b981' : 'transparent',
            border: `1px solid ${loading === 'organisation' ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            marginTop: 'auto'
          }}>
            {loading === 'organisation' ? (
              <><Loader2 size={18} className="spin" /> Updating space...</>
            ) : (
              <>Select This <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Welcome;
