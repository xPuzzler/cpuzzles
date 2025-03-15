import React, { useEffect, useRef } from 'react';

const Confetti = ({ active, duration = 3000 }) => {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const animationRef = useRef(null);

  useEffect(() => {
    activeRef.current = active;
    if (active) {
      startConfetti();
      
      // Stop confetti after duration
      const timeout = setTimeout(() => {
        stopConfetti();
      }, duration);
      
      return () => {
        clearTimeout(timeout);
        stopConfetti();
      };
    }
  }, [active, duration]);

  const startConfetti = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Confetti particles
    const particles = [];
    const particleCount = 200;
    const gravity = 0.5;
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
      '#FF5722'
    ];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * 2 + 2
      });
    }
    
    // Animation loop
    const update = () => {
      if (!activeRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.rect(p.x, p.y, p.size, p.size);
        ctx.fill();
        
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += gravity;
        
        // Reset particles that fall out of frame
        if (p.y > canvas.height) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
          p.speedY = Math.random() * 2 + 2;
        }
      });
      
      animationRef.current = requestAnimationFrame(update);
    };
    
    update();
  };

  const stopConfetti = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        display: active ? 'block' : 'none'
      }}
    />
  );
};

export default Confetti;
