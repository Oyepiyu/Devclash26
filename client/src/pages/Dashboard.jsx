import React from 'react';
import { ShieldCheck, Users, Briefcase } from 'lucide-react';

const Dashboard = ({ user }) => {
  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome to TrustLink, {user?.name}</h1>
        <p style={{ color: 'var(--text-muted)' }}>You have successfully verified your identity. Welcome to the trusted network.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--success)' }}>
            <ShieldCheck size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Trust Score</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{user?.trustScore || 40}</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Verified Human Identity</p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary-accent)' }}>
            <Users size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Network</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Trusted Connections</p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: '#a855f7' }}>
            <Briefcase size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Opportunities</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>Unlock</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Find trusted jobs</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
