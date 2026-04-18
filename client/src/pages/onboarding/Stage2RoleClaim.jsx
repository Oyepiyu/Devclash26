import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldCheck, FileText, AlertTriangle, Loader2, ChevronRight } from 'lucide-react';

const Stage2RoleClaim = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [proofText, setProofText] = useState('');

  const roles = [
    { 
      id: 'Founder', 
      label: 'Founder / Co-founder', 
      trust: 'Highest Trust Level',
      icon: <ShieldCheck size={28} />,
      question: 'Are you listed as a director in MCA records?'
    },
    { 
      id: 'Director', 
      label: 'Director / CEO / MD', 
      trust: 'High Trust Level',
      icon: <UserCheck size={28} />,
      question: 'Can you provide your appointment letter or board resolution?'
    },
    { 
      id: 'HR', 
      label: 'HR Manager / Recruiter', 
      trust: 'Medium Trust Level',
      icon: <FileText size={28} />,
      question: 'Can you provide an authorization letter from the company?'
    },
    { 
      id: 'AuthorizedRep', 
      label: 'Authorized Representative', 
      trust: 'Needs Extra Proof',
      icon: <FileText size={28} />,
      question: 'Upload a letter of authorization signed by the owner'
    },
    { 
      id: 'Employee', 
      label: 'Employee', 
      trust: 'Lowest Trust Level',
      icon: <AlertTriangle size={28} />,
      isBlocked: true,
      blockMessage: 'Only founders, directors, or authorized representatives can register a company. Please ask your company admin to register.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    const roleObj = roles.find(r => r.id === selectedRole);
    if (roleObj.isBlocked) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://happily-launder-spearman.ngrok-free.dev/api/organisation/stage2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          role: roleObj.label,
          proofText: proofText 
        })
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        // Stage 2 complete, move to Stage 3 or Dashboard
        navigate('/onboarding/stage3'); 
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const roleCardStyle = (roleId) => ({
    background: selectedRole === roleId ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${selectedRole === roleId ? 'var(--primary-accent)' : 'var(--border-color)'}`,
    borderRadius: '16px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
    position: 'relative',
    overflow: 'hidden'
  });

  return (
    <div className="glass-panel slide-up" style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Role Claim Verification</h2>
        <p style={{ color: 'var(--text-muted)' }}>Confirm your position within the organisation.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {roles.map((role) => (
          <div 
            key={role.id} 
            style={roleCardStyle(role.id)}
            onClick={() => setSelectedRole(role.id)}
            onMouseEnter={(e) => {
              if (selectedRole !== role.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== role.id) e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{
              color: role.id === 'Employee' ? 'var(--error)' : (selectedRole === role.id ? 'var(--primary-accent)' : 'var(--text-muted)')
            }}>
              {role.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.2rem' }}>{role.label}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{role.trust}</p>
            </div>
            {selectedRole === role.id && !role.isBlocked && <div style={{ color: 'var(--primary-accent)' }}><ChevronRight /></div>}
            
            {role.isBlocked && selectedRole === role.id && (
              <div className="fade-in" style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                textAlign: 'center',
                zIndex: 2
              }}>
                <div style={{ color: '#fca5a5', fontWeight: '500' }}>
                  <AlertTriangle style={{ margin: '0 auto 0.5rem' }} />
                  {role.blockMessage}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedRole && !roles.find(r => r.id === selectedRole).isBlocked && (
        <div className="fade-in" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--primary-accent)' }}>
            Verification Question
          </h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            {roles.find(r => r.id === selectedRole).question}
          </p>
          <textarea 
            style={{ 
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px',
              color: '#fff',
              width: '100%',
              height: '100px',
              resize: 'none',
              outline: 'none'
            }}
            placeholder="Please provide your answer or reference here..."
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
          ></textarea>

          {error && <div className="status-card error" style={{ marginTop: '1.5rem' }}>{error}</div>}

          <button 
            onClick={handleSubmit} 
            disabled={loading || !proofText} 
            style={{ width: '100%', marginTop: '2rem' }}
          >
            {loading ? <Loader2 className="spin" /> : 'Confirm Role & Proceed'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Stage2RoleClaim;
