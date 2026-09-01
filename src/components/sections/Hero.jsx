import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { heroTechSlider, personalInfo } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';
import SplitText from '../ui/SplitText';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useLanguage } from '../../i18n/LanguageContext';

const Hero = ({ splashDone = true }) => {
    const { t, language } = useLanguage();
    const [typedText, setTypedText] = useState('');
    const { data: firestoreData, subscribe, loading, error } = useFirestoreSingleDoc('hero', 'main');

    useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);

    const dataSource = firestoreData;
    
    const badge = language === 'ar' ? (dataSource?.badgeAr || t(dataSource?.badge || '')) : (dataSource?.badge || '');
    const firstName = dataSource?.firstName || '';
    const lastName = dataSource?.lastName || '';
    const fullNameAr = dataSource?.fullNameAr || '';
    const description = language === 'ar' ? (dataSource?.descriptionAr || t(dataSource?.description || '')) : (dataSource?.description || '');

    const { portrait, fullName, cvUrl } = dataSource || {};

    const translatedRolesStr = useMemo(() => {
        if (!dataSource) return JSON.stringify([]);
        if (language === 'ar') {
            const arRoles = dataSource.rolesAr;
            if (arRoles && Array.isArray(arRoles) && arRoles.length > 0) {
                return JSON.stringify(arRoles);
            }
        }
        const rolesRaw = dataSource.roles;
        const parsedRoles = Array.isArray(rolesRaw) && rolesRaw.length > 0
            ? rolesRaw 
            : (typeof rolesRaw === 'string' && rolesRaw.trim() !== '' ? rolesRaw.split(',').map(r => r.trim()) : []);
        
        return JSON.stringify(parsedRoles.map(r => language === 'ar' ? t(r) : r));
    }, [dataSource, language, t]);

    const rolesMemo = useMemo(() => JSON.parse(translatedRolesStr), [translatedRolesStr]);

    // Refs for GSAP targets
    const sectionRef = useRef(null);
    const badgeRef = useRef(null);
    const nameRef = useRef(null);
    const subtitleRef = useRef(null);
    const descRef = useRef(null);
    const sliderRef = useRef(null);
    const ctaRef = useRef(null);
    const portraitRef = useRef(null);
    const scrollIndicatorRef = useRef(null);

    // Magnetic effect on CTA button
    useMagneticEffect(ctaRef, { strength: 0.35, radius: 80 });

    // Typing effect
    useEffect(() => {
        if (!splashDone || !rolesMemo || rolesMemo.length === 0) return;

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeout;

        const type = () => {
            const currentRole = rolesMemo[roleIndex] || '';

            if (isDeleting) {
                setTypedText(currentRole.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setTypedText(currentRole.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % rolesMemo.length;
                typeSpeed = 500;
            }

            timeout = setTimeout(type, typeSpeed);
        };

        timeout = setTimeout(type, 1500);
        return () => clearTimeout(timeout);
    }, [rolesMemo, splashDone]);

    // GSAP entrance timeline
    useGSAP(
        () => {
            const targets = [
                badgeRef.current,
                nameRef.current,
                subtitleRef.current,
                descRef.current,
                sliderRef.current,
                ctaRef.current,
                portraitRef.current,
                scrollIndicatorRef.current,
            ].filter(Boolean);

            gsap.set(targets, { opacity: 0, y: 30 });
            gsap.set(portraitRef.current, { opacity: 0, scale: 0.9, y: 0 });
            gsap.set(ctaRef.current, { opacity: 0, y: 25, scale: 0.92 });
            if (nameRef.current) gsap.set(nameRef.current, { opacity: 0, y: 30 });

            if (!splashDone) return;

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                delay: 0.15,
            });

            tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' });

            // Block name reveal (safer for responsive layouts)
            tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.1');

            tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
            tl.to(portraitRef.current, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.3');
            tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.6');
            tl.to(sliderRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
            tl.to(ctaRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2');
            tl.to(scrollIndicatorRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.1');

            // Continuous float for portrait
            tl.then(() => {
                gsap.to(portraitRef.current, { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            });
        },
        { scope: sectionRef, dependencies: [splashDone, dataSource, loading] },
    );

    if (loading) {
        return (
            <section id="hero" className="relative flex items-center justify-center min-h-[100vh] lg:min-h-[95vh] pt-[120px] pb-24 overflow-hidden bg-transparent">
                <div className="flex flex-col items-center justify-center text-[var(--theme-accent)]">
                    <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
                    <p>{t('Loading...')}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="hero" className="relative flex items-center justify-center min-h-[100vh] lg:min-h-[95vh] pt-[120px] pb-24 overflow-hidden bg-transparent">
                <div className="flex flex-col items-center justify-center text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                    <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>{t('Failed to load hero section')}</p>
                    <p className="text-sm opacity-80 mt-2">{error}</p>
                </div>
            </section>
        );
    }

    if (!dataSource) {
        return (
            <section id="hero" className="relative flex items-center justify-center min-h-[100vh] lg:min-h-[95vh] pt-[120px] pb-24 overflow-hidden bg-transparent">
                <div className="flex flex-col items-center justify-center text-[var(--theme-text-muted)] bg-[var(--theme-surface)] p-8 rounded-3xl border border-[var(--theme-border)] shadow-inner">
                    <i className="fas fa-folder-open text-4xl mb-4 opacity-50"></i>
                    <p>{t('No hero information found.')}</p>
                </div>
            </section>
        );
    }

    return (
        <section
            id="hero"
            ref={sectionRef}
            className="relative flex items-start lg:items-center min-h-[100vh] lg:min-h-[95vh] pt-[120px] md:pt-[140px] pb-24 overflow-hidden bg-transparent"
        >
            <div className="container px-6 sm:px-8 mx-auto h-full flex flex-col justify-start lg:justify-center">
                <div className="grid items-center grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-8 md:gap-12 lg:gap-[clamp(2rem,5vw,5rem)] hero-grid w-full max-w-full min-w-0" dir="ltr">
                    <div className="hero-left flex flex-col justify-center min-w-0 w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <div ref={badgeRef} className="hero-badge-wrapper mb-4 text-left rtl:text-right" dir="auto">
                            <div className="hero-badge" dir="auto">
                                <i className="fas fa-wand-magic-sparkles sparkle-icon"></i>
                                <span>{badge}</span>
                            </div>
                        </div>
                        <h1
                            ref={nameRef}
                            className="hero-name text-[clamp(2rem,8vw,3.5rem)] font-black mb-3 md:mb-5 leading-[1.05] tracking-tight"
                            dir="ltr"
                        >
                            {language === 'ar' ? (
                                <span className="hero-name-ar highlight-surname text-[var(--theme-accent)]" dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                                    {fullNameAr}
                                </span>
                            ) : (
                                <span className="hero-name-en highlight-surname text-[var(--theme-accent)]" dir="ltr">
                                    {(fullName || `${firstName} ${lastName}`)}
                                </span>
                            )}
                        </h1>
                        <h2
                            ref={subtitleRef}
                            className="hero-subtitle text-[clamp(1.1rem,2.5vw,1.5rem)] font-bold mb-4 md:mb-6 min-h-[40px] text-[var(--theme-accent)]"
                            dir="ltr"
                        >
                            <span className="inline-block" dir="auto">{typedText}</span>
                            <span className="typing-cursor ml-1 animate-[blink-cursor_0.8s_infinite]">
                                |
                            </span>
                        </h2>
                        <p
                            ref={descRef}
                            className="hero-description text-[var(--theme-text-secondary)] text-[clamp(1rem,2vw,1.15rem)] leading-relaxed max-w-[700px] w-full mb-8 md:mb-12 text-left rtl:text-right break-words overflow-visible"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        >
                            {description}
                        </p>

                        <div ref={sliderRef} className="mb-8 tech-badges-container w-full max-w-full min-w-0 overflow-hidden">
                            <Swiper
                                dir="ltr"
                                modules={[Autoplay, FreeMode]}
                                slidesPerView="auto"
                                spaceBetween={20}
                                loop={true}
                                speed={5000}
                                autoplay={{
                                    delay: 0,
                                    disableOnInteraction: false,
                                }}
                                freeMode={true}
                                className="tech-slider"
                            >
                                {heroTechSlider.map((item, idx) => (
                                    <SwiperSlide key={idx} style={{ width: 'auto' }}>
                                        <span className="tech-badge flex items-center gap-2 px-4 md:px-5 py-2 rounded-full border border-[var(--theme-border-gold)] bg-[var(--theme-surface-soft)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-all duration-300 text-[0.85rem] md:text-base whitespace-nowrap">
                                            {item.icon === 'SiMicrosoftazure' ? (
                                                <SiMicrosoftazure />
                                            ) : (
                                                <i className={item.icon}></i>
                                            )}
                                            {item.label}
                                        </span>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div ref={ctaRef} className="flex gap-6 hero-cta-group">
                            <a
                                id="hero-btn-cv"
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-cv flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--theme-accent)] text-black font-bold hover:scale-105 transition-transform shadow-[var(--theme-shadow-strong)]"
                            >
                                <i className="fas fa-file-download"></i>
                                <span>{dataSource?.cta1 || t('Download CV')}</span>
                            </a>
                        </div>
                    </div>

                    <div className="hero-right flex justify-start lg:justify-center items-start lg:items-center w-full min-w-0 mt-4 lg:mt-0">
                        <div ref={portraitRef} className="relative w-[min(92vw,420px)] lg:w-[min(100%,520px)] mx-auto lg:mx-0 lg:ml-auto hero-portrait group">
                            <div className="portrait-frame relative w-full h-auto rounded-[30px] overflow-hidden border border-[var(--theme-border-strong)] shadow-[var(--theme-shadow-strong)] bg-gradient-to-b from-[var(--theme-surface)] to-[var(--theme-surface-soft)] flex justify-center">
                                <img
                                    src={portrait}
                                    alt={fullName}
                                    className="block w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="eager"
                                    fetchPriority="high"
                                    width="800"
                                    height="1000"
                                />
                                <div className="absolute inset-0 bg-transparent portrait-overlay pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                ref={scrollIndicatorRef}
                className="hidden lg:flex absolute flex-col items-center gap-2 -translate-x-1/2 scroll-indicator bottom-8 left-1/2"
            >
                <a href="#about" className="flex flex-col items-center scroll-link">
                    <span className="mouse w-6 h-10 border-2 border-[var(--theme-text-secondary)] rounded-full relative">
                        <span className="wheel w-1 h-2 bg-[var(--theme-accent)] rounded-full absolute top-2 left-1/2 -translate-x-1/2 animate-[scroll-wheel_1s_infinite]"></span>
                    </span>
                </a>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scroll-wheel {
                    0% { transform: translate(-50%, 0); opacity: 1; }
                    100% { transform: translate(-50%, 15px); opacity: 0; }
                }

                .highlight-surname {
                    background: linear-gradient(to right, var(--theme-accent), var(--theme-accent-hover));
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .tech-slider {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 16px;
                    border-radius: 9999px;
                    background: var(--theme-accent-soft);
                    border: 1px solid var(--theme-border-gold);
                    color: var(--theme-accent);
                    font-size: 0.9rem;
                    font-weight: 500;
                    font-style: italic;
                    letter-spacing: 0.5px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .hero-badge:hover {
                    background: var(--theme-accent-hover);
                    border-color: var(--theme-accent);
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(200, 162, 110, 0.15);
                    color: var(--theme-bg);
                }

                .sparkle-icon {
                    color: var(--theme-accent);
                    filter: drop-shadow(0 0 5px rgba(200, 162, 110, 0.3));
                    font-size: 0.8rem;
                }
            ` }} />
        </section>
    );
};

export default Hero;
