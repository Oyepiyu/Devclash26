import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Plus, Trash2, ArrowRight, ArrowLeft, Code } from 'lucide-react';
import { API_URL } from '../../../apiConfig';

const ProfStage2Skills = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [skills, setSkills] = useState(user?.profProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  
  const [openTo, setOpenTo] = useState(user?.profProfile?.openTo || []);
  
  const [pastExperience, setPastExperience] = useState(user?.profProfile?.pastExperience?.length ? user.profProfile.pastExperience : [{ company: '', role: '', duration: '', description: '' }]);
  
  const [projects, setProjects] = useState(user?.profProfile?.projects?.length ? user.profProfile.projects : [{ name: '', description: '', techStack: '' }]);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleOpenTo = (item) => {
    setOpenTo(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleExpChange = (index, field, value) => {
    const newExp = [...pastExperience];
    newExp[index][field] = value;
    setPastExperience(newExp);
  };

  const addExp = () => setPastExperience([...pastExperience, { company: '', role: '', duration: '', description: '' }]);
  const removeExp = (index) => setPastExperience(pastExperience.filter((_, i) => i !== index));

  const handleProjChange = (index, field, value) => {
    const newProj = [...projects];
    newProj[index][field] = value;
    setProjects(newProj);
  };

  const addProj = () => setProjects([...projects, { name: '', description: '', techStack: '' }]);
  const removeProj = (index) => setProjects(projects.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      skills,
      openTo,
      pastExperience: pastExperience.filter(e => e.company && e.role),
      projects: projects.filter(p => p.name)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/professional/stage2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/professional-onboarding/stage3');
      } else {
        setError(data.message || 'Failed to save experience');
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
          <Award size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Skills, Experience & Projects</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Showcase your technical and professional portfolio.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Skills Tag Input */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Skills & Expertise</label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            padding: '8px', 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px',
            marginBottom: '0.5rem'
          }}>
            {skills.map(skill => (
              <span key={skill} style={{ 
                background: 'rgba(59, 130, 246, 0.15)', 
                color: 'var(--primary-accent)', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {skill}
                <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
              </span>
            ))}
            <input 
              type="text" 
              placeholder="Type skill and press Enter..." 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              style={{ border: 'none', background: 'transparent', width: '200px', padding: '4px' }}
            />
          </div>
        </div>

        {/* Open To Checkboxes */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Currently Open To</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {['Job Opportunities', 'Freelance Projects', 'Networking', 'Investment', 'Mentoring'].map(item => (
              <label key={item} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                padding: '10px',
                background: openTo.includes(item) ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                border: `1px solid ${openTo.includes(item) ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}>
                <input 
                  type="checkbox" 
                  checked={openTo.includes(item)}
                  onChange={() => toggleOpenTo(item)}
                  style={{ display: 'none' }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* Past Experience Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>Work Experience</label>
            <button type="button" onClick={addExp} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 10px' }}>
              <Plus size={14} /> Add Experience
            </button>
          </div>
          {pastExperience.map((exp, i) => (
            <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '1rem', position: 'relative' }}>
              {pastExperience.length > 1 && <Trash2 size={16} style={{ position: 'absolute', top: '15px', right: '15px', color: '#f87171', cursor: 'pointer' }} onClick={() => removeExp(i)} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => handleExpChange(i, 'company', e.target.value)} />
                <input type="text" placeholder="Your Role" value={exp.role} onChange={(e) => handleExpChange(i, 'role', e.target.value)} />
                <input type="text" placeholder="Duration (e.g. 2020 - 2023)" value={exp.duration} onChange={(e) => handleExpChange(i, 'duration', e.target.value)} />
                <input type="text" placeholder="Brief Description" value={exp.description} onChange={(e) => handleExpChange(i, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>Personal Projects</label>
            <button type="button" onClick={addProj} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 10px' }}>
              <Plus size={14} /> Add Project
            </button>
          </div>
          {projects.map((proj, i) => (
            <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '1rem', position: 'relative' }}>
              {projects.length > 1 && <Trash2 size={16} style={{ position: 'absolute', top: '15px', right: '15px', color: '#f87171', cursor: 'pointer' }} onClick={() => removeProj(i)} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => handleProjChange(i, 'name', e.target.value)} />
                <input type="text" placeholder="Tech Stack (React, AWS, etc)" value={proj.techStack} onChange={(e) => handleProjChange(i, 'techStack', e.target.value)} />
                <div style={{ gridColumn: 'span 2' }}>
                  <input type="text" placeholder="Short Project Description" value={proj.description} onChange={(e) => handleProjChange(i, 'description', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button type="button" onClick={() => navigate('/professional-onboarding/stage1')} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <button type="submit" disabled={loading} style={{ 
            padding: '0.75rem 2.5rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'var(--primary-accent)',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Saving...' : 'Continue'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfStage2Skills;
