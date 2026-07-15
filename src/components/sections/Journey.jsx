import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { journey } from '../../data/portfolioData';

const Journey = () => {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const trackRef = useRef(null);
    const trackProgressRef = useRef(null);
    const { subtitle, title, description, phases } = journey;

    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const descEl = headerRef.current?.querySelector('p');

            // Set initial states for header elements
            gsap.set([subtitleEl, titleEl, descEl].filter(Boolean), { opacity: 0, y: 30 });

            const headerTl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: { trigger: headerRef.current, start: 'top 85%', toggleActions: 'play none none none' },
            });

            headerTl
                .to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
                .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15')
                .to(descEl, { opacity: 1, y: 0, duration: 0.4 }, '-=0.15');

            // Timeline track progress — scrubbed to scroll
            if (trackProgressRef.current && trackRef.current) {
                gsap.set(trackProgressRef.current, { transformOrigin: 'top center' });
                gsap.fromTo(
                    trackProgressRef.current,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        ease: 'none',
                        scrollTrigger: { trigger: trackRef.current, start: 'top 80%', end: 'bottom 20%', scrub: 0.5 },
                    },
                );
            }

            // Timeline nodes — glow on scroll
            const nodes = sectionRef.current?.querySelectorAll('.timeline-node');
            if (nodes?.length) {
                nodes.forEach((node) => {
                    gsap.to(node, {
                        backgroundColor: 'var(--clr-accent)',
                        boxShadow: '0 0 20px var(--clr-accent)',
                        scale: 1.25,
                        duration: 0.3,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: node, start: 'top 75%', toggleActions: 'play none none none' },
                    });
                });
            }

            // Timeline cards — alternating slide-in
            const items = sectionRef.current?.querySelectorAll('.timeline-item');
            if (items?.length) {
                items.forEach((item, idx) => {
                    const cardWrapper = item.querySelector('.timeline-card-wrapper');
                    const isLeft = idx % 2 === 0;

                    gsap.from(cardWrapper, {
                        opacity: 0,
                        x: isLeft ? -40 : 40,
                        y: 15,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: item, start: 'top 80%', toggleActions: 'play none none none' },
                    });

                    const tags = item.querySelectorAll('.tag');
                    if (tags.length) {
                        gsap.from(tags, {
                            opacity: 0, scale: 0.8, duration: 0.3, stagger: 0.04, ease: 'back.out(1.7)',
                            scrollTrigger: { trigger: item, start: 'top 75%', toggleActions: 'play none none none' },
                        });
                    }
                });
            }
        },
        { scope: sectionRef, dependencies: [] },
    );

    return (
        <section id="journey" className="section bg-transparent" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-8">
                <div ref={headerRef} className="section-header text-center mb-20">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{subtitle}</span>
                    <h2 className="section-title text-2xl sm:text-3xl md:text-5xl font-black mb-4">{title}</h2>
                    <p className="text-[var(--clr-text-dim)] max-w-xl mx-auto">{description}</p>
                </div>

                <div ref={trackRef} className="timeline relative max-w-5xl mx-auto px-0 sm:px-4">
                    <div className="timeline-track absolute left-[20px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-[rgba(255,255,255,0.05)]">
                        <div
                            ref={trackProgressRef}
                            className="timeline-track-progress absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--clr-accent)] to-[var(--clr-accent-2)] shadow-[0_0_15px_var(--clr-accent)]"
                            style={{ transform: 'scaleY(0)', willChange: 'transform' }}
                        ></div>
                    </div>

                    <div className="timeline-items space-y-24 md:space-y-32">
                        {phases.map((phase, idx) => (
                            <div key={idx} className={`timeline-item relative flex items-start md:items-center gap-12 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className="timeline-node absolute left-[20px] md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full z-10 bg-[#1a1c23] border-2 border-[rgba(255,255,255,0.1)]"></div>

                                <div className={`timeline-card-wrapper w-full md:w-[45%] pl-10 md:pl-0`}>
                                    <div className="timeline-card card p-6 sm:p-8 border border-[var(--clr-card-border)] bg-[var(--clr-card-bg)] hover:border-[var(--clr-accent)] transition-all duration-500 rounded-3xl group relative overflow-hidden h-full">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--clr-accent)] opacity-[0.02] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity"></div>

                                        <span className="timeline-phase-label text-[var(--clr-accent)] font-black text-[10px] uppercase tracking-[0.2em] mb-3 block">PHASE {phase.phase}</span>
                                        <h3 className="timeline-title text-2xl font-black mb-4 group-hover:text-white transition-colors">{phase.title}</h3>
                                        <p className="timeline-description text-sm text-[var(--clr-text-dim)] leading-relaxed mb-8">{phase.description}</p>

                                        <div className="timeline-tags flex flex-wrap gap-2">
                                            {phase.tags.map((tag, tidx) => (
                                                <span key={tidx} className="tag px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[var(--clr-text-dim)] group-hover:border-[rgba(200,162,110,0.2)] group-hover:text-white transition-all">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block md:w-[45%]"></div>
                            </div>
                         ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .timeline-card {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .timeline-card:hover {
                    box-shadow: 0 20px 50px rgba(200,162,110,0.1);
                    transform: translateY(-5px);
                }
            ` }} />
        </section>
    );
};

export default Journey;
