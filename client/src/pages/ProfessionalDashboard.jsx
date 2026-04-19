import React, { useState, useEffect } from 'react';
import { LogOut, User, Mail, ShieldCheck, Briefcase, Users, Calendar, Lightbulb, TrendingUp, ShieldAlert, CheckCircle, XCircle, Search, Bell, MessageSquare, Star, Send, UserPlus, Eye, Ticket } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../apiConfig';

function ProfessionalDashboard({ user, setUser }) {
  const [flaggedOrgs, setFlaggedOrgs] = useState([]);
  const [flaggedEvents, setFlaggedEvents] = useState([]);
  const [flaggedAgreements, setFlaggedAgreements] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states for features (API data alone)
  const [feedPosts, setFeedPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [myNetwork, setMyNetwork] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [myAgreements, setMyAgreements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const isAdmin = user?.email?.toLowerCase().trim() === 'priyanshu.s.rathi@gmail.com';

  useEffect(() => {
    const fetchFlagged = async () => {
      if (!isAdmin) return;
      setAdminLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Fetch orgs
        const orgRes = await fetch(`${API_URL}/organisation/flagged`, { headers: { Authorization: `Bearer ${token}` } });
        const orgData = await orgRes.json();
        if (orgRes.ok) setFlaggedOrgs(orgData.organisations);

        // Fetch events
        const evRes = await fetch(`${API_URL}/events/flagged`, { headers: { Authorization: `Bearer ${token}` } });
        const evData = await evRes.json();
        if (evRes.ok) setFlaggedEvents(evData.events);

        // Fetch Investment Agreements
        const agrRes = await fetch(`${API_URL}/investment/flagged`, { headers: { Authorization: `Bearer ${token}` } });
        const agrData = await agrRes.json();
        if (agrRes.ok) setFlaggedAgreements(agrData.agreements);
      } catch (err) {
        console.error('Admin fetch failed:', err);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchFlagged();
  }, [isAdmin]);

  // Fetch data based on active tab
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    if (activeTab === 'feed') {
      fetch(`${API_URL}/feed/all`, { headers }).then(r => r.json()).then(d => setFeedPosts(d.posts || [])).catch(() => {});
    }
    if (activeTab === 'jobs') {
      fetch(`${API_URL}/jobs/all`, { headers }).then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => {});
    }
    if (activeTab === 'events') {
      fetch(`${API_URL}/events/all`, { headers }).then(r => r.json()).then(d => setEvents(d.events || [])).catch(() => {});
    }
    if (activeTab === 'network') {
      fetch(`${API_URL}/network/my-network`, { headers }).then(r => r.json()).then(d => setMyNetwork(d.network || [])).catch(() => {});
    }
    if (activeTab === 'notifications') {
      fetch(`${API_URL}/network/notifications`, { headers }).then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {});
    }
    if (activeTab === 'tickets') {
      fetch(`${API_URL}/events/my-tickets`, { headers }).then(r => r.json()).then(d => setMyTickets(d.tickets || [])).catch(() => {});
    }
    if (activeTab === 'investments') {
      fetch(`${API_URL}/investment/my-agreements`, { headers }).then(r => r.json()).then(d => setMyAgreements(d.agreements || [])).catch(() => {});
    }
  }, [activeTab]);

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orgId, action, reason })
      });
      if (response.ok) {
        setFlaggedOrgs(prev => prev.filter(org => org._id !== orgId));
        alert(`Organisation ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully.`);
      }
    } catch (err) { alert('Action failed.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/feed/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: postContent })
      });
      if (res.ok) { setPostContent(''); fetch(`${API_URL}/feed/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setFeedPosts(d.posts || [])); }
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults(null); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/network/search?q=${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (res.ok) setSearchResults(d);
    } catch (err) { console.error(err); }
  };

  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/network/connect/${userId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      alert(d.message);
    } catch (err) { alert('Failed'); }
  };

  const handleApplyJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/jobs/apply/${jobId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      alert(d.message);
    } catch (err) { alert('Failed'); }
  };

  const handleJoinEvent = async (ev) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = ev.price > 0 ? `/events/buy/${ev._id}` : `/events/join/${ev._id}`;
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      alert(d.message);
      if (res.ok && ev.price > 0) window.location.reload(); // Reload to reflect Wallet deduction
    } catch (err) { alert('Failed'); }
  };

  const handleAdminEventAction = async (eventId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/events/admin-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ eventId, action })
      });
      const d = await res.json();
      alert(d.message);
      if (res.ok) setFlaggedEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) { alert('Action failed'); }
  };

  const handleAdminAgreementAction = async (agreementId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/investment/admin-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ agreementId, action })
      });
      const d = await res.json();
      alert(d.message);
      if (res.ok) setFlaggedAgreements(prev => prev.filter(a => a._id !== agreementId));
    } catch (err) { alert('Admin action failed'); }
  };

  const handleInitiateInvestment = async (orgId, amount) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/investment/initiate/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount })
      });
      const d = await res.json();
      alert(d.message);
      if (res.ok) {
        setActiveTab('investments');
        window.location.reload();
      }
    } catch (err) { alert('Investment initiation failed'); }
  };

  const handleInvestorSign = async (agreementId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/investment/sign-investor/${agreementId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      alert(d.message);
      if (res.ok) window.location.reload();
    } catch (err) { alert('Signing failed'); }
  };

  const handleDispute = async (eventId) => {
    const reason = prompt('Please describe why you are disputing this event:');
    if (!reason) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/events/dispute/${eventId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) });
      const d = await res.json();
      alert(d.message);
      fetch(`${API_URL}/events/my-tickets`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setMyTickets(d.tickets || []));
    } catch (err) { alert('Failed'); }
  };

  const handleAcceptConnection = async (connId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/network/accept/${connId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      alert(d.message);
      // Refresh notifications
      fetch(`${API_URL}/network/notifications`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setNotifications(d.notifications || []));
    } catch (err) { alert('Failed'); }
  };

  // Tab definitions for professional users
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'feed', label: 'Feed', icon: <Star size={16} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
    { id: 'tickets', label: 'My Tickets', icon: <Ticket size={16} /> },
    { id: 'network', label: 'Network', icon: <Users size={16} /> },
    { id: 'search', label: 'Discover', icon: <Search size={16} /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell size={16} /> },
    { id: 'investments', label: 'Investments', icon: <ShieldCheck size={16} /> },
    isAdmin && { id: 'admin_console', label: 'Admin Console', icon: <ShieldAlert size={16} /> },
  ].filter(Boolean);

  // ===========================================
  // RENDER: The right-panel content based on tab
  // ===========================================
  const renderTabContent = () => {
    switch (activeTab) {
      // ===================== OVERVIEW (ORIGINAL DASHBOARD) =====================
      case 'overview':
        return (
          <>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'left' }}>Professional Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Wallet Balance', value: `₹${user?.walletBalance || 0}`, icon: <TrendingUp size={20} /> },
                { label: 'Connections', value: String(myNetwork.length || 0), icon: <Users size={20} /> },
                { label: 'Applications Sent', value: '0', icon: <Mail size={20} /> },
                { label: 'Tickets Bought', value: String(myTickets.length || 0), icon: <Calendar size={20} /> },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'left' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: '🔍 Find Jobs', tab: 'jobs', icon: <Briefcase size={18} /> },
                  { label: '🤝 Network', tab: 'network', icon: <Users size={18} /> },
                  { label: '📅 Browse Events', tab: 'events', icon: <Calendar size={18} /> },
                  { label: '💡 Find Opportunities', tab: 'search', icon: <Lightbulb size={18} /> },
                ].map((btn, i) => (
                  <button key={i} onClick={() => setActiveTab(btn.tab)}
                    style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '2.5rem 2rem', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed var(--primary-accent)', textAlign: 'center' }}>
              <h4 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Complete your professional profile</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Unlock access to personalized job matching and networking features.</p>
              <button style={{ background: 'var(--primary-accent)', padding: '0.75rem 2rem' }}>Set Up Profile</button>
            </div>
          </>
        );

      // ===================== FEED =====================
      case 'feed':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Updates & Feed</h2>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Share an achievement, project update, or professional milestone..." 
                style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', padding: '12px', marginBottom: '1rem', resize: 'none' }} />
              <button onClick={handleCreatePost} style={{ padding: '8px 24px' }}><Send size={16} /> Share Update</button>
            </div>
            {feedPosts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No updates yet. Be the first to share!</p>
            ) : feedPosts.map(post => (
              <div key={post._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {post.authorId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{post.authorId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <p style={{ lineHeight: '1.6' }}>{post.content}</p>
              </div>
            ))}
          </>
        );

      // ===================== JOBS =====================
      case 'jobs':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Browse Jobs</h2>
            {jobs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No job listings available yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {jobs.map(job => (
                <div key={job._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontWeight: 'bold' }}>{job.title}</h4>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary-accent)', borderRadius: '4px' }}>{job.jobType || 'Full-time'}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{job.organisationId?.name} • {job.location}</p>
                  {job.salary && <p style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '0.5rem', fontWeight: '600' }}>{job.salary}</p>}
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>{job.description?.substring(0, 100)}...</p>
                  <button onClick={() => handleApplyJob(job._id)} style={{ width: '100%', padding: '8px' }}>Apply Now</button>
                </div>
              ))}
            </div>
            )}
          </>
        );

      // ===================== EVENTS =====================
      case 'events':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Browse Events</h2>
            {events.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No events listed yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {events.map(ev => (
                <div key={ev._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 'bold' }}>{ev.title}</h4>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: ev.type === 'Virtual' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)', color: ev.type === 'Virtual' ? '#a78bfa' : '#34d399' }}>{ev.type || 'Event'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem' }}>
                    {ev.trustBand && <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>Trust: {ev.trustBand}</span>}
                    {ev.price > 0 ? <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(59,130,246,0.1)', borderRadius: '4px', color: 'var(--primary-accent)' }}>Paid: ₹{ev.price}</span> : <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', color: '#10b981' }}>Free</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📅 {new Date(ev.date).toLocaleDateString()} • 📍 {ev.location}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>By {ev.organisationId?.name}</p>
                  <button onClick={() => handleJoinEvent(ev)} style={{ width: '100%', background: 'rgba(59,130,246,0.1)', color: 'var(--primary-accent)', border: '1px solid rgba(59,130,246,0.2)', padding: '8px' }}>{ev.price > 0 ? 'Buy Ticket via Escrow' : 'RSVP / Join'}</button>
                </div>
              ))}
            </div>
            )}
          </>
        );

      // ===================== MY TICKETS =====================
      case 'tickets':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Tickets</h2>
            {myTickets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>You haven't bought any tickets yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {myTickets.map(ticket => (
                  <div key={ticket._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{ticket.eventId?.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {ticket.eventId?.status} • Escrow: {ticket.eventId?.escrowStatus} • Paid: ₹{ticket.amountPaid}</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Purchased: {new Date(ticket.createdAt).toLocaleDateString()} | TXN: {ticket.transactionId}</p>
                    </div>
                    <div>
                      {ticket.eventId?.status === 'Upcoming' && !ticket.disputeRaised && (
                        <button onClick={() => handleDispute(ticket.eventId._id)} style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171' }}>Raise Dispute</button>
                      )}
                      {ticket.disputeRaised && <span style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '4px', fontSize: '0.8rem' }}>Dispute Under Review</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      // ===================== MY NETWORK =====================
      case 'network':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Network</h2>
            {myNetwork.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No connections yet.</p>
                <button onClick={() => setActiveTab('search')} style={{ marginTop: '1rem' }}>Discover People</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {myNetwork.map(person => (
                <div key={person._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
                    {person.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{person.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{person.profProfile?.title || 'Professional'}</div>
                  </div>
                  {person.trustScore && <div style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary-accent)' }}>{person.trustScore}%</div>}
                </div>
              ))}
            </div>
            )}
          </>
        );

      // ===================== DISCOVER / SEARCH =====================
      case 'search':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Discover People & Organisations</h2>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name, skills, industry..."
                style={{ paddingLeft: '42px', fontSize: '1rem' }} />
            </div>
            {searchResults && (
              <>
                {searchResults.people?.length > 0 && (
                  <>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1rem' }}>PEOPLE</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                      {searchResults.people.map(p => (
                        <div key={p._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.profProfile?.title || 'Professional'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary-accent)' }}>Trust: {p.trustScore}%</div>
                          </div>
                          <button onClick={() => handleConnect(p._id)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}><UserPlus size={14} /> Connect</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {searchResults.organisations?.length > 0 && (
                  <>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1rem' }}>ORGANISATIONS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {searchResults.organisations.map(o => (
                        <div key={o._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{o.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.industry} • {o.city}</div>
                          </div>
                          {user?.role !== 'organisation_owner' && (
                            <button 
                              onClick={() => {
                                const amt = prompt(`Enter investment amount for ${o.name} (₹):`);
                                if (amt) handleInitiateInvestment(o._id, Number(amt));
                              }}
                              style={{ padding: '8px 16px', background: 'var(--primary-accent)', color: '#fff' }}
                            >
                              Invest
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {searchResults.people?.length === 0 && searchResults.organisations?.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No results found.</p>
                )}
              </>
            )}
          </>
        );
      case 'investments':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Your Investment Portfolio</h2>
            {myAgreements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No investment activity yet. Use 'Discover' to find verified organisations.</p>
                <button onClick={() => setActiveTab('search')} style={{ marginTop: '1rem', background: 'var(--primary-accent)' }}>Discover Organisations</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                {myAgreements.map(agr => (
                  <div key={agr._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{agr.organisationId?.name}</h4>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-accent)' }}>Amount: ₹{agr.amount}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Status: {agr.status.replace('_', ' ')}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Escrow Status: <span style={{ color: '#fbbf24' }}>{agr.escrowStatus}</span></p>
                    </div>
                    <div>
                      {agr.status === 'owner_signed' && (
                        <button onClick={() => handleInvestorSign(agr._id)} style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none' }}>Release & E-Sign</button>
                      )}
                      {agr.status === 'completed' && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold' }}><CheckCircle size={18} /> Investment Secured</div>}
                      {agr.status === 'pending' && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Awaiting Owner Signature...</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      case 'notifications':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Notifications</h2>
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>You're all caught up! 🎉</p>
            ) : notifications.map(n => (
              <div key={n._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: n.type === 'ConnectionRequest' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.type === 'ConnectionRequest' ? 'var(--primary-accent)' : 'var(--success)' }}>
                    {n.type === 'ConnectionRequest' ? <UserPlus size={16} /> : <Bell size={16} />}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{n.sender?.name}</span>{' '}
                    {n.type === 'ConnectionRequest' ? 'wants to connect with you' : n.type === 'ConnectionAccepted' ? 'accepted your connection request' : 'sent a notification'}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {n.type === 'ConnectionRequest' && (
                  <button onClick={() => handleAcceptConnection(n._id)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Accept</button>
                )}
              </div>
            ))}
          </>
        );

      case 'admin_console':
        return (
          <>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin Control Center</h2>
            
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.2rem', color: 'var(--primary-accent)' }}>Organisations Awaiting Verification</h3>
              {flaggedOrgs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No orgs currently flagged.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {flaggedOrgs.map(org => (
                    <div key={org._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{textAlign: 'left'}}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{org.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trust Score: {org.trustScore}% | {org.ownerId?.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAdminAction(org._id, 'APPROVE')} style={{ padding: '6px 16px', background: '#10b981', border: 'none', color: '#fff' }}>Approve</button>
                        <button onClick={() => handleAdminAction(org._id, 'REJECT')} style={{ padding: '6px 16px', background: '#f43f5e', border: 'none', color: '#fff' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.2rem', color: 'var(--primary-accent)' }}>Events Under High-Risk Review</h3>
              {flaggedEvents.filter(e => e.trustBand === 'Admin Review').length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No events currently flagged.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {flaggedEvents.filter(e => e.trustBand === 'Admin Review').map(ev => (
                    <div key={ev._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{textAlign: 'left'}}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Org: {ev.organisationId?.name} | Score: {ev.trustScore}%</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAdminEventAction(ev._id, 'APPROVE')} style={{ padding: '6px 16px', background: 'var(--primary-accent)', border: 'none', color: '#fff' }}>Allow Listing</button>
                        <button onClick={() => handleAdminEventAction(ev._id, 'REJECT')} style={{ padding: '6px 16px', background: '#f43f5e', border: 'none', color: '#fff' }}>Block Event</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.2rem', color: 'var(--primary-accent)' }}>Escrow Disputes & Frozen Funds (Events)</h3>
              {flaggedEvents.filter(e => e.escrowStatus === 'Frozen').length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active event disputes.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {flaggedEvents.filter(e => e.escrowStatus === 'Frozen').map(ev => (
                    <div key={ev._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #f43f5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{textAlign: 'left'}}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#f87171' }}>DISPUTE: {ev.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reasons: {ev.disputes?.length} reports | Est. Escrow: ₹{ev.ticketsSold * ev.price}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAdminEventAction(ev._id, 'RELEASE_FUNDS')} style={{ padding: '6px 16px', background: '#10b981', border: 'none', color: '#fff' }}>Release to Org</button>
                        <button onClick={() => handleAdminEventAction(ev._id, 'REFUND_DISPUTE')} style={{ padding: '6px 16px', background: '#f43f5e', border: 'none', color: '#fff' }}>Refund Users</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.2rem', color: 'var(--primary-accent)' }}>Investment Escrow Management</h3>
              {flaggedAgreements.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No investment agreements requiring oversight.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {flaggedAgreements.map(agr => (
                    <div key={agr._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{textAlign: 'left'}}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>INVESTMENT: {agr.amount} for {agr.organisationId?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Investor: {agr.investorId?.name} | Owner: {agr.ownerId?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px' }}>Status: {agr.status} | Escrow: {agr.escrowStatus}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAdminAgreementAction(agr._id, 'RELEASE')} style={{ padding: '6px 16px', background: '#10b981', border: 'none', color: '#fff' }}>Release to Org</button>
                        <button onClick={() => handleAdminAgreementAction(agr._id, 'REFUND')} style={{ padding: '6px 16px', background: '#f43f5e', border: 'none', color: '#fff' }}>Refund Investor</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );

      default:
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Coming soon!</p>;
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* ============= LEFT SIDEBAR: Profile Info (ORIGINAL - UNTOUCHED) ============= */}
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
              <div style={{ height: '100%', width: `${user?.trustScore || 0}%`, background: 'var(--primary-accent)', transition: 'width 1s ease' }}></div>
            </div>
          </div>

          <button onClick={handleLogout} style={{ 
            width: '100%', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#f87171', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginTop: '2rem',
            marginBottom: '1.5rem'
          }}>
            <LogOut size={18} /> Sign Out
          </button>

          {/* DEV ROLE SWITCHER */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Dev: Switch Testing Role</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['professional', 'organisation_owner', 'investor'].map(r => (
                <button 
                  key={r}
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/auth/update-role`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ role: r })
                    });
                    const d = await res.json();
                    if (res.ok) {
                      window.location.href = '/';
                    } else {
                      alert(`Switch failed: ${d.message}`);
                    }
                  }}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.75rem', 
                    background: user?.role === r ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
                    color: user?.role === r ? '#fff' : 'var(--text-muted)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'left',
                    borderRadius: '4px'
                  }}
                >
                  {r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============= RIGHT MAIN CONTENT ============= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* ADMIN PORTAL (ORIGINAL - UNTOUCHED) */}


          {/* ============= TAB NAVIGATION BAR (NEW) ============= */}
          <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-accent)' : 'var(--text-muted)',
                  border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: activeTab === tab.id ? '600' : '400',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ============= TAB CONTENT (NEW) ============= */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalDashboard;
