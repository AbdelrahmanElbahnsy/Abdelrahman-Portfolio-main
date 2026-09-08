import React, { useEffect, useRef, lazy, Suspense, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAppearance } from '../context/AppearanceContext';
import { useVisitorPreferences } from '../context/VisitorPreferencesContext';
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

const LazySection = ({ id, minHeight = '50vh', children }) => {
  const [hasMounted, setHasMounted] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      return hash === id || (hash === 'home' && id === 'hero');
    }
    return false;
  });
  
  const observerRef = useRef(null);

  useEffect(() => {
    if (hasMounted) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMounted]);

  return (
    <div 
      ref={observerRef} 
      id={hasMounted ? undefined : id} 
      style={{ minHeight: hasMounted ? undefined : minHeight }}
    >
      {hasMounted ? (
        <Suspense fallback={<div style={{ minHeight }}></div>}>
          {children}
        </Suspense>
      ) : null}
    </div>
  );
};

function Home({ splashDone = true }) {
  const { language } = useLanguage();
  const { activeSettings } = useAppearance();
  const { effectiveTheme } = useVisitorPreferences();
  const hasTrackedVisitRef = useRef(false);
  const mainRef = useRef(null);

  // Cinematic scroll blur on fast scroll
  // Disabled: CSS filter: blur() breaks position: fixed, causing pinned sections to disappear
  // useScrollVelocityBlur(mainRef, { maxBlur: 2, threshold: 1000 });

  useEffect(() => {
    if (!hasTrackedVisitRef.current) {
      hasTrackedVisitRef.current = true;
      console.log('[analytics] Home useEffect triggered. Attempting single visit track.');
      import('../services/analytics').then(({ trackVisit }) => {
        trackVisit(window.location.pathname || '/');
      }).catch(err => console.error('Failed to load analytics', err));
    }
  }, []);

  const themeStyle = activeSettings ? {
    '--portfolio-primary': activeSettings.primaryColor,
    '--portfolio-background': activeSettings.backgroundColor,
    '--portfolio-surface': activeSettings.surfaceColor,
    '--portfolio-text': activeSettings.textColor,
  } : {};

  return (
    <div 
      className="page-wrapper min-h-screen flex flex-col relative portfolio-theme-root bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors duration-500" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      data-portfolio-theme={effectiveTheme}
      style={themeStyle}
    >
      {/* Global Animated Background */}
      <AnimatedBackground />

      <Navbar splashDone={splashDone} />
      
      <main ref={mainRef} className="flex-grow">
        <div className="page-container">
          <Hero splashDone={splashDone} />
          
          <LazySection id="about">
            <WaveDivider position="bottom" />
            <About />
            <WaveDivider position="bottom" flip />
          </LazySection>

          <LazySection id="toolchain">
            <Toolchain />
          </LazySection>

          <LazySection id="skills">
            <Skills />
            <WaveDivider position="bottom" />
          </LazySection>
        </div>

        <LazySection id="projects">
          <Projects />
        </LazySection>

        <div className="page-container">
          <LazySection id="certifications">
            <Certifications />
            <WaveDivider position="bottom" flip />
          </LazySection>

          <LazySection id="journey">
            <Journey />
          </LazySection>

          <LazySection id="contact">
            <Contact />
          </LazySection>
        </div>
      </main>
      
      <Footer />
      <AirplaneSocial />
      <ScrollToTop />
    </div>
  );
}

export default Home;
