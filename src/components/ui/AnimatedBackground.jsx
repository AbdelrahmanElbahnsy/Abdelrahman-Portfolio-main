import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * AnimatedBackground — Ambient Mesh Gradient
 *
 * A living, breathing background with:
 *  1. 4 large color blobs that orbit, morph and pulse (GSAP + CSS keyframes)
 *  2. Mouse-reactive aurora glow with GSAP quickTo inertia
 *  3. Scroll-linked hue shift via ScrollTrigger
 *  4. SVG noise texture overlay for premium grain
 *  5. Grid with glowing intersection dots
 */
const AnimatedBackground = () => {
    const containerRef = useRef(null);
    const auroraRef = useRef(null);
    const hueLayerRef = useRef(null);

    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // ─── Mouse Aurora ──────────────────────────────────────────────
    useEffect(() => {
        if (prefersReducedMotion || isTouchDevice || !auroraRef.current) return;

        const xTo = gsap.quickTo(auroraRef.current, 'x', { duration: 0.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(auroraRef.current, 'y', { duration: 0.6, ease: 'power3.out' });

        const handleMouseMove = (e) => {
            xTo(e.clientX - window.innerWidth / 2);
            yTo(e.clientY - window.innerHeight / 2);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [prefersReducedMotion, isTouchDevice]);

    // ─── Scroll Hue Shift ──────────────────────────────────────────
    useGSAP(
        () => {
            if (prefersReducedMotion || !hueLayerRef.current) return;

            gsap.fromTo(
                hueLayerRef.current,
                {
                    background:
                        'linear-gradient(180deg, rgba(12,18,32,0) 0%, rgba(0,210,255,0.04) 50%, rgba(12,18,32,0) 100%)',
                },
                {
                    background:
                        'linear-gradient(180deg, rgba(12,18,32,0) 0%, rgba(0,210,255,0.12) 50%, rgba(12,18,32,0) 100%)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: document.body,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1,
                    },
                },
            );

            // Grid glow dots pulsing
            const glowDots = containerRef.current?.querySelectorAll('.grid-glow-dot');
            if (glowDots?.length) {
                glowDots.forEach((dot, i) => {
                    gsap.to(dot, {
                        opacity: `random(0.4, 0.8)`,
                        scale: `random(1.2, 2)`,
                        duration: `random(1.5, 3.5)`,
                        delay: i * 0.3,
                        ease: 'sine.inOut',
                        repeat: -1,
                        yoyo: true,
                        repeatRefresh: true,
                    });
                });
            }
        },
        { scope: containerRef, dependencies: [] },
    );

    // ─── Grid Glow Dots ────────────────────────────────────────────
    const glowDots = useMemo(() => {
        const dots = [];
        for (let i = 0; i < 10; i++) {
            const x = Math.round((Math.random() * 80 + 10) / 5) * 5;
            const y = Math.round((Math.random() * 80 + 10) / 5) * 5;
            dots.push(
                <div
                    key={i}
                    className="grid-glow-dot"
                    style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        background: 'var(--clr-accent)',
                        opacity: 0.08,
                        boxShadow: '0 0 6px var(--clr-accent), 0 0 15px var(--clr-accent)',
                        pointerEvents: 'none',
                        willChange: 'opacity, transform',
                    }}
                />,
            );
        }
        return dots;
    }, []);

    return (
        <div
            ref={containerRef}
            className="animated-bg"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            {/* ─── SVG Noise Filter ──────────────────────────────────── */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                <defs>
                    <filter id="noise-filter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                </defs>
            </svg>

            {/* ─── Noise Overlay ─────────────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    filter: 'url(#noise-filter)',
                    opacity: 0.025,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none',
                }}
            />

            {/* ─── Animated Gradient Blobs ───────────────────────────── */}
            {/* Each blob uses CSS @keyframes for reliable, always-running animation */}
            <div
                className="bg-blob bg-blob-1"
                style={{
                    position: 'absolute',
                    top: '-5%',
                    left: '-5%',
                    width: 'clamp(500px, 60vw, 900px)',
                    height: 'clamp(500px, 60vw, 900px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(10,37,64,0.7) 0%, rgba(10,37,64,0.15) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion ? 'none' : 'blob-drift-1 12s ease-in-out infinite alternate',
                }}
            />

            <div
                className="bg-blob bg-blob-2"
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '-10%',
                    width: 'clamp(450px, 55vw, 800px)',
                    height: 'clamp(450px, 55vw, 800px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(13,59,77,0.65) 0%, rgba(13,59,77,0.12) 50%, transparent 70%)',
                    filter: 'blur(70px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion ? 'none' : 'blob-drift-2 15s ease-in-out infinite alternate',
                }}
            />

            <div
                className="bg-blob bg-blob-3"
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '20%',
                    width: 'clamp(400px, 50vw, 750px)',
                    height: 'clamp(400px, 50vw, 750px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(26,26,62,0.6) 0%, rgba(26,26,62,0.12) 50%, transparent 70%)',
                    filter: 'blur(65px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion ? 'none' : 'blob-drift-3 18s ease-in-out infinite alternate',
                }}
            />

            <div
                className="bg-blob bg-blob-4"
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    width: 'clamp(300px, 35vw, 550px)',
                    height: 'clamp(300px, 35vw, 550px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,210,255,0.08) 0%, rgba(0,210,255,0.03) 40%, transparent 70%)',
                    filter: 'blur(50px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion ? 'none' : 'blob-drift-4 10s ease-in-out infinite alternate',
                }}
            />

            {/* ─── Mouse Aurora ──────────────────────────────────────── */}
            {!isTouchDevice && (
                <div
                    ref={auroraRef}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '450px',
                        height: '450px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(0,210,255,0.12) 0%, rgba(0,210,255,0.04) 40%, transparent 65%)',
                        filter: 'blur(30px)',
                        willChange: 'transform',
                        transform: 'translate(-50%, -50%) translateZ(0)',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* ─── Grid Overlay ──────────────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(0,210,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
                    pointerEvents: 'none',
                }}
            />

            {/* ─── Grid Glow Dots ────────────────────────────────────── */}
            {glowDots}

            {/* ─── Scroll Hue Shift Layer ────────────────────────────── */}
            <div ref={hueLayerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

            {/* ─── CSS Keyframes for blob animation ──────────────────── */}
            <style>{`
                @keyframes blob-drift-1 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    33% {
                        transform: translate(80px, 60px) scale(1.15) rotate(5deg);
                    }
                    66% {
                        transform: translate(-40px, 100px) scale(0.9) rotate(-3deg);
                    }
                    100% {
                        transform: translate(60px, -30px) scale(1.1) rotate(8deg);
                    }
                }

                @keyframes blob-drift-2 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    33% {
                        transform: translate(-100px, -50px) scale(1.2) rotate(-6deg);
                    }
                    66% {
                        transform: translate(50px, -80px) scale(0.85) rotate(4deg);
                    }
                    100% {
                        transform: translate(-70px, 60px) scale(1.1) rotate(-8deg);
                    }
                }

                @keyframes blob-drift-3 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    33% {
                        transform: translate(60px, -70px) scale(1.1) rotate(4deg);
                    }
                    66% {
                        transform: translate(-80px, -40px) scale(1.2) rotate(-5deg);
                    }
                    100% {
                        transform: translate(40px, 80px) scale(0.9) rotate(7deg);
                    }
                }

                @keyframes blob-drift-4 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    50% {
                        transform: translate(-60px, 40px) scale(1.3) rotate(-4deg);
                    }
                    100% {
                        transform: translate(50px, -50px) scale(0.95) rotate(6deg);
                    }
                }

                @media (max-width: 768px) {
                    .bg-blob-3, .bg-blob-4 {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnimatedBackground;
