import React from 'react';
import { LogOut } from 'lucide-react';

function ProfessionalDashboard({ user, setUser }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="glass-panel slide-up" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
        color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem'
      }}>
        {user?.name?.charAt(0).toUpperCase() || 'P'}
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Professional Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Welcome {user?.name}! Here you can network, find jobs, and explore opportunities.
      </p>
      <button onClick={handleLogout} style={{ margin: '0 auto', background: 'var(--error)' }}>
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}

export default ProfessionalDashboard;
