import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { journey } from '../../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

const Journey = () => {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const rightColRef = useRef(null);
    const stepperRef = useRef(null);
    const { subtitle, title, description, phases } = journey;

    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const descEl = headerRef.current?.querySelector('p');

            // Header entrance
            gsap.set([subtitleEl, titleEl, descEl].filter(Boolean), { opacity: 0, y: 30 });

            const headerTl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
            });

            headerTl
                .to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
                .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15')
                .to(descEl, { opacity: 1, y: 0, duration: 0.4 }, '-=0.15');

            // Cards and Stepper sync animation
            const cards = rightColRef.current?.querySelectorAll('.journey-card-wrapper');
            const stepperItems = stepperRef.current?.querySelectorAll('.stepper-item');

            if (cards?.length) {
                cards.forEach((card, index) => {
                    const step = stepperItems?.[index];
                    const stepDot = step?.querySelector('.step-dot');
                    const stepText = step?.querySelector('.step-text');

                    // Card Entrance Animation
                    gsap.fromTo(card, 
                        { opacity: 0, y: 50 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 85%',
                                toggleActions: 'play none none none'
                            }
                        }
                    );

                    // Sync Stepper active state
                    if (step) {
                        ScrollTrigger.create({
                            trigger: card,
                            start: 'top 60%',
                            end: 'bottom 60%',
                            onEnter: () => {
                                gsap.to(stepDot, { backgroundColor: 'var(--clr-accent)', scale: 1.5, boxShadow: '0 0 15px var(--clr-accent)', duration: 0.3 });
                                gsap.to(stepText, { color: '#fff', scale: 1.05, x: 8, duration: 0.3 });
                            },
                            onLeave: () => {
                                gsap.to(stepDot, { backgroundColor: 'rgba(255,255,255,0.15)', scale: 1, boxShadow: 'none', duration: 0.3 });
                                gsap.to(stepText, { color: 'var(--clr-text-dim)', scale: 1, x: 0, duration: 0.3 });
                            },
                            onEnterBack: () => {
                                gsap.to(stepDot, { backgroundColor: 'var(--clr-accent)', scale: 1.5, boxShadow: '0 0 15px var(--clr-accent)', duration: 0.3 });
                                gsap.to(stepText, { color: '#fff', scale: 1.05, x: 8, duration: 0.3 });
                            },
                            onLeaveBack: () => {
                                gsap.to(stepDot, { backgroundColor: 'rgba(255,255,255,0.15)', scale: 1, boxShadow: 'none', duration: 0.3 });
                                gsap.to(stepText, { color: 'var(--clr-text-dim)', scale: 1, x: 0, duration: 0.3 });
                            }
                        });
                    }
                });
            }
        },
        { scope: sectionRef }
    );

    return (
        <section id="journey" className="section bg-transparent relative" ref={sectionRef}>
            <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-12 md:gap-20 relative items-start">
                    
                    {/* Left Column: Sticky Sidebar with Stepper */}
                    <div className="w-full md:w-[40%] md:sticky md:top-[20vh] z-10">
                        <div ref={headerRef} className="section-header text-left mb-8">
                            <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-4 block">
                                {subtitle}
                            </span>
                            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight drop-shadow-md">
                                {title}
                            </h2>
                            <p className="text-[var(--clr-text-dim)] max-w-md text-lg leading-relaxed">
                                {description}
                            </p>
                        </div>
                        
                        {/* Interactive Table of Contents (Desktop Only) */}
                        <div ref={stepperRef} className="hidden md:block relative pl-1 mt-12">
                            {/* Vertical Line */}
                            <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-[rgba(255,255,255,0.05)]"></div>
                            
                            <div className="space-y-6 relative z-10">
                                {phases.map((phase, idx) => (
                                    <div key={idx} className="stepper-item flex items-center gap-5 group cursor-default">
                                        {/* Dot */}
                                        <div className="step-dot w-2 h-2 rounded-full bg-[rgba(255,255,255,0.15)] origin-center"></div>
                                        
                                        {/* Text */}
                                        <div className="step-text text-sm font-bold text-[var(--clr-text-dim)] origin-left flex items-center">
                                            <span className="text-[10px] uppercase tracking-widest font-mono opacity-40 mr-3">
                                                0{phase.phase}
                                            </span>
                                            {phase.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scrolling Cards */}
                    <div ref={rightColRef} className="w-full md:w-[60%] space-y-16 md:space-y-32 pb-12 md:pb-32 pt-4 md:pt-[5vh]">
                        {phases.map((phase, idx) => (
                            <div key={idx} className="journey-card-wrapper">
                                <div className="journey-card card p-8 sm:p-10 border border-[var(--clr-card-border)] bg-[var(--clr-card-bg)] hover:border-[var(--clr-accent)] transition-all duration-500 rounded-3xl group relative overflow-hidden backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(200,162,110,0.15)]">
                                    
                                    {/* Accent Glow Effect */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--clr-accent)] opacity-[0.02] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-700 blur-3xl pointer-events-none"></div>

                                    <span className="text-[var(--clr-accent)] font-black text-[11px] uppercase tracking-[0.2em] mb-4 block">
                                        PHASE {phase.phase}
                                    </span>
                                    
                                    <h3 className="text-2xl sm:text-3xl font-black mb-5 text-gray-100 group-hover:text-white transition-colors tracking-tight">
                                        {phase.title}
                                    </h3>
                                    
                                    <p className="text-base text-[var(--clr-text-dim)] leading-relaxed mb-8">
                                        {phase.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {phase.tags.map((tag, tidx) => (
                                            <span key={tidx} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[var(--clr-text-dim)] group-hover:border-[rgba(200,162,110,0.4)] group-hover:text-white group-hover:bg-[rgba(200,162,110,0.1)] transition-all duration-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .journey-card:hover {
                    transform: translateY(-5px);
                }
            ` }} />
        </section>
    );
};

export default Journey;
