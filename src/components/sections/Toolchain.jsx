import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { toolchain } from '../../data/portfolioData';

const Toolchain = () => {
    const { row1, row2 } = toolchain;
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const row1Ref = useRef(null);
    const row2Ref = useRef(null);

    useGSAP(
        () => {
            // Header reveal
            gsap.from(headerRef.current, {
                opacity: 0,
                y: 40,
                duration: 0.9,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            });

            // GSAP-powered infinite scroll for row 1 (left)
            const row1El = row1Ref.current;
            if (row1El) {
                const totalWidth = row1El.scrollWidth / 3; // We tripled the items
                gsap.set(row1El, { x: 0 });
                const tween1 = gsap.to(row1El, {
                    x: -totalWidth,
                    duration: 40,
                    ease: 'none',
                    repeat: -1,
                    modifiers: {
                        x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
                    },
                });

                // Pause on hover
                const container1 = row1El.parentElement;
                container1.addEventListener('mouseenter', () => gsap.to(tween1, { timeScale: 0, duration: 0.5 }));
                container1.addEventListener('mouseleave', () => gsap.to(tween1, { timeScale: 1, duration: 0.5 }));
            }

            // GSAP-powered infinite scroll for row 2 (right)
            const row2El = row2Ref.current;
            if (row2El) {
                const totalWidth = row2El.scrollWidth / 3;
                gsap.set(row2El, { x: -totalWidth });
                const tween2 = gsap.to(row2El, {
                    x: 0,
                    duration: 40,
                    ease: 'none',
                    repeat: -1,
                    modifiers: {
                        x: gsap.utils.unitize((x) => {
                            const val = parseFloat(x);
                            return val >= 0 ? val - totalWidth : val;
                        }),
                    },
                });

                // Pause on hover
                const container2 = row2El.parentElement;
                container2.addEventListener('mouseenter', () => gsap.to(tween2, { timeScale: 0, duration: 0.5 }));
                container2.addEventListener('mouseleave', () => gsap.to(tween2, { timeScale: 1, duration: 0.5 }));
            }
        },
        { scope: sectionRef, dependencies: [] },
    );

    return (
        <section id="toolchain" className="section relative overflow-hidden bg-[rgba(10,10,10,0.3)]" ref={sectionRef}>
            <div className="container mx-auto px-8 mb-12">
                <div ref={headerRef} className="section-header text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[rgba(200,162,110,0.05)] border border-[rgba(200,162,110,0.1)]">
                        <i className="fas fa-briefcase text-[var(--clr-accent)]"></i>
                        <span className="text-sm font-bold tracking-wider uppercase text-[var(--clr-accent)]">DevOps Toolchain</span>
                    </div>
                </div>
            </div>

            <div className="toolchain-wrapper flex flex-col gap-8">
                <div className="scroll-container overflow-hidden whitespace-nowrap mask-edges py-2">
                    <div ref={row1Ref} className="flex gap-6 w-max">
                        {[...row1, ...row1].map((tool, idx) => (
                            <div key={`r1-${idx}`} className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-[var(--clr-accent)] hover:bg-[rgba(200,162,110,0.05)] transition-all duration-300 group">
                                <i className={`${tool.icon} text-xl text-[var(--clr-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="scroll-container overflow-hidden whitespace-nowrap mask-edges py-2">
                    <div ref={row2Ref} className="flex gap-6 w-max">
                        {[...row2, ...row2].map((tool, idx) => (
                            <div key={`r2-${idx}`} className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-[var(--clr-accent)] hover:bg-[rgba(200,162,110,0.05)] transition-all duration-300 group">
                                <i className={`${tool.icon} text-xl text-[var(--clr-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .mask-edges {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
                .tool-card {
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .tool-card:hover {
                    box-shadow: 0 0 20px rgba(200, 162, 110, 0.2);
                    transform: translateY(-5px);
                }
                .light-theme .tool-card {
                    background: rgba(255, 255, 255, 0.8);
                    border-color: rgba(0,0,0,0.05);
                    color: #333;
                }
                .light-theme .bg-\\[rgba\\(10\\,10\\,10\\,0\\.3\\)\\] {
                    background: rgba(0,0,0,0.02);
                }
            ` }} />
        </section>
    );
};

export default Toolchain;
