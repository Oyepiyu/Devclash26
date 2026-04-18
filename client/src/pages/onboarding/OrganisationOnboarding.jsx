import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const OrganisationOnboarding = ({ user }) => {
  if (!user || user.intent !== 'organisation') {
    return <Navigate to="/welcome" />;
  }

  const stages = [
    { id: 1, label: 'Company Details' },
    { id: 2, label: 'Role Claim' },
    { id: 3, label: 'Document Upload' },
    { id: 4, label: 'Verification' },
    { id: 5, label: 'Admin Review' }
  ];

  const currentStage = user.orgOnboardingStage || 1;

  return (
    <div className="onboarding-container fade-in" style={{
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '0 1rem'
    }}>
      {/* Progress Tracker */}
      <div className="progress-tracker-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '3rem',
        position: 'relative',
        padding: '0 1rem'
      }}>
        <div className="progress-line" style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          right: '0',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }}></div>
        <div className="progress-line-active" style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          width: `${((currentStage - 1) / (stages.length - 1)) * 100}%`,
          height: '2px',
          background: 'var(--primary-accent)',
          transition: 'width 0.4s ease',
          zIndex: 0
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
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: currentStage >= stage.id ? 'var(--primary-accent)' : '#1a1d23',
              border: `2px solid ${currentStage >= stage.id ? 'var(--primary-accent)' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: currentStage >= stage.id ? '#fff' : 'var(--text-muted)',
              marginBottom: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: currentStage === stage.id ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
            }}>
              {stage.id}
            </div>
            <span style={{
              fontSize: '0.75rem',
              color: currentStage >= stage.id ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: currentStage >= stage.id ? '600' : '400',
              textAlign: 'center',
              width: '80px'
            }}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      <div className="onboarding-content">
        <Outlet />
      </div>
    </div>
  );
};

export default OrganisationOnboarding;
