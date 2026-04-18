import { AlertTriangle } from 'lucide-react';
import { API_URL } from '../apiConfig';

const LegalDisclaimer = ({ onAccepted, orgId }) => {
  const logAcceptance = async (isAccepted) => {
    if (isAccepted) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/audit/log-acceptance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            orgId, 
            action: 'LEGAL_DISCLAIMER_ACCEPTED',
            details: { noticeTitle: 'IPC 465, IPC 471, IT Act 66C' }
          })
        });
      } catch (err) {
        console.error('Forensic logging failed:', err);
      }
    }
    onAccepted(isAccepted);
  };
  return (
    <div style={{ 
      border: '1px solid rgba(234, 179, 8, 0.3)', 
      background: 'rgba(234, 179, 8, 0.05)', 
      borderRadius: '12px', 
      padding: '1.5rem',
      marginBottom: '2rem'
    }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#fbbf24' }}>
        <AlertTriangle size={20} />
        <h4 style={{ fontWeight: 'bold', margin: 0 }}>Legal Notice</h4>
      </div>

      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', textAlign: 'left' }}>
        By uploading these documents, you confirm they are authentic and that you are an authorised representative 
        of this organisation. Submitting false or forged documents is a punishable offence under 
        <strong> IPC Section 465 (Forgery)</strong>, <strong>IPC Section 471</strong>, and <strong>IT Act Section 66C</strong>. 
        Your verified face, government ID, and all submitted documents are permanently linked to this submission.
      </p>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', textAlign: 'left' }}>
        <input 
          type="checkbox" 
          style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary-accent)' }} 
          onChange={(e) => logAcceptance(e.target.checked)}
        />
        <span style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.4' }}>
          I confirm all submitted documents are authentic and I am authorised to represent this organisation.
        </span>
      </label>
    </div>
  );
};

export default LegalDisclaimer;
