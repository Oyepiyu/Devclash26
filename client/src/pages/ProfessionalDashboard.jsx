import React, { useState, useEffect } from 'react';
import { LogOut, User, Mail, ShieldCheck, Briefcase, Users, Calendar, Lightbulb, TrendingUp, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../apiConfig';

function ProfessionalDashboard({ user, setUser }) {
  const [flaggedOrgs, setFlaggedOrgs] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const isAdmin = user?.email?.toLowerCase().trim() === 'priyanshu.s.rathi@gmail.com';

  useEffect(() => {
    const fetchFlagged = async () => {
      if (!isAdmin) return;
      setAdminLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/organisation/flagged`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setFlaggedOrgs(data.organisations);
        }
      } catch (err) {
        console.error('Failed to fetch flagged orgs:', err);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchFlagged();
  }, [isAdmin]);

  const handleAdminAction = async (orgId, action) => {
    let reason = '';
    if (action === 'REJECT') {
      reason = prompt('Reason for rejection:');
      if (!reason) return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organisation/admin-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orgId, action, reason })
      });

      if (response.ok) {
        setFlaggedOrgs(prev => prev.filter(org => org._id !== orgId));
        alert(`Organisation ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully.`);
      }
    } catch (err) {
      alert('Action failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Sidebar: Profile Info */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem',
            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.email}</p>
          
          {user?.fullName && (
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
              <User size={14} style={{ display: 'inline', marginRight: '5px' }} /> {user.fullName}
            </p>
          )}

          {user?.isVerified && (
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', 
              background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', 
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
              marginBottom: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <ShieldCheck size={14} /> Verified Human
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Trust Score</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-accent)' }}>{user?.trustScore || 0}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${user?.trustScore || 0}%`, 
                background: 'var(--primary-accent)', 
                transition: 'width 1s ease' 
              }}></div>
            </div>
          </div>

          <button onClick={handleLogout} style={{ 
            width: '100%', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#f87171', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginTop: '2rem'
          }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Right Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* ADMIN PORTAL: Security Review Oversight (Moved to Top) */}
          {isAdmin && (
            <div className="glass-panel slide-up" style={{ padding: '2rem', border: '1px solid var(--primary-accent)', background: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <ShieldAlert className="text-primary-accent" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Security Review Oversight (Admin)</h2>
              </div>

              {adminLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading flagged records...</div>
              ) : flaggedOrgs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No organisations currently requiring manual review.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {flaggedOrgs.map(org => (
                    <div key={org._id} style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{org.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Owner: {org.ownerId?.name} ({org.ownerId?.email})
                        </p>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-accent)' }}>
                            Score: {org.trustScore}%
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                            {org.verificationStatus}
                          </span>
                          {org.documents?.some(d => d.fileUrl?.match(/\.(png|jpg|jpeg)$/i)) && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24' }}>
                               Image Risk ⚠️
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleAdminAction(org._id, 'APPROVE')}
                          style={{ padding: '8px', background: 'rgba(34, 197, 94, 1)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }} 
                          title="Approve"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleAdminAction(org._id, 'REJECT')}
                          style={{ padding: '8px', background: 'rgba(239, 68, 68, 1)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }} 
                          title="Reject"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'left' }}>Professional Dashboard</h2>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Connections', value: '0', icon: <Users size={20} /> },
                { label: 'Applications Sent', value: '0', icon: <Mail size={20} /> },
                { label: 'Events Attended', value: '0', icon: <Calendar size={20} /> },
                { label: 'Opportunities Found', value: '0', icon: <TrendingUp size={20} /> },
              ].map((stat, i) => (
                <div key={i} style={{ 
                  padding: '1.5rem', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border-color)',
                  textAlign: 'left'
                }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'left' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  onClick={() => alert('Job discovery coming soon!')}
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Briefcase size={18} /> 🔍 Find Jobs
                </button>
                <button 
                  onClick={() => alert('Networking feed coming soon!')}
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Users size={18} /> 🤝 Network
                </button>
                <button 
                  onClick={() => alert('Event discovery coming soon!')}
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Calendar size={18} /> 📅 Browse Events
                </button>
                <button 
                  onClick={() => alert('Opportunity marketplace coming soon!')}
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Lightbulb size={18} /> 💡 Find Opportunities
                </button>
              </div>
            </div>

            {/* Placeholder CTA */}
            <div style={{ 
              marginTop: '1rem', 
              padding: '2.5rem 2rem', 
              borderRadius: '16px', 
              background: 'rgba(59, 130, 246, 0.05)', 
              border: '1px dashed var(--primary-accent)', 
              textAlign: 'center' 
            }}>
              <h4 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Complete your professional profile</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Unlock access to personalized job matching and networking features.</p>
              <button 
                onClick={() => alert('Profile setup coming soon!')}
                style={{ background: 'var(--primary-accent)', padding: '0.75rem 2rem' }}
              >
                Set Up Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalDashboard;

