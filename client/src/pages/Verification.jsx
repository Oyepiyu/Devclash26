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
  
  const livenessVars = useRef({
    leftDone: false,
    rightDone: false,
    blinkCount: 0,
    eyesClosed: false,
    faceEmbedding: null,
  });

  const stageRef = useRef('LOADING_MODELS');
  const [dotsConfig, setDotsConfig] = useState(null);

  useEffect(() => {
    stageRef.current = livenessStage;
  }, [livenessStage]);

  // Load Models - TinyFaceDetector for SPEED, SSD+Recognition only for final embedding
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Loading models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        console.log('All models loaded');
        startVideo();
      } catch (err) {
        console.error('Model load failed:', err);
        setErrorCard("Failed to load models. Please refresh.");
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
    setStatus('Detecting face...');
    setTimeout(() => processLiveness(), 300);
  };

  const getEAR = (eye) => {
    const p = eye;
    const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
    const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
    const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);
    return (v1 + v2) / (2.0 * h);
  };

  // --- FAST liveness loop using TinyFaceDetector ---
  const processLiveness = async () => {
    const currentStage = stageRef.current;
    if (currentStage === 'SUCCESS' || currentStage === 'SUBMITTING' || currentStage === 'DOTS' || currentStage === 'ERROR' || currentStage === 'EXTRACTING') return;

    if (videoRef.current && !videoRef.current.paused) {
      // TinyFaceDetector is ~10x faster than SSD
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })
      ).withFaceLandmarks();

      if (detection) {
        const landmarks = detection.landmarks;
        const nose = landmarks.getNose()[3];
        const jawline = landmarks.getJawOutline();
        const leftJaw = jawline[0];
        const rightJaw = jawline[16];

        const leftDist = Math.hypot(nose.x - leftJaw.x, nose.y - leftJaw.y);
        const rightDist = Math.hypot(nose.x - rightJaw.x, nose.y - rightJaw.y);
        const ratio = leftDist / rightDist;

        if (!livenessVars.current.leftDone) {
          setStatus('↩️ Turn your head LEFT');
          if (ratio > 1.3) {
            livenessVars.current.leftDone = true;
          }
        } else if (!livenessVars.current.rightDone) {
          setStatus('↪️ Turn your head RIGHT');
          if (ratio < 0.77) { // inverse of 1.3
            livenessVars.current.rightDone = true;
          }
        } else if (livenessVars.current.blinkCount < 1) {
          setStatus('👁️ Please BLINK');
          
          const leftEAR = getEAR(landmarks.getLeftEye());
          const rightEAR = getEAR(landmarks.getRightEye());
          const avgEAR = (leftEAR + rightEAR) / 2.0;

          if (avgEAR < 0.24) {
            livenessVars.current.eyesClosed = true;
          } else if (avgEAR > 0.28 && livenessVars.current.eyesClosed) {
            livenessVars.current.eyesClosed = false;
            livenessVars.current.blinkCount += 1;
          }
        } else {
          // All liveness passed → extract embedding (slower, one-time)
          setLivenessStage('EXTRACTING');
          setStatus('Extracting identity...');
          await extractEmbedding();
          return;
        }
      } else {
        setStatus('Hold still... detecting face');
      }
    }

    // Fast loop ~100ms
    setTimeout(processLiveness, 100);
  };

  // --- ACCURATE embedding extraction using SsdMobilenetv1 (called only ONCE) ---
  const extractEmbedding = async () => {
    if (!videoRef.current) return;

    // Use SSD (more accurate) for the final identity extraction
    const fullDetection = await faceapi.detectSingleFace(
      videoRef.current, 
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })
    ).withFaceLandmarks().withFaceDescriptor();

    if (fullDetection) {
      livenessVars.current.faceEmbedding = Array.from(fullDetection.descriptor);
      setLivenessStage('DOTS');
      setStatus('Almost done...');
      generateDots();
    } else {
      // Fallback: try with TinyFaceDetector if SSD fails
      const fallback = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 })
      ).withFaceLandmarks().withFaceDescriptor();

      if (fallback) {
        livenessVars.current.faceEmbedding = Array.from(fallback.descriptor);
        setLivenessStage('DOTS');
        setStatus('Almost done...');
        generateDots();
      } else {
        setStatus('Face lost. Look at camera...');
        setLivenessStage('DETECT');
        setTimeout(processLiveness, 500);
      }
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
    setStatus('Verifying identity...');
    setErrorCard(null);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://happily-launder-spearman.ngrok-free.dev/api/verify-face', {
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
        setStatus('✅ Human verified');
        
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
      
      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary-accent)', borderRadius: '8px', maxWidth: '500px' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-accent)' }}>"To ensure a trusted community, we verify all users as real humans."</h3>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
        
        <div className="webcam-container">
          {['LOADING_MODELS', 'DETECT', 'EXTRACTING'].includes(livenessStage) && <div className="progress-ring"></div>}
          
          <video 
            ref={videoRef} 
            onPlay={handleVideoPlaying} 
            muted 
            autoPlay 
            playsInline
            style={{ transform: 'scaleX(-1)' }}
          />

          {livenessStage === 'DOTS' && dotsConfig && (
            <div className="cognitive-test-overlay">
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {dotsConfig.dots.map((dot, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleDotClick(i)}
                    style={{
                      position: 'absolute',
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: i === dotsConfig.targetIndex ? '#ef4444' : '#f8fafc',
                      cursor: 'pointer',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: i === dotsConfig.targetIndex ? '0 0 12px rgba(239,68,68,0.6)' : '0 0 8px rgba(255,255,255,0.3)'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{status}</h2>
        
        {livenessStage === 'SUCCESS' && (
          <div className="slide-up">
            <p style={{ color: 'var(--text-muted)' }}>Trust Score Updated</p>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>{trustScore}</p>
          </div>
        )}

        {errorCard && (
          <div className="status-card error slide-up" style={{ marginTop: '2rem' }}>
            {errorCard}
          </div>
        )}

      </div>
    </div>
  );
};

export default Verification;
