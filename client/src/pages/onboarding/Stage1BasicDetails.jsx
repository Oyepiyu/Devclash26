import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Globe, Loader2, IndianRupee } from 'lucide-react';

const Stage1BasicDetails = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    industry: '',
    foundedYear: new Date().getFullYear(),
    size: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    website: '',
    linkedin: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.split(/\s+/).length > 300) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://happily-launder-spearman.ngrok-free.dev/api/organisation/stage1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/onboarding/stage2');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    color: '#fff',
    width: '100%',
    marginBottom: '1rem'
  };

  const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--primary-accent)'
  };

  return (
    <div className="glass-panel slide-up" style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Company Identity</h2>
        <p style={{ color: 'var(--text-muted)' }}>Tell us about the organisation you represent.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Identity */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={sectionTitleStyle}><Building2 size={24} /> Identity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="label">Company Name</label>
              <input type="text" name="name" style={inputStyle} value={formData.name} onChange={handleChange} required placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="label">Company Type</label>
              <select name="type" style={inputStyle} value={formData.type} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                <option value="Public Limited">Public Limited</option>
                <option value="LLP">LLP (Limited Liability Partnership)</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership Firm">Partnership Firm</option>
                <option value="NGO / Trust">NGO / Trust</option>
                <option value="Startup">Startup (unregistered)</option>
                <option value="Agency">Agency / Freelance Studio</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="label">Industry</label>
              <select name="industry" style={inputStyle} value={formData.industry} onChange={handleChange} required>
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Founded Year</label>
              <input type="number" name="foundedYear" style={inputStyle} value={formData.foundedYear} onChange={handleChange} required min="1800" max={new Date().getFullYear()} />
            </div>
            <div>
              <label className="label">Company Size</label>
              <select name="size" style={inputStyle} value={formData.size} onChange={handleChange} required>
                <option value="">Select Size</option>
                <option value="1–10">1–10</option>
                <option value="11–50">11–50</option>
                <option value="51–200">51–200</option>
                <option value="201–500">201–500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Company Description (Max 300 words)</label>
            <textarea 
              name="description" 
              style={{ ...inputStyle, height: '120px', resize: 'none' }} 
              value={formData.description} 
              onChange={handleChange} 
              required 
              placeholder="Describe what your company does..."
            ></textarea>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {formData.description.split(/\s+/).filter(x => x).length} / 300 words
            </p>
          </div>
        </div>

        {/* Section 2: Location */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={sectionTitleStyle}><MapPin size={24} /> Company Location</h3>
          <div>
            <label className="label">Registered Address</label>
            <input type="text" name="address" style={inputStyle} value={formData.address} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="label">City</label>
              <input type="text" name="city" style={inputStyle} value={formData.city} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" name="state" style={inputStyle} value={formData.state} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="label">PIN Code</label>
              <input type="text" name="pinCode" style={inputStyle} value={formData.pinCode} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" name="country" style={inputStyle} value={formData.country} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Section 3: Online Presence */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyle}><Globe size={24} /> Online Presence</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="label">Official Website URL</label>
              <input type="url" name="website" style={inputStyle} value={formData.website} onChange={handleChange} required placeholder="https://..." />
            </div>
            <div>
              <label className="label">LinkedIn Page URL (Optional)</label>
              <input type="url" name="linkedin" style={inputStyle} value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
            </div>
          </div>
          <div>
            <label className="label">Company Email ID (Must match domain later)</label>
            <input type="email" name="email" style={inputStyle} value={formData.email} onChange={handleChange} required placeholder="hr@yourcompany.com" />
          </div>
        </div>

        {error && <div className="status-card error">{error}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '2rem' }}>
          {loading ? <Loader2 className="spin" /> : 'Save & Continue to Stage 2'}
        </button>
      </form>
    </div>
  );
};

export default Stage1BasicDetails;
