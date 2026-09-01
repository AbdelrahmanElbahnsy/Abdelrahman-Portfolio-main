import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { about as fallbackAbout, personalInfo } from '../../data/portfolioData';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useLanguage } from '../../i18n/LanguageContext';

const About = () => {
    const { t, language } = useLanguage();
    const { data: firestoreData, loading, error, subscribe } = useFirestoreSingleDoc('about', 'main');
    
    React.useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);
    
    const about = React.useMemo(() => {
        if (!firestoreData || !firestoreData.title) return fallbackAbout;
        
        let paragraphs = fallbackAbout.paragraphs;
        let badges = fallbackAbout.badges;
        let terminalItems = fallbackAbout.terminalItems;
        
        try { if (firestoreData.paragraphsJson) paragraphs = JSON.parse(firestoreData.paragraphsJson); } catch(e) {}
        try { if (firestoreData.badgesJson) badges = JSON.parse(firestoreData.badgesJson); } catch(e) {}
        try { if (firestoreData.terminalItemsJson) terminalItems = JSON.parse(firestoreData.terminalItemsJson); } catch(e) {}

        return {
            ...fallbackAbout,
            ...firestoreData,
            paragraphs,
            badges,
            terminalItems
        };
    }, [firestoreData]);
    
    const { 
        subtitle: rawSubtitle, 
        title: rawTitle, 
        lead: rawLead, 
        paragraphs: rawParagraphs, 
        badges: rawBadges, 
        terminalItems: rawTerminalItems,
        subtitleAr, titleAr, leadAr
    } = about;

    const subtitle = language === 'ar' ? (about.subtitleAr || rawSubtitle) : rawSubtitle;
    const title = language === 'ar' ? (about.titleAr || rawTitle) : rawTitle;
    const lead = language === 'ar' ? (about.leadAr || rawLead) : rawLead;
    const paragraphs = language === 'ar' && about.paragraphsAr ? about.paragraphsAr : (Array.isArray(rawParagraphs) ? rawParagraphs : fallbackAbout.paragraphs);
    const badges = Array.isArray(rawBadges) ? rawBadges : fallbackAbout.badges;
    const terminalItems = Array.isArray(rawTerminalItems) ? rawTerminalItems : fallbackAbout.terminalItems;
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
        { scope: sectionRef, dependencies: [loading] },
    );

    return (
        <section id="about" className="section" ref={sectionRef}>
            <div className="container mx-auto px-8">
                <div ref={headerRef} className="section-header mb-16 text-left rtl:text-right">
                    <span className="section-subtitle text-[var(--theme-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{subtitle}</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black">{title}</h2>
                </div>

                <div className="about-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
                    {loading ? (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-[var(--theme-accent)] min-h-[400px]">
                            <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
                            <p>{t('Loading about section...')}</p>
                        </div>
                    ) : error ? (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 min-h-[400px]">
                            <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                            <p>{t('Failed to load about section')}</p>
                            <p className="text-sm opacity-80 mt-2">{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="about-image order-2 md:order-1 h-fit">
                                <div ref={terminalRef} className="modern-terminal terminal-mini group h-fit flex flex-col justify-start">
                                    <div className="terminal-header bg-[var(--theme-bg-secondary)] p-4 flex items-center gap-4 border-b border-[var(--theme-border)] shrink-0">
                                        <div className="terminal-controls flex gap-2">
                                            <span className="dot red w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></span>
                                            <span className="dot yellow w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></span>
                                            <span className="dot green w-3.5 h-3.5 rounded-full bg-[#27c93f]"></span>
                                        </div>
                                        <span className="terminal-title font-mono text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">{personalInfo.terminalTitle}</span>
                                    </div>
                                    <div className="terminal-body bg-[var(--theme-surface)] pt-4 pb-6 px-3 sm:px-4 md:pt-5 md:pb-8 md:px-8 flex-col overflow-x-hidden">
                                        <ul className="terminal-list space-y-3 md:space-y-5 font-mono text-[10px] sm:text-xs md:text-base w-full text-left" dir="ltr">
                                            {terminalItems.map((item, idx) => (
                                                <li key={idx} className="term-line flex gap-1.5 sm:gap-2 md:gap-3 items-start">
                                                    <span className="term-key text-[var(--theme-accent)] shrink-0">{t(item.key)}:</span>
                                                    <span className="term-value text-[var(--theme-text)] break-words leading-[1.35] md:leading-normal" style={{ overflowWrap: 'anywhere' }}>{t(item.value)}</span>
                                                </li>
                                            ))}
                                            <li className="pt-1 flex gap-1.5 sm:gap-2 md:gap-3 items-center mt-1 md:mt-2">
                                                <span className="term-key text-[var(--theme-accent)] shrink-0">~</span>
                                                <span className="text-[var(--theme-accent)] text-xs sm:text-sm md:text-lg" style={{ animation: 'blink-cursor 0.9s infinite' }}>█</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div ref={textRef} className="about-text order-1 md:order-2 flex flex-col justify-center gap-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                <p ref={leadRef} className="lead text-2xl font-bold text-[var(--theme-text)] border-l-4 rtl:border-l-0 rtl:border-r-4 border-[var(--theme-accent)] pl-6 rtl:pl-0 rtl:pr-6 py-2 bg-[var(--theme-accent-soft)]">{lead}</p>
                                {paragraphs.map((paragraph, idx) => (
                                    <p key={idx} className="about-para text-[var(--theme-text-secondary)] leading-relaxed text-lg">
                                        {paragraph.text}
                                        {paragraph.highlight && (
                                            <strong className="text-[var(--theme-text)]">{paragraph.highlight}</strong>
                                        )}
                                        {paragraph.accent && (
                                            <span className="text-[var(--theme-accent)] italic">{paragraph.accent}</span>
                                        )}
                                        {paragraph.suffix}
                                    </p>
                                ))}

                                <div ref={badgesRef} className="about-badges flex flex-wrap gap-4 mt-6">
                                    {badges.map((badge, idx) => (
                                        <div key={idx} className="badge flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-gold)] text-sm font-bold hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] transition-all duration-300">
                                            <i className={`${badge.icon} text-[var(--theme-accent)] text-lg`}></i> {language === 'ar' ? (badge.labelAr || t(badge.label)) : badge.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .modern-terminal {
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid var(--theme-border);
                    box-shadow: var(--theme-shadow-strong);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modern-terminal:hover {
                    border-color: var(--theme-accent);
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: var(--theme-shadow-strong);
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
                    background: radial-gradient(circle at bottom right, rgba(200, 162, 110, 0.05), transparent 70%);
                    pointer-events: none;
                }
            ` }} />
        </section>
    );
};

export default About;
