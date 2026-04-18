import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <ShieldCheck size={32} color="var(--primary-accent)" />
        TrustLink
      </Link>
      
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user.isVerified && (
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={16} /> Verified
              </span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>{user.name}</span>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '10px 16px', fontWeight: '500' }}>Login</Link>
            <Link to="/signup" style={{ background: 'var(--primary-accent)', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '500' }}>Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
