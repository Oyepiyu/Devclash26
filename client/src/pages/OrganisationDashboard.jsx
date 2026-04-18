import React, { useState, useEffect } from 'react';
import { LogOut, ShieldCheck, ShieldAlert, Award, TrendingUp, Mail, CheckCircle2, Clock } from 'lucide-react';

function OrganisationDashboard({ user, setUser }) {
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://happily-launder-spearman.ngrok-free.dev/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          // We fetch 'me' to get updated user state which includes org details in real-time
          // In a real app we'd have a specific /api/organisation/my-org endpoint
          setOrgData(data.user);
        }
      } catch (err) {
        console.error('Error fetching org data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isFullyVerified = user?.trustScore >= 80;
  const isVerified = user?.trustScore > 30 && user?.trustScore < 80;
  const isPending = user?.trustScore <= 30;

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Verification Banners */}
      {isPending && (
        <div style={{ 
          background: 'rgba(234, 179, 8, 0.1)', 
          border: '1px solid rgba(234, 179, 8, 0.2)', 
          borderRadius: '12px', 
          padding: '1.25rem', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#facc15'
        }}>
          <Clock size={24} />
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: 'bold', margin: 0 }}>⏳ Your organisation is under review</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
              Submitted documents are being verified by our AI agents. Expected: within 24 hours.
            </p>
          </div>
          <button style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', fontSize: '0.8rem' }}>
            View Status
          </button>
        </div>
      )}

      {(isVerified || isFullyVerified) && (
        <div style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid rgba(34, 197, 94, 0.2)', 
          borderRadius: '12px', 
          padding: '1.25rem', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#4ade80'
        }}>
          <CheckCircle2 size={24} />
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: 'bold', margin: 0 }}>✅ Organisation is {isFullyVerified ? 'Fully Verified' : 'Verified'}</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
              Trust Score: {user?.trustScore}/100 | Domain: Verified
            </p>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(34, 197, 94, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {isFullyVerified ? 'PREMIUM BADGE' : 'VERIFIED'}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Profile Info Sidebar */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem',
            boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'O'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{user?.organisationName || 'My Organisation'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>{user?.email}</p>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trust Score</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-accent)' }}>{user?.trustScore || 0}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${user?.trustScore || 0}%`, background: 'var(--primary-accent)', transition: 'width 1s ease' }}></div>
            </div>
          </div>

          <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Main Feed Placeholder */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Dashboard Overview</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><Award size={20} /></div>
               <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><TrendingUp size={20} /></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Active Postings', value: '0', icon: <Mail /> },
              { label: 'Pending Candidates', value: '0', icon: <ShieldCheck /> },
              { label: 'Events Hosted', value: '0', icon: <TrendingUp /> },
              { label: 'Collaborations', value: '0', icon: <ShieldAlert /> },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '2rem', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed var(--primary-accent)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>You can set up your public profile meanwhile.</p>
            <button style={{ marginTop: '1rem', background: 'var(--primary-accent)', margin: '1rem auto' }}>
              Complete Public Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganisationDashboard;
