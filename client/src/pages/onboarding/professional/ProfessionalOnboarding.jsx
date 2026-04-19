import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProfessionalOnboarding = ({ user }) => {
  if (!user || user.intent !== 'professional') {
    return <Navigate to="/welcome" />;
  }

  const stages = [
    { id: 1, label: 'Personal Details' },
    { id: 2, label: 'Work & Projects' },
    { id: 3, label: 'Social Presence' }
  ];

  const currentStage = user.profOnboardingStage || 1;

  return (
    <div className="onboarding-container fade-in" style={{
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '0 1rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Professional Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete your professional identity to join the network.</p>
      </div>

      {/* Progress Tracker */}
      <div className="progress-tracker-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4rem',
        position: 'relative',
        padding: '0 2rem'
      }}>
        <div className="progress-line" style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          right: '0',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0
        }}></div>
        <div className="progress-line-active" style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          width: `${((currentStage - 1) / (stages.length - 1)) * 100}%`,
          height: '2px',
          background: 'var(--primary-accent)',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 0,
          boxShadow: '0 0 10px var(--primary-accent)'
        }}></div>

        {stages.map((stage) => (
          <div key={stage.id} className="progress-step" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
            position: 'relative'
          }}>
            <div className="step-circle" style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: currentStage >= stage.id ? 'var(--primary-accent)' : '#1a1d23',
              border: `2px solid ${currentStage >= stage.id ? 'var(--primary-accent)' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: currentStage >= stage.id ? '#fff' : 'var(--text-muted)',
              marginBottom: '0.75rem',
              transition: 'all 0.4s ease',
              boxShadow: currentStage === stage.id ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
              transform: currentStage === stage.id ? 'scale(1.1)' : 'scale(1)'
            }}>
              {stage.id}
            </div>
            <span style={{
              fontSize: '0.8rem',
              color: currentStage >= stage.id ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: currentStage >= stage.id ? '600' : '400',
              textAlign: 'center',
              width: '100px',
              transition: 'color 0.4s ease'
            }}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      <div className="onboarding-content slide-up">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfessionalOnboarding;
