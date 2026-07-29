import React, { useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import CloudArchitectureSVG from './CloudArchitectureSVG';

/**
 * AnimatedBackground — Technical Cloud Theme
 */
const AnimatedBackground = () => {
    const containerRef = useRef(null);

    const particlesInit = async (engine) => {
        await loadFull(engine);
    };

    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Very Slow Parallax ──────────────────────────────────────────
    useGSAP(
        () => {
            if (prefersReducedMotion) return;
            
            // Ensure ScrollTrigger is registered
            gsap.registerPlugin(ScrollTrigger);

            // Move the inner wrapper slightly downwards as the user scrolls
            // This creates depth without causing layout thrashing since it's a dedicated layer
            gsap.to(containerRef.current, {
                y: '10%',
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.5 // Smooth scrubbing
                }
            });
        },
        { scope: containerRef, dependencies: [] }
    );

    // ─── Particles & Network Lines Configuration ─────────────────────
    const particlesOptions = useMemo(() => ({
        fullScreen: { enable: false, zIndex: -1 },
        fpsLimit: 60,
        particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: ["#c8a26e", "#38bdf8", "#818cf8"] }, // Brown/Gold, Cyan, Indigo
            links: {
                enable: true,
                color: "#c8a26e", // Accent network lines
                distance: 150,
                opacity: 0.25,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.6,
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "bounce" }
            },
            size: { value: { min: 1, max: 3 } },
            opacity: {
                value: { min: 0.1, max: 0.5 },
                animation: { enable: true, speed: 1, minimumValue: 0.1 }
            }
        },
        interactivity: {
            events: {
                onHover: { enable: true, mode: "grab" }, // Network grabs onto mouse
                resize: true
            },
            modes: { grab: { distance: 200, links: { opacity: 0.6, color: "#38bdf8" } } }
        },
        detectRetina: true
    }), []);

    return (
        <div
            className="animated-bg"
            style={{
                position: 'fixed',
                top: '-5%',
                left: '-5%',
                width: '110vw',
                height: '115vh', // Extended to allow parallax movement without showing edges
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
                background: 'var(--clr-bg)' // Inherit the rich dark blue
            }}
        >
            <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', willChange: 'transform' }}>
                
                {/* ─── Orange Glow ──────── */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-10%', left: '-10%',
                        width: '50vw', height: '50vw',
                        minWidth: '500px', minHeight: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 60%)',
                        mixBlendMode: 'screen'
                    }}
                />

                {/* ─── Blue Glow ──────── */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-10%', right: '-10%',
                        width: '60vw', height: '60vw',
                        minWidth: '600px', minHeight: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
                        mixBlendMode: 'screen'
                    }}
                />

                {/* ─── Technical Grid ──────── */}
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        backgroundImage:
                            'linear-gradient(rgba(200, 162, 110, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 162, 110, 0.05) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                    }}
                />

                {/* ─── Cloud Architecture Blueprint Overlay ─── */}
                <CloudArchitectureSVG />

                {/* ─── Floating Particles & Moving Network Lines ─── */}
                <Particles
                    id="tsparticles"
                    init={particlesInit}
                    options={particlesOptions}
                    style={{ position: 'absolute', inset: 0 }}
                />
            </div>
        </div>
    );
};

export default AnimatedBackground;
