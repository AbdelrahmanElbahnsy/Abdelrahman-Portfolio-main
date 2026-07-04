import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { about, personalInfo } from '../../data/portfolioData';

const About = () => {
    const { subtitle, title, lead, paragraphs, badges, terminalItems } = about;
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const terminalRef = useRef(null);
    const textRef = useRef(null);
    const leadRef = useRef(null);
    const badgesRef = useRef(null);

    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const termLines = terminalRef.current?.querySelectorAll('.term-line');
            const paras = textRef.current?.querySelectorAll('.about-para');
            const badgeEls = badgesRef.current?.querySelectorAll('.badge');

            // Set initial states
            gsap.set([subtitleEl, titleEl, leadRef.current].filter(Boolean), { opacity: 0, y: 30 });
            if (termLines?.length) gsap.set(termLines, { opacity: 0, x: -15 });
            if (paras?.length) gsap.set(paras, { opacity: 0, y: 20 });
            if (badgeEls?.length) gsap.set(badgeEls, { opacity: 0, scale: 0.8, y: 10 });
            gsap.set(terminalRef.current, { opacity: 0, x: -40 });

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            });

            tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
              .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15')
              .to(terminalRef.current, { opacity: 1, x: 0, duration: 0.6 }, '-=0.2')

            if (termLines?.length) {
                tl.to(termLines, { opacity: 1, x: 0, duration: 0.3, stagger: 0.06 }, '-=0.3');
            }

            tl.to(leadRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')

            if (paras?.length) {
                tl.to(paras, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
            }

            if (badgeEls?.length) {
                tl.to(badgeEls, { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)' }, '-=0.1');
            }
        },
        { scope: sectionRef, dependencies: [] },
    );

    return (
        <section id="about" className="section" ref={sectionRef}>
            <div className="container mx-auto px-8">
                <div ref={headerRef} className="section-header mb-16 text-left">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{subtitle}</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black">{title}</h2>
                </div>

                <div className="about-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
                    <div className="about-image order-2 md:order-1 h-full">
                        <div ref={terminalRef} className="modern-terminal terminal-mini group h-full flex flex-col">
                            <div className="terminal-header bg-[var(--clr-terminal-header)] p-4 flex items-center gap-4 border-b border-[var(--clr-card-border)] shrink-0">
                                <div className="terminal-controls flex gap-2">
                                    <span className="dot red w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></span>
                                    <span className="dot yellow w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></span>
                                    <span className="dot green w-3.5 h-3.5 rounded-full bg-[#27c93f]"></span>
                                </div>
                                <span className="terminal-title font-mono text-xs text-[var(--clr-text-dim)] uppercase tracking-wider">{personalInfo.terminalTitle}</span>
                            </div>
                            <div className="terminal-body bg-[var(--clr-terminal-bg)] p-6 md:p-8 flex-grow flex items-center overflow-x-hidden">
                                <ul className="terminal-list space-y-4 font-mono text-xs md:text-base w-full">
                                    {terminalItems.map((item, idx) => (
                                        <li key={idx} className="term-line flex gap-3 items-start">
                                            <span className="term-key text-[var(--clr-accent)] shrink-0">{item.key}:</span>
                                            <span className="term-value text-[var(--clr-text)] break-words">{item.value}</span>
                                        </li>
                                    ))}
                                    <li className="pt-2">
                                        <span className="text-[var(--clr-accent)] animate-pulse">_</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div ref={textRef} className="about-text order-1 md:order-2 flex flex-col justify-center gap-6 text-left">
                        <p ref={leadRef} className="lead text-2xl font-bold text-[var(--clr-text)] border-l-4 border-[var(--clr-accent)] pl-6 py-2 bg-[rgba(0,210,255,0.03)]">{lead}</p>
                        {paragraphs.map((paragraph, idx) => (
                            <p key={idx} className="about-para text-[var(--clr-text-dim)] leading-relaxed text-lg">
                                {paragraph.text}
                                {paragraph.highlight && (
                                    <strong className="text-white">{paragraph.highlight}</strong>
                                )}
                                {paragraph.accent && (
                                    <span className="text-[var(--clr-accent)] italic">{paragraph.accent}</span>
                                )}
                                {paragraph.suffix}
                            </p>
                        ))}

                        <div ref={badgesRef} className="about-badges flex flex-wrap gap-4 mt-6">
                            {badges.map((badge, idx) => (
                                <div key={idx} className="badge flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(0,210,255,0.15)] text-sm font-bold hover:border-[var(--clr-accent)] hover:bg-[rgba(0,210,255,0.05)] transition-all duration-300">
                                    <i className={`${badge.icon} text-[var(--clr-accent)] text-lg`}></i> {badge.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .modern-terminal {
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid var(--clr-card-border);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modern-terminal:hover {
                    border-color: var(--clr-accent);
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 30px 60px rgba(0,210,255,0.15);
                }
                .terminal-body {
                    position: relative;
                }
                .terminal-body::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle at bottom right, rgba(0, 210, 255, 0.05), transparent 70%);
                    pointer-events: none;
                }
            ` }} />
        </section>
    );
};

export default About;
