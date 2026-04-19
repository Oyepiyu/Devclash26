import React, { useState, useEffect } from 'react';
import { LogOut, ShieldCheck, ShieldAlert, Award, TrendingUp, Mail, CheckCircle2, Clock, Briefcase, Calendar, Users, Megaphone, CheckCircle, XCircle, Send, PlusCircle, Target, Search, Bell } from 'lucide-react';
import { API_URL } from '../apiConfig';
import ReportOrgButton from '../components/ReportOrgButton';

function OrganisationDashboard({ user, setUser }) {
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [flaggedOrgs, setFlaggedOrgs] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const isAdmin = user?.email?.toLowerCase().trim() === 'priyanshu.s.rathi@gmail.com';

  // New feature states
  const [feedPosts, setFeedPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '', salary: '', jobType: 'Full-time' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '', type: 'Virtual', price: '', totalCapacity: '' });
  const [myEvents, setMyEvents] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myAgreements, setMyAgreements] = useState([]);
  const [signingAgreement, setSigningAgreement] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const videoRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) setOrgData(data.user);
      } catch (err) { console.error('Error fetching org data:', err); } finally { setLoading(false); }
    };
    fetchOrg();
  }, []);

  useEffect(() => {
    const fetchMyOrg = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/organisation/my-org`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) setOrgData(data.organisation);
      } catch (err) { /* silent */ }
    };
    if (user) fetchMyOrg();
  }, [user]);

  useEffect(() => {
    const fetchFlagged = async () => {
      if (!isAdmin) return;
      setAdminLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/organisation/flagged`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) setFlaggedOrgs(data.organisations);
      } catch (err) { console.error('Failed to fetch flagged orgs:', err); } finally { setAdminLoading(false); }
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
    if (activeTab === 'notifications') {
      fetch(`${API_URL}/network/notifications`, { headers }).then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {});
    }
    if (activeTab === 'manage-events') {
      fetch(`${API_URL}/events/my-events`, { headers }).then(r => r.json()).then(d => setMyEvents(d.events || [])).catch(() => {});
    }
    if (activeTab === 'investments') {
      fetch(`${API_URL}/investment/my-agreements`, { headers }).then(r => r.json()).then(d => setMyAgreements(d.agreements || [])).catch(() => {});
    }
  }, [activeTab]);

  const handleAdminAction = async (orgId, action) => {
    let reason = '';
    if (action === 'REJECT') { reason = prompt('Reason for rejection:'); if (!reason) return; }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organisation/admin-action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orgId, action, reason })
      });
      if (response.ok) { setFlaggedOrgs(prev => prev.filter(org => org._id !== orgId)); alert(`Organisation ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully.`); }
    } catch (err) { alert('Action failed.'); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); setUser(null); };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/feed/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: postContent }) });
      if (res.ok) { setPostContent(''); fetch(`${API_URL}/feed/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setFeedPosts(d.posts || [])); }
    } catch (err) { console.error(err); }
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.description) return alert('Title and description required');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/jobs/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(jobForm) });
      const d = await res.json();
      alert(d.message);
      if (res.ok) { setJobForm({ title: '', description: '', location: '', salary: '', jobType: 'Full-time' }); setActiveTab('overview'); }
    } catch (err) { alert('Failed to post job'); }
  };

  const handlePostEvent = async () => {
    if (!eventForm.title || !eventForm.date) return alert('Title and date required');
    try {
      const token = localStorage.getItem('token');
      // Use the new /create-paid endpoint
      const res = await fetch(`${API_URL}/events/create-paid`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify(eventForm) 
      });
      const d = await res.json();
      
      if (res.ok) { 
        alert(`Event listed successfully! Trust Classification: ${d.trustBand}`);
        setEventForm({ title: '', description: '', date: '', location: '', type: 'Virtual', price: '', totalCapacity: '' }); 
        setActiveTab('manage-events'); 
      } else {
        alert(`Failed: ${d.message}`);
      }
    } catch (err) { alert('Failed to create event'); }
  };

  const handleCancelEvent = async (eventId) => {
    if(!window.confirm('Are you sure you want to cancel this event? This will issue refunds based on the timeframe and negatively impact your trust score.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/events/cancel/${eventId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      alert(d.message);
      // refresh events
    } catch (err) { alert('Failed to cancel event'); }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
    };
    mediaRecorderRef.current.start();
    setRecording(true);
    setTimeout(() => stopRecording(), 5000); // 5s auto-stop
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setRecording(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const handleOwnerSign = async () => {
    if (!videoBlob) return alert('Please record your consent first');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(videoBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/investment/sign-owner/${signingAgreement._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ videoData: base64data })
        });
        const d = await res.json();
        alert(d.message);
        if(res.ok) window.location.reload();
      };
    } catch (err) { alert('Signing failed'); }
  };

  const isFullyVerified = user?.trustScore >= 80;
  const isVerified = user?.trustScore > 30 && user?.trustScore < 80;
  const isPending = user?.trustScore <= 30;
  const isRejected = orgData?.verificationStatus === 'Rejected';
  const imageRiskDocs = orgData?.documents?.filter(doc => 
    (doc.docType === 'GST' || doc.docType === 'COI') && 
    (doc.fileUrl?.toLowerCase().endsWith('.png') || doc.fileUrl?.toLowerCase().endsWith('.jpg') || doc.fileUrl?.toLowerCase().endsWith('.jpeg'))
  ) || [];

  // Org-specific tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'feed', label: 'Feed', icon: <Megaphone size={16} /> },
    { id: 'post-job', label: 'Post Job', icon: <PlusCircle size={16} /> },
    { id: 'post-event', label: 'Host Event', icon: <Calendar size={16} /> },
    { id: 'manage-events', label: 'My Events', icon: <Target size={16} /> },
    { id: 'investments', label: 'Investments', icon: <ShieldCheck size={16} /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell size={16} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Dashboard Overview</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><Award size={20} /></div>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><TrendingUp size={20} /></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Wallet Balance', value: `₹${orgData?.walletBalance || 0}`, icon: <ShieldCheck /> },
                { label: 'Jobs Posted', value: String(myJobs.length || 0), icon: <Briefcase /> },
                { label: 'Events Hosted', value: String(myEvents.length || 0), icon: <Calendar /> },
                { label: 'Trust Score', value: `${orgData?.trustScore || 0}%`, icon: <TrendingUp /> },
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
              <button style={{ marginTop: '1rem', background: 'var(--primary-accent)', margin: '1rem auto' }}>Complete Public Profile</button>
            </div>
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'left' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: '📋 Post a Job', tab: 'post-job', icon: <Briefcase size={18} /> },
                  { label: '📅 Host an Event', tab: 'post-event', icon: <Calendar size={18} /> },
                  { label: '🤝 Find Collaborators', tab: 'overview', icon: <Users size={18} /> },
                  { label: '📢 Promote Organisation', tab: 'feed', icon: <Megaphone size={18} /> },
                ].map((btn, i) => (
                  <button key={i} onClick={() => setActiveTab(btn.tab)}
                    style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', color: '#fff', cursor: 'pointer', width: '100%', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <ReportOrgButton orgId={orgData?._id || user?.organisationId} />
          </>
        );

      case 'feed':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Company Feed</h2>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Share company news, achievements, or announcements..."
                style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', padding: '12px', marginBottom: '1rem', resize: 'none' }} />
              <button onClick={handleCreatePost} style={{ padding: '8px 24px' }}><Send size={16} /> Post Update</button>
            </div>
            {feedPosts.map(post => (
              <div key={post._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{post.authorId?.name?.charAt(0) || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{post.authorId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <p>{post.content}</p>
              </div>
            ))}
          </>
        );

      case 'post-job':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Post a Job</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Job Title (e.g. Senior Frontend Developer)" value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})} />
              <textarea placeholder="Job Description & Requirements" value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                style={{ height: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', padding: '12px', resize: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})} />
                <input type="text" placeholder="Salary Range" value={jobForm.salary} onChange={(e) => setJobForm({...jobForm, salary: e.target.value})} />
              </div>
              <select value={jobForm.jobType} onChange={(e) => setJobForm({...jobForm, jobType: e.target.value})}
                style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Contract">Contract</option>
              </select>
              <button onClick={handlePostJob}> Publish Job Listing</button>
            </div>
          </>
        );

      case 'post-event':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Host a Ticketed Event</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Organise virtual or on-site events. Trust scoring and escrow rules apply.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Event Title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} />
              <textarea placeholder="Event Description (Provide detail to increase trust score)" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                style={{ height: '100px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', padding: '12px', resize: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} style={{ colorScheme: 'dark' }} />
                <input type="text" placeholder="Location / Online Link" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <select value={eventForm.type} onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                  style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}>
                  <option value="Virtual">Virtual</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <input type="number" placeholder="Ticket Price (INR, 0 for free)" value={eventForm.price} onChange={(e) => setEventForm({...eventForm, price: e.target.value})} />
                <input type="number" placeholder="Total Capacity" value={eventForm.totalCapacity} onChange={(e) => setEventForm({...eventForm, totalCapacity: e.target.value})} />
              </div>
              
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.4)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f87171', marginBottom: '0.5rem' }}>Strict Cancellation Policy Acknowledgment</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  By listing an event, you agree that funds are held in escrow until 48 hours post-event. Cancellations will auto-trigger attendee refunds: &gt;7 days (100%), 3-7 days (75%), 1-3 days (50%), &lt;24 hours (25%). Late cancellations negatively impact your organisation's trust score. First-time paid events are subject to admin review prior to listing.
                </p>
              </div>

              <button onClick={handlePostEvent} style={{ marginTop: '1rem' }}>Submit Event for Listing</button>
            </div>
          </>
        );

      case 'manage-events':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Events & Escrow</h2>
            {myEvents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>You haven't hosted any events yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myEvents.map(ev => (
                  <div key={ev._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '4px' }}>{ev.title}</h4>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                          <span style={{ padding: '2px 8px', background: ev.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: ev.status === 'Cancelled' ? '#f87171' : 'var(--primary-accent)', borderRadius: '4px' }}>{ev.status}</span>
                          <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderRadius: '4px' }}>{ev.trustBand}</span>
                          {ev.escrowStatus !== 'N/A' && <span style={{ padding: '2px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px' }}>Escrow: {ev.escrowStatus}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{ev.price > 0 ? `₹${ev.price}` : 'Free'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.ticketsSold} / {ev.totalCapacity} sold</div>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Date: {new Date(ev.date).toLocaleDateString()}
                      </div>
                      {ev.status === 'Upcoming' && (
                        <button onClick={() => handleCancelEvent(ev._id)} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '6px 12px', fontSize: '0.8rem' }}>
                          Cancel Event
                        </button>
                      )}
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
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No notifications yet.</p>
            ) : notifications.map(n => (
              <div key={n._id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 'bold' }}>{n.sender?.name}</span> — {n.type}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </>
        );

      case 'investments':
        return (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Direct Investor Agreements</h2>
            
            {signingAgreement ? (
              <div className="slide-up" style={{ padding: '2rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid var(--primary-accent)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recorded Consent: {signingAgreement.investorId?.name}</h3>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {recording ? <video ref={videoRef} autoPlay muted style={{ width: '100%' }} /> : (videoBlob ? <video src={URL.createObjectURL(videoBlob)} controls style={{ width: '100%' }} /> : <p style={{ color: '#fff' }}>Camera Ready</p>)}
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {!recording && !videoBlob && <button onClick={startRecording} style={{ background: 'var(--primary-accent)' }}>Start 5s Recording</button>}
                  {recording && <button style={{ background: '#f43f5e' }} disabled>Recording... (5s)</button>}
                  {videoBlob && (
                    <>
                      <button onClick={() => { setVideoBlob(null); setRecording(false); }} style={{ background: 'rgba(255,255,255,0.1)' }}>Retake</button>
                      <button onClick={handleOwnerSign} style={{ background: '#10b981' }}>Confirm Identity & Sign</button>
                    </>
                  )}
                  <button onClick={() => setSigningAgreement(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>Cancel</button>
                </div>
              </div>
            ) : myAgreements.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No active investment agreements yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {myAgreements.map(agr => (
                  <div key={agr._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>Investor: {agr.investorId?.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount: ₹{agr.amount} | Escrow: {agr.escrowStatus}</p>
                      <div style={{ marginTop: '5px', fontSize: '0.7rem', color: agr.status === 'completed' ? '#10b981' : 'var(--primary-accent)' }}>Status: {agr.status}</div>
                    </div>
                    <div>
                      {agr.status === 'pending' && <button onClick={() => setSigningAgreement(agr)} style={{ padding: '8px 16px', background: 'var(--primary-accent)', color: '#fff' }}>Record Consent & Sign</button>}
                      {agr.status === 'owner_signed' && <span style={{ color: '#fbbf24' }}>Waiting for Investor Sign</span>}
                      {agr.status === 'completed' && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Secured</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      default:
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Coming soon!</p>;
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* ADMIN PORTAL (ORIGINAL - UNTOUCHED) */}
      {isAdmin && (
        <div className="glass-panel slide-up" style={{ padding: '2rem', border: '1px solid var(--primary-accent)', background: 'rgba(59, 130, 246, 0.05)', marginBottom: '2rem' }}>
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
                <div key={org._id} style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{org.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Owner: {org.ownerId?.name} ({org.ownerId?.email})</p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-accent)' }}>Score: {org.trustScore}%</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>{org.verificationStatus}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleAdminAction(org._id, 'APPROVE')} style={{ padding: '8px', background: 'rgba(34, 197, 94, 1)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><CheckCircle size={20} /></button>
                    <button onClick={() => handleAdminAction(org._id, 'REJECT')} style={{ padding: '8px', background: 'rgba(239, 68, 68, 1)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BANNERS (ORIGINAL - UNTOUCHED) */}
      {isRejected && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#f87171', textAlign: 'left' }}>
          <ShieldAlert size={32} />
          <div>
            <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '1.2rem' }}>⚠️ Organisation Suspended</h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>Reason: {orgData?.suspendedReason || 'Multiple community reports or suspicious documents detected.'}</p>
          </div>
        </div>
      )}
      {!isRejected && imageRiskDocs.length > 0 && (
        <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#fbbf24', textAlign: 'left' }}>
          <ShieldAlert size={24} />
          <div>
            <h4 style={{ fontWeight: 'bold', margin: 0 }}>🛡️ Security Risk Advisor</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>Official docs ({imageRiskDocs.map(d => d.docType).join(', ')}) uploaded as images will trigger manual review delays.</p>
          </div>
        </div>
      )}
      {!isRejected && isPending && (
        <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#facc15' }}>
          <Clock size={24} /><div style={{ textAlign: 'left' }}><h4 style={{ fontWeight: 'bold', margin: 0 }}>⏳ Your organisation is under review</h4><p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>Submitted documents are being verified. Expected: within 24 hours.</p></div>
        </div>
      )}
      {(isVerified || isFullyVerified) && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#4ade80' }}>
          <CheckCircle2 size={24} /><div style={{ textAlign: 'left' }}><h4 style={{ fontWeight: 'bold', margin: 0 }}>✅ Organisation is {isFullyVerified ? 'Fully Verified' : 'Verified'}</h4><p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>Trust Score: {user?.trustScore}/100</p></div>
          <div style={{ marginLeft: 'auto', background: 'rgba(34, 197, 94, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{isFullyVerified ? 'PREMIUM BADGE' : 'VERIFIED'}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* ============= LEFT SIDEBAR: Profile (ORIGINAL - UNTOUCHED) ============= */}
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
          <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
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
                    background: user?.role === r ? '#10b981' : 'rgba(255,255,255,0.05)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* TAB NAVIGATION (NEW) */}
          <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#10b981' : 'var(--text-muted)',
                  border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: activeTab === tab.id ? '600' : '400',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganisationDashboard;
