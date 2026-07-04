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
        const count = isTouchDevice ? 20 : 40;
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2.5 + 1,
                depth: Math.random(), // 0 = far (slow), 1 = near (fast)
                baseOpacity: Math.random() * 0.4 + 0.15,
                twinkleDuration: Math.random() * 3 + 2,
            });
        }
        return stars;
    }, [isTouchDevice]);

    // ─── Mouse proximity effect on stars ───────────────────────────
    useEffect(() => {
        if (prefersReducedMotion || isTouchDevice) return;

        const handleMouseMove = (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const radius = 150; // Influence radius in px

            starsRef.current.forEach((starEl) => {
                if (!starEl) return;
                const rect = starEl.getBoundingClientRect();
                const starCX = rect.left + rect.width / 2;
                const starCY = rect.top + rect.height / 2;
                const dx = mouseX - starCX;
                const dy = mouseY - starCY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                    const intensity = 1 - dist / radius;
                    // Push star away from cursor
                    const pushX = -(dx / dist) * intensity * 20;
                    const pushY = -(dy / dist) * intensity * 20;

                    gsap.to(starEl, {
                        x: pushX,
                        y: pushY,
                        scale: 1 + intensity * 1.5,
                        opacity: Math.min(1, parseFloat(starEl.dataset.baseOpacity) + intensity * 0.6),
                        boxShadow: `0 0 ${6 + intensity * 12}px var(--clr-accent)`,
                        duration: 0.3,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                } else {
                    gsap.to(starEl, {
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: parseFloat(starEl.dataset.baseOpacity),
                        boxShadow: `0 0 4px var(--clr-accent)`,
                        duration: 0.8,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [prefersReducedMotion, isTouchDevice]);

    // ─── Mouse aurora tracking ─────────────────────────────────────
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

            // Scroll parallax for stars
            starsRef.current.forEach((starEl) => {
                if (!starEl) return;
                const depth = parseFloat(starEl.dataset.depth || '0.5');
                const moveAmount = (depth - 0.5) * 200; // -100 to +100

                gsap.to(starEl, {
                    yPercent: moveAmount,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: document.body,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.5,
                    },
                });
            });

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
                    filter: 'blur(60px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion
                        ? 'none'
                        : 'blob-orbit-1 14s ease-in-out infinite alternate',
                }}
            />

            {/* ─── Blob 2: Deep Sky Blue (لون السماوي الغامق) ──────── */}
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
                        'radial-gradient(circle, rgba(15, 75, 150, 0.45) 0%, rgba(15, 75, 150, 0.1) 45%, transparent 70%)',
                    filter: 'blur(70px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion
                        ? 'none'
                        : 'blob-orbit-2 18s ease-in-out infinite alternate',
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
                    filter: 'blur(60px)',
                    willChange: 'transform',
                    animation: prefersReducedMotion
                        ? 'none'
                        : 'blob-orbit-3 20s ease-in-out infinite alternate',
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

            {/* ─── Mouse Aurora Glow ────────────────────────────────── */}
            {!isTouchDevice && (
                <div
                    ref={auroraRef}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, rgba(var(--accent-rgb), 0.03) 40%, transparent 65%)',
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
                        filter: blur(80px) !important;
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnimatedBackground;
