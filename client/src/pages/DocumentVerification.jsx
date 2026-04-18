import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCheck, AlertCircle, Shield } from 'lucide-react';
import * as faceapi from 'face-api.js';

const DocumentVerification = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', dob: '', age: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorCard, setErrorCard] = useState(null);
  const [trustScore, setTrustScore] = useState(40);
  const [success, setSuccess] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models on mount to mathematically compare ID face with webcam face
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Document ML model load failed:', err);
      }
    };
    loadModels();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Auto-calculate age when DOB changes
  const handleDobChange = (dob) => {
    setFormData(prev => ({ ...prev, dob }));
    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setFormData(prev => ({ ...prev, dob, age: String(age) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorCard(null);

    if (!formData.fullName || !formData.dob || !formData.age) {
      setErrorCard('Please fill in all fields');
      return;
    }
    if (!file) {
      setErrorCard('Please upload an identity document');
      return;
    }
    if (!modelsLoaded) {
      setErrorCard('Security models are still loading. Please wait a moment.');
      return;
    }

    setLoading(true);
    setStatus('Extracting Face from Document for Match...');

    let documentFaceEmbedding = null;

    try {
      // 1) Extract Face from Document at HIGHEST PRECISION
      const fullResImg = await faceapi.fetchImage(preview);
      
      // Stage A: Detect face location
      const detection = await faceapi.detectSingleFace(
        fullResImg, 
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })
      ).withFaceLandmarks();

      if (!detection) {
        setErrorCard('Verification Failed: Could not detect a clear human face on this document.');
        setLoading(false);
        setStatus('');
        return;
      }

      // Stage B: Precision Crop (Isolates face from ID text/noise)
      const regions = detection.detection.box;
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        fullResImg, 
        regions.x, regions.y, regions.width, regions.height, 
        0, 0, 150, 150
      );

      // Stage C: Final Embedding from Clean Crop
      const finalExtraction = await faceapi.computeFaceDescriptor(canvas);
      
      console.log(`[TrustLink Client v4.5] Precision Embedding Extracted.`);
      documentFaceEmbedding = Array.from(finalExtraction);

      setStatus('Running Global Verification...');
      
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('dob', formData.dob);
      data.append('age', formData.age);
      data.append('document', file);
      data.append('documentFaceEmbedding', JSON.stringify(documentFaceEmbedding));

      const token = localStorage.getItem('token');
      
      const response = await fetch('https://happily-launder-spearman.ngrok-free.dev/api/verify-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('✅ Document seamlessly matched!');
        setSuccess(true);

        // Animate trust score sequentially based on backend evaluation
        let score = 40;
        const targetScore = result.user.trustScore; // Will be 60 normally, 50 if high-profile
        
        const interval = setInterval(() => {
          if (score < targetScore) {
            score += 1;
            setTrustScore(score);
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setUser(result.user);
              navigate('/dashboard');
            }, 1200);
          }
        }, 40);
      } else {
        setStatus('');
        setErrorCard(result.message || 'Document verification failed');
        
        setTimeout(() => {
          localStorage.removeItem('token');
          setUser(null);
          navigate('/');
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setStatus('');
      setErrorCard('Server error. Please try again.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="fade-in">
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>✓</div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Face Verified</span>
        </div>
        <div style={{ width: '40px', height: '2px', background: 'var(--border-color)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>2</div>
          <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>Document Verification</span>
        </div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <Shield size={28} color="var(--primary-accent)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Verify Your Identity</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter your details exactly as they appear on your document</p>
          </div>
        </div>

        {status && (
          <div className="status-card success" style={{ marginBottom: '1rem' }}>
            {status}
          </div>
        )}

        {errorCard && (
          <div className="status-card error slide-up" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} /> {errorCard}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div>
            <label className="label">Full Name (as on document)</label>
            <input 
              type="text" 
              placeholder="e.g. Priyanshu Kumar Sharma"
              required
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Date of Birth</label>
              <input 
                type="date" 
                required
                value={formData.dob}
                onChange={e => handleDobChange(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="label">Age</label>
              <input 
                type="number" 
                placeholder="e.g. 22"
                required
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                min="1"
                max="150"
              />
            </div>
          </div>

          <div>
            <label className="label">Upload Identity Document</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 8px 0' }}>
              Aadhar Card, PAN Card, Passport, Driving License, etc. (Images Only)
            </p>
            <label 
              htmlFor="doc-upload"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '1.5rem',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                background: file ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.1)',
                borderColor: file ? 'var(--success)' : 'var(--border-color)',
              }}
            >
              {preview ? (
                <img id="doc-preview-img" src={preview} alt="Document preview" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} crossOrigin="anonymous" />
              ) : (
                <Upload size={32} color="var(--text-muted)" />
              )}
              <span style={{ color: file ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                {file ? file.name : 'Click to upload document'}
              </span>
            </label>
            <input 
              id="doc-upload"
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success || !modelsLoaded}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <>Processing...</>
            ) : success ? (
              <><FileCheck size={18} /> Verified!</>
            ) : !modelsLoaded ? (
              <>Loading Face Engine...</>
            ) : (
              <><FileCheck size={18} /> Verify Identity</>
            )}
          </button>
        </form>

        {success && (
          <div className="slide-up" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Trust Score</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)', margin: 0 }}>{trustScore}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVerification;
