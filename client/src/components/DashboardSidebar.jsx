import React from 'react';
import { 
  Home, MessageSquare, Bell, Search, User, 
  Users, Briefcase, Calendar, Star, TrendingUp, 
  PlusCircle, PieChart, Target, ShieldAlert
} from 'lucide-react';

const DashboardSidebar = ({ user, activeView, setActiveView }) => {
  const commonLinks = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { id: 'feed', label: 'Global Feed', icon: <TrendingUp size={20} /> },
    { id: 'messages', label: 'Messaging', icon: <MessageSquare size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'search', label: 'Discover', icon: <Search size={20} /> },
  ];

  const professionalLinks = [
    { id: 'network', label: 'My Network', icon: <Users size={20} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={20} /> },
    { id: 'opportunities', label: 'Opportunities', icon: <Star size={20} /> },
  ];

  const organisationLinks = [
    { id: 'post-job', label: 'Recruitment', icon: <PlusCircle size={20} /> },
    { id: 'post-event', label: 'Host Events', icon: <Calendar size={20} /> },
    { id: 'candidates', label: 'Applicants', icon: <Users size={20} /> },
    { id: 'b2b', label: 'B2B Collab', icon: <Target size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart size={20} /> },
  ];

  const links = [
    ...commonLinks,
    ...(user?.intent === 'professional' ? professionalLinks : organisationLinks)
  ];

  return (
    <div style={{
      width: '240px',
      minWidth: '240px',
      minHeight: 'calc(100vh - 120px)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      borderRight: '1px solid var(--border-color)',
      background: 'rgba(255, 255, 255, 0.02)'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '12px' }}>
        NAVIGATION
      </div>
      
      {links.map(link => (
        <button
          key={link.id}
          onClick={() => setActiveView(link.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: activeView === link.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeView === link.id ? 'var(--primary-accent)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'flex-start',
            fontSize: '0.9rem',
            fontWeight: activeView === link.id ? '600' : '400'
          }}
        >
          {link.icon}
          {link.label}
        </button>
      ))}
      
      {user?.email === 'priyanshu.s.rathi@gmail.com' && (
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveView('admin')}
            style={{
              padding: '12px', borderRadius: '10px', width: '100%', justifyContent: 'flex-start',
              background: activeView === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              color: '#f87171', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <ShieldAlert size={18} /> Admin Oversight
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
