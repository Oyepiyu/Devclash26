import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

const Verification = ({ user, setUser }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [status, setStatus] = useState('Loading models...');
  const [livenessStage, setLivenessStage] = useState('LOADING_MODELS');
  const [errorCard, setErrorCard] = useState(null);
  const [trustScore, setTrustScore] = useState(0);

  // Pool of possible actions (Blink removed per user request)
  const ACTION_POOL = [
    { id: 'left', label: '↩️ Turn your head LEFT', check: (ratio) => ratio > 1.25 },
    { id: 'right', label: '↪️ Turn your head RIGHT', check: (ratio) => ratio < 0.8 },
    { id: 'smile', label: '😊 Now... SMILE big', check: (_, smileRatio) => smileRatio > 0.38 },
    { id: 'up', label: '⬆️ Look UP at the ceiling', check: (_, __, upRatio) => upRatio < 0.38 },
  ];

  const [sequence, setSequence] = useState([]);
  const [currentStepUI, setCurrentStepUI] = useState(0);
  const [debugStats, setDebugStats] = useState({ smile: 0, up: 0, head: 0 });
  
  const livenessVars = useRef({
    faceEmbedding: null,
    sequence: [],
    currentStep: 0,
    isProcessingStep: false,
    lastStepTime: 0
  });

  const stageRef = useRef('LOADING_MODELS');
  const [dotsConfig, setDotsConfig] = useState(null);

  useEffect(() => {
    stageRef.current = livenessStage;
  }, [livenessStage]);

  // Load Models and INITIALIZE RANDOM SEQUENCE
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Calibrating high-accuracy sensors...');
        
        // Pick 3 random actions
        const shuffled = [...ACTION_POOL].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, 3);
        setSequence(picked);
        livenessVars.current.sequence = picked;

        await Promise.all([
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        console.log('High-accuracy models loaded');
        startVideo();
      } catch (err) {
        console.error('Model load failed:', err);
        setErrorCard("Biometric initialization failed. Please refresh.");
      }
    };
    loadModels();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480, facingMode: 'user' } 
    })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => {
        setErrorCard("Please allow camera access to continue.");
      });
  };

  const handleVideoPlaying = () => {
    setLivenessStage('DETECT');
    setTimeout(() => processLiveness(), 500);
  };

  // --- DYNAMIC Liveness Loop (HIGH ACCURACY SSD MODE) ---
  const processLiveness = async () => {
    const currentStage = stageRef.current;
    if (['SUCCESS', 'SUBMITTING', 'DOTS', 'ERROR', 'EXTRACTING'].includes(currentStage)) return;

    if (videoRef.current && !videoRef.current.paused) {
      // Switched to SsdMobilenetv1 (High Accuracy) for the main loop
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })
      ).withFaceLandmarks();

      if (detection) {
        const landmarks = detection.landmarks;
        const nose = landmarks.getNose()[3];
        const jawline = landmarks.getJawOutline();
        const leftJaw = jawline[0];
        const rightJaw = jawline[16];

        const leftDist = Math.hypot(nose.x - leftJaw.x, nose.y - leftJaw.y);
        const rightDist = Math.hypot(nose.x - rightJaw.x, nose.y - rightJaw.y);
        // Head turn ratio
        const headRatio = Number((leftDist / rightDist).toFixed(2));

        // Smile detection
        const mouth = landmarks.getMouth();
        const mouthWidth = Math.hypot(mouth[0].x - mouth[6].x, mouth[0].y - mouth[6].y);
        const faceWidth = Math.hypot(leftJaw.x - rightJaw.x, leftJaw.y - rightJaw.y);
        const smileRatio = Number((mouthWidth / faceWidth).toFixed(2));

        // LookUp detection
        const noseTop = landmarks.getNose()[0];
        const noseBottom = landmarks.getNose()[6];
        const chin = jawline[8];
        const noseToChin = Math.abs(chin.y - noseBottom.y);
        const noseLength = Math.abs(noseBottom.y - noseTop.y);
        const upRatio = Number((noseLength / noseToChin).toFixed(2));

        // Update Debug Stats
        setDebugStats({ smile: smileRatio, up: upRatio, head: headRatio });

        const currentIdx = livenessVars.current.currentStep;
        const seq = livenessVars.current.sequence;

        if (currentIdx < seq.length) {
          const action = seq[currentIdx];
          setStatus(`Step ${currentIdx + 1}/3: ${action.label}`);
          
          if (action.check(headRatio, smileRatio, upRatio)) {
            if (Date.now() - livenessVars.current.lastStepTime > 1200) {
              livenessVars.current.currentStep += 1;
              livenessVars.current.lastStepTime = Date.now();
              setCurrentStepUI(livenessVars.current.currentStep);
              setStatus('Keep holding... verified!');
            }
          }
        } else {
          setLivenessStage('EXTRACTING');
          setStatus('Identity verified. Capturing signature...');
          
          // Use current descriptor from SSD
          const fullDetection = await faceapi.detectSingleFace(
            videoRef.current, 
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
          ).withFaceLandmarks().withFaceDescriptor();

          if (fullDetection) {
            livenessVars.current.faceEmbedding = Array.from(fullDetection.descriptor);
            setLivenessStage('DOTS');
            setStatus('Perfect! Complete visual test:');
            generateDots();
            return;
          }
        }
      } else {
        setStatus('Looking for face...');
      }
    }

    // SSD is slower, so we loop at ~200ms
    setTimeout(processLiveness, 200);
  };

  const extractEmbedding = async () => {
    if (!videoRef.current) return;

    const fullDetection = await faceapi.detectSingleFace(
      videoRef.current, 
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })
    ).withFaceLandmarks().withFaceDescriptor();

    if (fullDetection) {
      livenessVars.current.faceEmbedding = Array.from(fullDetection.descriptor);
      setLivenessStage('DOTS');
      setStatus('Success! Complete the test:');
      generateDots();
    } else {
      setStatus('Scan unstable. Look at camera...');
      setLivenessStage('DETECT');
      setTimeout(processLiveness, 500);
    }
  };

  const generateDots = () => {
    const dots = Array.from({length: 4}).map(() => ({
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70
    }));
    const targetIndex = Math.floor(Math.random() * 4);
    setStatus('🔴 Click the RED dot');
    setDotsConfig({ dots, targetIndex });
  };

  const handleDotClick = (index) => {
    if (index === dotsConfig.targetIndex) {
      setDotsConfig(null);
      submitVerification();
    } else {
      setErrorCard('Wrong dot clicked. Resetting...');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const submitVerification = async () => {
    setLivenessStage('SUBMITTING');
    setStatus('Finalizing authentication...');
    setErrorCard(null);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/verify-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ embedding: livenessVars.current.faceEmbedding })
      });

      const data = await response.json();

      if (response.ok) {
        setLivenessStage('SUCCESS');
        setStatus('✅ Biometrics verified');
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        let score = 0;
        const interval = setInterval(() => {
          score += 2;
          setTrustScore(score);
          if (score >= 40) {
            clearInterval(interval);
            setTimeout(() => {
              setUser(data.user);
              navigate('/verify-document');
            }, 1000);
          }
        }, 30);
      } else {
        setLivenessStage('ERROR');
        setErrorCard(data.message || 'Verification failed. Please try again.');
        setTimeout(() => window.location.reload(), 3000);
      }
    } catch (err) {
      setLivenessStage('ERROR');
      setErrorCard('Server error. Verification failed.');
      setTimeout(() => window.location.reload(), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} className="fade-in">
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary-accent)', borderRadius: '12px', maxWidth: '600px' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-accent)', fontSize: '1.1rem' }}>Step 1: Adaptive Biometric Challenge</h3>
        <p style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Follow the random actions to prove you are a live human.</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
        <div className="webcam-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
          {/* Live Debug Calibrator */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', zIndex: 10, textAlign: 'left', pointerEvents: 'none' }}>
            <div>Smile: {debugStats.smile} (Target: {">"}0.38)</div>
            <div>Look: {debugStats.up} (Target: {"<"}0.38)</div>
            <div>Head: {debugStats.head} (Target: L{">"}1.25, R{"<"}0.8)</div>
          </div>

          {['LOADING_MODELS', 'DETECT', 'EXTRACTING'].includes(livenessStage) && <div className="progress-ring"></div>}
          <video 
            ref={videoRef} 
            onPlay={handleVideoPlaying} 
            muted 
            autoPlay 
            playsInline
            style={{ transform: 'scaleX(-1)', width: '100%', display: 'block' }}
          />
          {livenessStage === 'DOTS' && dotsConfig && (
            <div className="cognitive-test-overlay">
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {dotsConfig.dots.map((dot, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleDotClick(i)}
                    className="test-dot"
                    style={{
                      position: 'absolute',
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: i === dotsConfig.targetIndex ? '#ef4444' : '#f8fafc',
                      cursor: 'pointer',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: i === dotsConfig.targetIndex ? '0 0 15px rgba(239,68,68,0.8)' : '0 0 8px rgba(255,255,255,0.4)',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <h2 style={{ fontSize: '1.4rem', marginTop: '1.5rem', color: livenessStage === 'ERROR' ? '#ef4444' : 'inherit' }}>{status}</h2>
        {livenessStage === 'SUCCESS' && (
          <div className="slide-up">
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Trust Score Initialized</p>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--success)', margin: 0 }}>{trustScore}</p>
          </div>
        )}
        {errorCard && (
          <div className="status-card error slide-up" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
            {errorCard}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
