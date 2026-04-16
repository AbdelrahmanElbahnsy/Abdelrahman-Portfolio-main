import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Skills from '../components/sections/Skills';
import Toolchain from '../components/sections/Toolchain';
import Projects from '../components/sections/Projects';
import Journey from '../components/sections/Journey';
import Certifications from '../components/sections/Certifications';
import Contact from '../components/sections/Contact';
import ScrollToTop from '../components/ui/ScrollToTop';
import AirplaneSocial from '../components/ui/AirplaneSocial';
import { trackVisit } from '../services/analytics';

function Home() {
  const [particles, setParticles] = useState([]);
  const hasTrackedVisitRef = useRef(false);

  useEffect(() => {
    if (!hasTrackedVisitRef.current) {
      hasTrackedVisitRef.current = true;
      console.log('[analytics] Home useEffect triggered. Attempting single visit track.');
      trackVisit(window.location.pathname || '/');
    }

    // 1. Glow sphere mouse movement
    const glowSphere = document.querySelector('.glow-sphere');
    const handleMouseMove = (e) => {
      if (glowSphere && window.innerWidth > 768) {
        requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 40;
          const y = (e.clientY / window.innerHeight - 0.5) * 40;
          glowSphere.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // 2. Particle generation (Streamlined for performance)
    const particleCount = 12;
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
        newParticles.push({
            id: i,
            size: Math.random() * 3 + 2,
            posX: Math.random() * 100,
            posY: Math.random() * 100,
            duration: Math.random() * 12 + 8,
            moveX: (Math.random() - 0.5) * 40,
            moveY: (Math.random() - 0.5) * 40,
        });
    }
    setParticles(newParticles);

    // 3. Optimized Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                revealOnScroll.unobserve(entry.target); // Performance: stop observing once revealed
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.animate-up, .card, .section-header');
    animateElements.forEach(el => revealOnScroll.observe(el));

    // Cleanup
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        revealOnScroll.disconnect();
    };
  }, []);

  return (
    <div className="page-wrapper min-h-screen flex flex-col relative">
      {/* Global Background Effects (Literal Translation from index.html) */}
      <div className="hero-background fixed inset-0 z-[-1] pointer-events-none">
        <div className="grid-overlay pointer-events-none" />
        <div className="glow-sphere pointer-events-none" />
        <div id="particles" className="particles absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle absolute rounded-full opacity-30 bg-[var(--clr-accent)]"
              style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  left: `${p.posX}%`,
                  top: `${p.posY}%`,
                  '--x': `${p.moveX}px`,
                  '--y': `${p.moveY}px`,
                  '--duration': `${p.duration}s`,
                  animation: 'float-particle var(--duration) ease-in-out infinite alternate',
              }}
            />
          ))}
        </div>
      </div>

      <Navbar />
      
      <main className="flex-grow">
        <div className="page-container">
          <Hero />
          <About />
          <Toolchain />
          <Skills />
          <Projects />
          <Certifications />
          <Journey />
          <Contact />
        </div>
      </main>
      
      <Footer />
      <AirplaneSocial />
      <ScrollToTop />
      
      {/* Dynamic styles for animations mapping to CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-particle {
          0% { transform: translate(0, 0); opacity: 0.2; }
          100% { transform: translate(var(--x), var(--y)); opacity: 0.5; }
        }
      ` }} />
    </div>
  );
}

export default Home;
