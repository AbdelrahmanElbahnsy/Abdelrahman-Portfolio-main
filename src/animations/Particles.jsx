import React, { useEffect, useRef } from 'react';

const Particles = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const moveX = (Math.random() - 0.5) * 50;
      const moveY = (Math.random() - 0.5) * 50;

      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.background = '#c8a26e';
      particle.style.borderRadius = '50%';
      particle.style.opacity = '0.3';
      particle.style.animation = `float-particle ${duration}s ease-in-out infinite alternate`;
      particle.style.setProperty('--x', `${moveX}px`);
      particle.style.setProperty('--y', `${moveY}px`);

      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <style>{`
        @keyframes float-particle {
          0% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          100% {
            transform: translate(var(--x), var(--y));
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default Particles;