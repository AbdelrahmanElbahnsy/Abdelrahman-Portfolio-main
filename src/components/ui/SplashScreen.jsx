import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

/**
 * SplashScreen that stays visible until BOTH:
 *  1. The intro animation finishes
 *  2. The `contentReady` prop becomes true (page chunk loaded)
 *
 * Only then does it play the exit animation and call `onComplete`.
 */
const SplashScreen = ({ onComplete, contentReady = false }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const lineLeftRef = useRef(null);
  const lineRightRef = useRef(null);
  const taglineRef = useRef(null);
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // Track internal state
  const introCompleteRef = useRef(false);
  const exitPlayedRef = useRef(false);

  // Play exit animation when both intro is done and content is ready
  const tryExit = useRef(() => {});

  useEffect(() => {
    if (!containerRef.current) return;

    // Build the exit timeline (paused — played on demand)
    const exitTl = gsap.timeline({
      paused: true,
      onComplete: () => {
        setIsVisible(false);
        onComplete?.();
      },
    });

    exitTl
      .to([taglineRef.current, progressRef.current], {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in',
      })
      .to(
        [lineLeftRef.current, lineRightRef.current],
        {
          scaleX: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.in',
        },
        '-=0.2',
      )
      .to(
        logoRef.current,
        {
          opacity: 0,
          scale: 1.1,
          duration: 0.4,
          ease: 'power3.in',
        },
        '-=0.3',
      )
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.7,
        ease: 'power4.inOut',
      });

    // Define the exit trigger
    tryExit.current = () => {
      if (introCompleteRef.current && !exitPlayedRef.current) {
        exitPlayedRef.current = true;
        exitTl.play();
      }
    };

    // Build intro timeline
    const introTl = gsap.timeline({
      onComplete: () => {
        introCompleteRef.current = true;
        tryExit.current();
      },
    });

    introTl
      .set(
        [logoRef.current, lineLeftRef.current, lineRightRef.current, taglineRef.current, progressRef.current],
        { opacity: 0 },
      )

      // Decorative lines expand outward
      .to(lineLeftRef.current, {
        opacity: 1,
        scaleX: 1,
        duration: 0.6,
        ease: 'power4.out',
      })
      .to(
        lineRightRef.current,
        { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power4.out' },
        '<',
      )

      // Logo fades up and scales
      .fromTo(
        logoRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' },
        '-=0.3',
      )

      // Logo text color flash
      .to(logoRef.current.querySelector('.splash-accent'), {
        color: '#5ffbf1',
        duration: 0.3,
        ease: 'power2.in',
      })
      .to(logoRef.current.querySelector('.splash-accent'), {
        color: '#00d2ff',
        duration: 0.4,
        ease: 'power2.out',
      })

      // Tagline fades in
      .fromTo(
        taglineRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        '-=0.3',
      )

      // Progress bar fills
      .to(progressRef.current, { opacity: 1, duration: 0.3 }, '-=0.2')
      .fromTo(
        progressBarRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, ease: 'power2.inOut' },
      );

    return () => {
      introTl.kill();
      exitTl.kill();
    };
  }, [onComplete]);

  // When contentReady flips to true, attempt exit
  useEffect(() => {
    if (contentReady) {
      tryExit.current();
    }
  }, [contentReady]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c1220',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,210,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,210,255,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          ref={lineLeftRef}
          style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(to left, #00d2ff, transparent)',
            transformOrigin: 'right center',
            transform: 'scaleX(0)',
          }}
        />

        <div ref={logoRef} style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '-2px',
              color: '#fff',
              margin: 0,
              lineHeight: 1,
            }}
          >
            <span className="splash-accent" style={{ color: '#00d2ff' }}>&lt;</span>
            AE
            <span className="splash-accent" style={{ color: '#00d2ff' }}>/</span>
            B
            <span className="splash-accent" style={{ color: '#00d2ff' }}>&gt;</span>
          </h1>
        </div>

        <div
          ref={lineRightRef}
          style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(to right, #00d2ff, transparent)',
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      <p
        ref={taglineRef}
        style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: '0.75rem',
          color: '#94a3b8',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: '16px',
        }}
      >
        Loading systems...
      </p>

      <div
        ref={progressRef}
        style={{
          marginTop: '24px',
          width: '120px',
          height: '2px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #00d2ff, #5ffbf1)',
            borderRadius: '2px',
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
