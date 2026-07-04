import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/**
 * WaveDivider — Animated SVG wave that morphs on scroll
 *
 * @param {string} position - 'top' | 'bottom', default 'bottom'
 * @param {string} color - Fill color, default 'var(--clr-bg)'
 * @param {number} height - Wave height in px, default 80
 * @param {boolean} flip - Mirror horizontally
 */
const WaveDivider = ({
    position = 'bottom',
    color = 'var(--clr-bg)',
    height = 80,
    flip = false,
}) => {
    const pathRef = useRef(null);
    const containerRef = useRef(null);

    // Start and end wave shapes for morphing
    const pathStart =
        'M0,40 C150,80 350,0 500,40 C650,80 850,0 1000,40 C1150,80 1350,0 1500,40 L1500,100 L0,100 Z';
    const pathEnd =
        'M0,60 C180,20 320,80 500,50 C680,20 820,80 1000,50 C1180,20 1350,70 1500,50 L1500,100 L0,100 Z';

    useGSAP(
        () => {
            if (!pathRef.current) return;

            gsap.fromTo(
                pathRef.current,
                { attr: { d: pathStart } },
                {
                    attr: { d: pathEnd },
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 90%',
                        end: 'bottom 10%',
                        scrub: 1.5,
                    },
                },
            );
        },
        { scope: containerRef, dependencies: [] },
    );

    const isTop = position === 'top';

    return (
        <div
            ref={containerRef}
            className="wave-divider"
            style={{
                position: 'relative',
                width: '100%',
                height: `${height}px`,
                overflow: 'hidden',
                lineHeight: 0,
                transform: `${isTop ? 'rotate(180deg)' : ''} ${flip ? 'scaleX(-1)' : ''}`,
                marginTop: isTop ? 0 : `-${height / 2}px`,
                marginBottom: isTop ? `-${height / 2}px` : 0,
                zIndex: 1,
                pointerEvents: 'none',
            }}
        >
            <svg
                viewBox="0 0 1500 100"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                }}
            >
                <path
                    ref={pathRef}
                    d={pathStart}
                    fill={color}
                    fillOpacity="0.06"
                    style={{
                        filter: `drop-shadow(0 0 8px ${color === 'var(--clr-bg)' ? 'rgba(200,162,110,0.1)' : color})`,
                    }}
                />
                {/* Secondary wave for depth */}
                <path
                    d="M0,50 C200,90 400,10 600,50 C800,90 1000,10 1200,50 C1350,80 1450,30 1500,50 L1500,100 L0,100 Z"
                    fill={color}
                    fillOpacity="0.03"
                />
            </svg>
        </div>
    );
};

export default WaveDivider;
