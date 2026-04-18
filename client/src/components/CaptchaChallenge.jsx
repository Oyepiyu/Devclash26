import React, { useState, useMemo } from 'react';
import { Car, TreePine, Home, Star, Heart, Bike, Cloud, Mountain, Flower2 } from 'lucide-react';

const CATEGORIES = [
  { name: 'Cars', icon: Car, color: '#3b82f6' },
  { name: 'Trees', icon: TreePine, color: '#22c55e' },
  { name: 'Houses', icon: Home, color: '#f59e0b' },
  { name: 'Stars', icon: Star, color: '#eab308' },
  { name: 'Hearts', icon: Heart, color: '#ef4444' },
  { name: 'Bicycles', icon: Bike, color: '#8b5cf6' },
  { name: 'Clouds', icon: Cloud, color: '#06b6d4' },
  { name: 'Mountains', icon: Mountain, color: '#64748b' },
  { name: 'Flowers', icon: Flower2, color: '#ec4899' },
];

// Gradient backgrounds for each cell to make it look like real images
const BG_VARIANTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #232526 0%, #414345 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'linear-gradient(135deg, #0d1b2a 0%, #1b2838 100%)',
];

const CaptchaChallenge = ({ onSuccess, onCancel }) => {
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  // Generate the puzzle once
  const puzzle = useMemo(() => {
    // Pick a target category
    const targetIdx = Math.floor(Math.random() * CATEGORIES.length);
    const target = CATEGORIES[targetIdx];

    // Build 9 cells: 3-4 are the target, rest are random others
    const targetCount = 3 + Math.floor(Math.random() * 2); // 3 or 4
    const cells = [];

    // Add target cells
    for (let i = 0; i < targetCount; i++) {
      cells.push({ category: target, isTarget: true });
    }

    // Fill remaining with random non-target categories
    const others = CATEGORIES.filter((_, i) => i !== targetIdx);
    for (let i = targetCount; i < 9; i++) {
      const rand = others[Math.floor(Math.random() * others.length)];
      cells.push({ category: rand, isTarget: false });
    }

    // Shuffle using Fisher-Yates
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // Assign random backgrounds
    const shuffledBGs = [...BG_VARIANTS].sort(() => Math.random() - 0.5);
    cells.forEach((cell, i) => {
      cell.bg = shuffledBGs[i % shuffledBGs.length];
    });

    return { target, cells, targetCount };
  }, []);

  const toggleCell = (index) => {
    if (verified) return;
    setError('');
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleVerify = () => {
    // Check: all selected must be targets, and all targets must be selected
    const targetIndices = puzzle.cells
      .map((cell, i) => cell.isTarget ? i : -1)
      .filter(i => i !== -1);

    const selectedArr = Array.from(selected);
    const allTargetsSelected = targetIndices.every(i => selected.has(i));
    const noFalsePositives = selectedArr.every(i => puzzle.cells[i].isTarget);

    if (allTargetsSelected && noFalsePositives) {
      setVerified(true);
      setError('');
      setTimeout(() => onSuccess(), 600);
    } else {
      setError('Incorrect selection. Try again.');
      setSelected(new Set());
    }
  };

  const IconComponent = puzzle.target.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        width: '380px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--primary-accent)',
          padding: '16px 20px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <IconComponent size={24} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              Select all images with
            </span>
          </div>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {puzzle.target.name}
          </span>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '3px',
          padding: '3px',
          background: '#0f0f1a',
        }}>
          {puzzle.cells.map((cell, i) => {
            const CellIcon = cell.category.icon;
            const isSelected = selected.has(i);
            return (
              <div
                key={i}
                onClick={() => toggleCell(i)}
                style={{
                  aspectRatio: '1',
                  background: cell.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  border: isSelected ? `3px solid var(--primary-accent)` : '3px solid transparent',
                  borderRadius: '4px',
                  transform: isSelected ? 'scale(0.92)' : 'scale(1)',
                }}
              >
                <CellIcon 
                  size={40} 
                  color={cell.category.color} 
                  strokeWidth={1.5}
                  style={{ 
                    filter: `drop-shadow(0 2px 8px ${cell.category.color}40)`,
                    opacity: 0.9 
                  }}
                />
                {/* Checkmark overlay */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}>
                    ✓
                  </div>
                )}
                {verified && cell.isTarget && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(34, 197, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}>
                    <span style={{ fontSize: '28px' }}>✅</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px' }}>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 8px 0', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onCancel}
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleVerify}
              disabled={selected.size === 0 || verified}
              style={{ 
                flex: 2,
                background: verified ? 'var(--success)' : 'var(--primary-accent)',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'background 0.2s',
              }}
            >
              {verified ? '✅ Verified!' : 'Verify'}
            </button>
          </div>

          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.7rem', 
            textAlign: 'center', 
            marginTop: '10px',
            opacity: 0.7,
          }}>
            🔒 TrustLink Human Verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptchaChallenge;
