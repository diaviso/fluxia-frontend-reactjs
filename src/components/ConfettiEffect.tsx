import React, { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger, onComplete }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#98fb98', '#c0c0c0', '#ffffff', '#fbbf24', '#60a5fa'];
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      
      setConfetti(pieces);

      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (confetti.length === 0) return null;

  return (
    <div style={styles.container}>
      {confetti.map((piece) => (
        <div
          key={piece.id}
          style={{
            ...styles.confetti,
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    top: '-10px',
    borderRadius: '2px',
    animation: 'confettiFall 3s linear forwards',
    opacity: 0.8,
  },
};

// Add keyframes to global styles
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    // Keyframe might already exist
  }
}
