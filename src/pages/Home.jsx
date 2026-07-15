import React, { useEffect, useRef, lazy, Suspense } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import ScrollToTop from '../components/ui/ScrollToTop';
import AirplaneSocial from '../components/ui/AirplaneSocial';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import WaveDivider from '../components/ui/WaveDivider';

const About = lazy(() => import('../components/sections/About'));
const Skills = lazy(() => import('../components/sections/Skills'));
const Toolchain = lazy(() => import('../components/sections/Toolchain'));
const Projects = lazy(() => import('../components/sections/Projects'));
const Journey = lazy(() => import('../components/sections/Journey'));
const Certifications = lazy(() => import('../components/sections/Certifications'));
const Contact = lazy(() => import('../components/sections/Contact'));
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
          
          <Suspense fallback={<div className="min-h-[50vh]"></div>}>
            <WaveDivider position="bottom" />
            <About />
            <WaveDivider position="bottom" flip />
            <Toolchain />
            <Skills />
            <WaveDivider position="bottom" />
          </Suspense>
        </div>

        <Suspense fallback={<div className="min-h-[50vh]"></div>}>
          <Projects />
        </Suspense>

        <Suspense fallback={<div className="min-h-[50vh]"></div>}>
          <div className="page-container">
            <Certifications />
            <WaveDivider position="bottom" flip />
            <Journey />
            <Contact />
          </div>
        </Suspense>
      </main>
      
      <Footer />
      <AirplaneSocial />
      <ScrollToTop />
    </div>
  );
}

export default Home;
