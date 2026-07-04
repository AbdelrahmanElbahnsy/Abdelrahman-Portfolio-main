import React, { useEffect, useRef } from 'react';
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
import AnimatedBackground from '../components/ui/AnimatedBackground';
import WaveDivider from '../components/ui/WaveDivider';
import { useScrollVelocityBlur } from '../hooks/useScrollVelocityBlur';
import { trackVisit } from '../services/analytics';

function Home() {
  const hasTrackedVisitRef = useRef(false);
  const mainRef = useRef(null);

  // Cinematic scroll blur on fast scroll
  // Disabled: CSS filter: blur() breaks position: fixed, causing pinned sections to disappear
  // useScrollVelocityBlur(mainRef, { maxBlur: 2, threshold: 1000 });

  useEffect(() => {
    if (!hasTrackedVisitRef.current) {
      hasTrackedVisitRef.current = true;
      console.log('[analytics] Home useEffect triggered. Attempting single visit track.');
      trackVisit(window.location.pathname || '/');
    }
  }, []);

  return (
    <div className="page-wrapper min-h-screen flex flex-col relative">
      {/* Global Animated Background */}
      <AnimatedBackground />

      <Navbar />
      
      <main ref={mainRef} className="flex-grow">
        <div className="page-container">
          <Hero />
          <WaveDivider position="bottom" />
          <About />
          <WaveDivider position="bottom" flip />
          <Toolchain />
          <Skills />
          <WaveDivider position="bottom" />
          <Projects />
          <Certifications />
          <WaveDivider position="bottom" flip />
          <Journey />
          <Contact />
        </div>
      </main>
      
      <Footer />
      <AirplaneSocial />
      <ScrollToTop />
    </div>
  );
}

export default Home;
