import React, { useEffect, useRef, useState } from 'react';
import { journey } from '../../data/portfolioData';

const Journey = () => {
    const sectionRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const { subtitle, title, description, phases } = journey;

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const element = sectionRef.current;
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const start = viewportHeight;
            const end = -rect.height;
            const current = rect.top;

            let progress = (start - current) / (start - end);
            progress = Math.max(0, Math.min(1, progress));

            setScrollProgress(progress * 1.1);
        };

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const revealOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => revealOnScroll.observe(item));

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            revealOnScroll.disconnect();
        };
    }, []);

    return (
        <section id="journey" className="section bg-transparent" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-8">
                <div className="section-header animate-up text-center mb-20">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{subtitle}</span>
                    <h2 className="section-title text-2xl sm:text-3xl md:text-5xl font-black mb-4">{title}</h2>
                    <p className="text-[var(--clr-text-dim)] max-w-xl mx-auto">{description}</p>
                </div>

                <div className="timeline relative max-w-5xl mx-auto px-0 sm:px-4">
                    <div className="timeline-track absolute left-[20px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-[rgba(255,255,255,0.05)]">
                        <div
                            className="timeline-track-progress absolute top-0 left-0 w-full bg-gradient-to-b from-[var(--clr-accent)] to-[var(--clr-accent-2)] shadow-[0_0_15px_var(--clr-accent)] transition-all duration-300 ease-out"
                            style={{ height: `${scrollProgress * 100}%` }}
                        ></div>
                    </div>

                    <div className="timeline-items space-y-24 md:space-y-32">
                        {phases.map((phase, idx) => (
                            <div key={idx} className={`timeline-item relative flex items-start md:items-center gap-12 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className={`timeline-node absolute left-[20px] md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full z-10 transition-all duration-700 ${scrollProgress * 100 > (idx * 16) ? 'bg-[var(--clr-accent)] shadow-[0_0_20px_var(--clr-accent)] scale-125' : 'bg-[#1a1c23] border-2 border-[rgba(255,255,255,0.1)]'}`}>
                                    {scrollProgress * 100 > (idx * 16) && <div className="absolute inset-0 rounded-full animate-ping bg-[var(--clr-accent)] opacity-40"></div>}
                                </div>

                                <div className={`timeline-card-wrapper w-full md:w-[45%] pl-10 md:pl-0 ${idx % 2 === 0 ? 'timeline-reveal-left' : 'timeline-reveal-right'}`}>
                                    <div className="timeline-card card p-6 sm:p-8 border border-[var(--clr-card-border)] bg-[var(--clr-card-bg)] hover:border-[var(--clr-accent)] transition-all duration-500 rounded-3xl group relative overflow-hidden h-full">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--clr-accent)] opacity-[0.02] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity"></div>

                                        <span className="timeline-phase-label text-[var(--clr-accent)] font-black text-[10px] uppercase tracking-[0.2em] mb-3 block">PHASE {phase.phase}</span>
                                        <h3 className="timeline-title text-2xl font-black mb-4 group-hover:text-white transition-colors">{phase.title}</h3>
                                        <p className="timeline-description text-sm text-[var(--clr-text-dim)] leading-relaxed mb-8">{phase.description}</p>

                                        <div className="timeline-tags flex flex-wrap gap-2">
                                            {phase.tags.map((tag, tidx) => (
                                                <span key={tidx} className="tag px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[var(--clr-text-dim)] group-hover:border-[rgba(0,210,255,0.2)] group-hover:text-white transition-all">
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
                .timeline-reveal-left, .timeline-reveal-right {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @media (min-width: 768px) {
                    .timeline-reveal-left { transform: translateX(-60px); }
                    .timeline-reveal-right { transform: translateX(60px); }
                }
                .timeline-item.animate-in .timeline-reveal-left,
                .timeline-item.animate-in .timeline-reveal-right {
                    opacity: 1;
                    transform: translate(0, 0);
                }
                .timeline-card {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .timeline-card:hover {
                    box-shadow: 0 20px 50px rgba(0,210,255,0.1);
                    transform: translateY(-5px);
                }
            ` }} />
        </section>
    );
};

export default Journey;
