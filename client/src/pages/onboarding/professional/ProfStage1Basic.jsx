import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, MapPin, Info, ArrowRight } from 'lucide-react';
import { API_URL } from '../../../apiConfig';

const ProfStage1Basic = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: user?.profProfile?.title || '',
    company: user?.profProfile?.company || '',
    employmentType: user?.profProfile?.employmentType || 'Full Time',
    industry: user?.profProfile?.industry || '',
    experience: user?.profProfile?.experience || '1-2',
    location: {
      city: user?.profProfile?.location?.city || '',
      state: user?.profProfile?.location?.state || '',
      country: user?.profProfile?.location?.country || ''
    },
    bio: user?.profProfile?.bio || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/professional/stage1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/professional-onboarding/stage2');
      } else {
        setError(data.message || 'Failed to save details');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel slide-up" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary-accent)' }}>
          <Briefcase size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Personal & Work Details</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tell us about your current professional standing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Job Title</label>
          <input 
            type="text" 
            name="title"
            placeholder="e.g. Senior Software Engineer"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Company</label>
          <input 
            type="text" 
            name="company"
            placeholder="Organisation Name"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Employment Type</label>
          <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Freelancer">Freelancer</option>
            <option value="Between Jobs">Between Jobs</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Industry</label>
          <input 
            type="text" 
            name="industry"
            placeholder="e.g. Fintech, Edtech"
            value={formData.industry}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Years of Experience</label>
          <select name="experience" value={formData.experience} onChange={handleChange}>
            <option value="1-2">1-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>City</label>
            <input type="text" name="location.city" value={formData.location.city} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>State</label>
            <input type="text" name="location.state" value={formData.location.state} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Country</label>
            <input type="text" name="location.country" value={formData.location.country} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>One Line Bio</label>
          <textarea 
            name="bio"
            placeholder="e.g. Building products at intersection of AI and design"
            value={formData.bio}
            onChange={handleChange}
            style={{ height: '80px' }}
            required
          />
        </div>

        {error && <div style={{ gridColumn: 'span 2', color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '1rem' }}>
          <button type="submit" disabled={loading} style={{ 
            padding: '0.75rem 2rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'var(--primary-accent)',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Saving...' : 'Next Step'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfStage1Basic;
