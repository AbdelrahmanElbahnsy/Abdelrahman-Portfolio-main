import React, { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * AnimatedBackground — Mixed Color Mesh + Interactive Starfield
 *
 * Features:
 *  1. Two large gradient blobs (deep blue + warm amber) that orbit & blend
 *  2. ~40 stars that glow + scatter on mouse proximity
 *  3. Scroll parallax — stars at different depths move at different rates
 *  4. SVG noise texture overlay
 *  5. Subtle grid with glowing intersections
 */
const AnimatedBackground = () => {
    const containerRef = useRef(null);
    const auroraRef = useRef(null);
    const starsRef = useRef([]);

    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // ─── Generate star data (stable across renders) ────────────────
    const starData = useMemo(() => {
        const count = 30; // Reduced star count for performance
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 1,
                depth: Math.random(),
                baseOpacity: Math.random() * 0.4 + 0.15,
                twinkleDuration: Math.random() * 3 + 2,
            });
        }
        return stars;
    }, []);

    // ─── GSAP: Star twinkle + scroll parallax + grid glow ──────────
    useGSAP(
        () => {
            if (prefersReducedMotion) return;

            // Star twinkle animation
            starsRef.current.forEach((starEl) => {
                if (!starEl) return;
                gsap.to(starEl, {
                    opacity: `random(0.1, 0.7)`,
                    duration: `random(1.5, 4)`,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    repeatRefresh: true,
                    delay: Math.random() * 2,
                });
            });

            // Removed scroll parallax to fix layout thrashing and scroll lag

            // Grid glow dots pulsing
            const glowDots = containerRef.current?.querySelectorAll('.grid-glow-dot');
            if (glowDots?.length) {
                glowDots.forEach((dot, i) => {
                    gsap.to(dot, {
                        opacity: `random(0.3, 0.7)`,
                        scale: `random(1.2, 2)`,
                        duration: `random(1.5, 3)`,
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

    // ─── Grid glow dots (memoized) ─────────────────────────────────
    const glowDots = useMemo(() => {
        const dots = [];
        for (let i = 0; i < 8; i++) {
            const x = Math.round((Math.random() * 80 + 10) / 5) * 5;
            const y = Math.round((Math.random() * 80 + 10) / 5) * 5;
            dots.push(
                <div
                    key={`dot-${i}`}
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


            {/* ─── Blob 1: Warm Copper / Amber (عكس السماوي) ─────────── */}
            <div
                className="bg-blob bg-blob-1"
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: 'clamp(500px, 60vw, 900px)',
                    height: 'clamp(500px, 60vw, 900px)',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(200, 120, 60, 0.35) 0%, rgba(200, 120, 60, 0.1) 45%, transparent 70%)',
                    willChange: 'transform',
                    animation: 'none',
                }}
            />

            {/* ─── Blob 2: Warm Gold (لون ذهبي متناسق) ──────── */}
            <div
                className="bg-blob bg-blob-2"
                style={{
                    position: 'absolute',
                    bottom: '0%',
                    right: '-5%',
                    width: 'clamp(450px, 55vw, 850px)',
                    height: 'clamp(450px, 55vw, 850px)',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(93, 76, 28, 0.18) 0%, rgba(110, 86, 47, 0.12) 45%, transparent 70%)',
                    willChange: 'transform',
                    animation: 'none',
                }}
            />

            {/* ─── Blob 3: Touch of Brown (ميكساية بني صغيرة) ──────── */}
            <div
                className="bg-blob bg-blob-3"
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '40%',
                    width: 'clamp(250px, 35vw, 500px)',
                    height: 'clamp(250px, 35vw, 500px)',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(139, 90, 43, 0.35) 0%, rgba(139, 90, 43, 0.08) 40%, transparent 65%)',
                    willChange: 'transform',
                    animation: 'none',
                }}
            />

            {/* ─── Interactive Star Field ───────────────────────────── */}
            {starData.map((star, i) => (
                <div
                    key={star.id}
                    ref={(el) => (starsRef.current[i] = el)}
                    data-depth={star.depth}
                    data-base-opacity={star.baseOpacity}
                    style={{
                        position: 'absolute',
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        borderRadius: '50%',
                        background: star.depth > 0.6 ? 'var(--clr-accent)' : 'var(--clr-accent-3)',
                        opacity: star.baseOpacity,
                        boxShadow: `0 0 4px var(--clr-accent)`,
                        pointerEvents: 'none',
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)',
                    }}
                />
            ))}



            {/* ─── Grid Overlay ──────────────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(var(--accent-rgb), 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-rgb), 0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
                    pointerEvents: 'none',
                }}
            />

            {/* ─── Grid Glow Dots ────────────────────────────────────── */}
            {glowDots}

            {/* ─── CSS Keyframes ──────────────────────────────────────── */}
            <style>{`
                @keyframes blob-orbit-1 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    25% {
                        transform: translate(100px, 80px) scale(1.15) rotate(5deg);
                    }
                    50% {
                        transform: translate(-50px, 120px) scale(0.9) rotate(-3deg);
                    }
                    75% {
                        transform: translate(80px, -20px) scale(1.2) rotate(8deg);
                    }
                    100% {
                        transform: translate(-30px, 60px) scale(1.05) rotate(-5deg);
                    }
                }

                @keyframes blob-orbit-2 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    25% {
                        transform: translate(-120px, -60px) scale(1.2) rotate(-6deg);
                    }
                    50% {
                        transform: translate(70px, -100px) scale(0.85) rotate(4deg);
                    }
                    75% {
                        transform: translate(-80px, 70px) scale(1.15) rotate(-8deg);
                    }
                    100% {
                        transform: translate(40px, -40px) scale(1) rotate(3deg);
                    }
                @keyframes blob-orbit-3 {
                    0% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                    33% {
                        transform: translate(80px, -50px) scale(1.1) rotate(4deg);
                    }
                    66% {
                        transform: translate(-60px, 90px) scale(0.9) rotate(-3deg);
                    }
                    100% {
                        transform: translate(0, 0) scale(1) rotate(0deg);
                    }
                }

                @media (max-width: 768px) {
                    .bg-blob-1, .bg-blob-2, .bg-blob-3 {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnimatedBackground;
