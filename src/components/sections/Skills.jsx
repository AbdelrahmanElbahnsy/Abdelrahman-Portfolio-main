import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { skills as fallbackSkills } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { transformSkills } from '../../cms/utils/transformSkills';
import { useLanguage } from '../../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
    const { t, language } = useLanguage();
    const { data: firestoreData, loading, error, subscribe } = useFirestoreCrud('skills');

    useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);

    const skillsData = React.useMemo(() => {
        if (!firestoreData) return null;
        const transformed = transformSkills(firestoreData);
        return {
            circularSkills: transformed.circularSkills || [],
            categories: transformed.categories || [],
        };
    }, [firestoreData]);

    const subtitle = language === 'ar' ? (fallbackSkills.subtitleAr) : (fallbackSkills.subtitle);
    const title = language === 'ar' ? (fallbackSkills.titleAr) : (fallbackSkills.title);
    const description = language === 'ar' ? (fallbackSkills.descriptionAr) : (fallbackSkills.description);
    const circularSkills = skillsData?.circularSkills || [];
    const categories = skillsData?.categories || [];
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const circularRef = useRef(null);

    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const descEl = headerRef.current?.querySelector('.section-desc');
            const skillItems = circularRef.current?.querySelectorAll('.circular-skill-item');

            gsap.set([subtitleEl, titleEl, descEl].filter(Boolean), { opacity: 0, y: 30 });
            if (skillItems?.length) gsap.set(skillItems, { opacity: 0, y: 30, scale: 0.9 });

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
              .to(descEl, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');

            if (skillItems?.length) {
                tl.to(skillItems, {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.6, stagger: 0.1,
                    ease: 'back.out(1.2)',
                    onComplete: () => {
                        skillItems.forEach((item, idx) => {
                            const circle = item.querySelector('.progress-ring-circle');
                            const percent = parseFloat(item.dataset.percent || '0');
                            const radius = circle?.r?.baseVal?.value || 58;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (percent / 100) * circumference;
                            if (circle) {
                                gsap.to(circle, { strokeDashoffset: offset, duration: 1.2, delay: idx * 0.1, ease: 'power3.out' });
                            }
                        });
                    },
                }, '-=0.1');
            }
        },
        { scope: sectionRef }
    );

    return (
        <section id="skills" className="section relative !overflow-visible" ref={sectionRef}>
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div ref={headerRef} className="section-header text-center mb-12 md:mb-16">
                    <span className="section-subtitle text-[var(--theme-accent)] font-mono uppercase tracking-widest text-sm mb-3 block">
                        {subtitle}
                    </span>
                    <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                        {title}
                    </h2>
                    <p className="section-desc text-[var(--theme-text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
                        {description}
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center text-[var(--theme-accent)] min-h-[400px]">
                        <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
                        <p>{t('Loading skills...')}</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 min-h-[400px]">
                        <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                        <p>{t('Failed to load skills')}</p>
                        <p className="text-sm opacity-80 mt-2">{error}</p>
                    </div>
                ) : circularSkills.length === 0 && categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-[var(--theme-text-muted)] bg-[var(--theme-surface)] p-8 rounded-3xl border border-[var(--theme-border)] shadow-inner min-h-[400px]">
                        <i className="fas fa-folder-open text-4xl mb-4 opacity-50"></i>
                        <p>{t('No skills found.')}</p>
                    </div>
                ) : (
                    <>
                        {/* Circular Skills Row */}
                        <div ref={circularRef} className="skills-circular-row flex flex-wrap justify-center gap-10 md:gap-16 mb-24">
                            {circularSkills.map((skill, idx) => (
                                <div key={idx} className="circular-skill-item group flex flex-col items-center cursor-pointer" data-percent={skill.percent}>
                                    <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center bg-[var(--theme-surface)] rounded-full border border-[var(--theme-border)] group-hover:border-[var(--theme-accent)] shadow-[var(--theme-shadow)] transition-colors duration-500">
                                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                                            {/* Background Circle */}
                                            <circle cx="50%" cy="50%" r="58" fill="transparent" stroke="var(--theme-border-strong)" strokeWidth="6" />
                                            {/* Progress Circle */}
                                            <circle className="progress-ring-circle transition-none" cx="50%" cy="50%" r="58" fill="transparent" stroke="var(--theme-accent)" strokeWidth="6" strokeDasharray="364.42" strokeDashoffset="364.42" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-2 md:inset-3 bg-[var(--theme-bg)] rounded-full flex items-center justify-center z-10 shadow-[var(--theme-shadow-strong)] group-hover:scale-110 transition-transform duration-500">
                                            {skill.icon?.trim().toLowerCase() === 'simicrosoftazure' ? (
                                                <SiMicrosoftazure className="text-3xl md:text-4xl text-[var(--theme-accent)] group-hover:text-[var(--theme-text)] transition-colors" />
                                            ) : (
                                                <i className={`${skill.icon} text-3xl md:text-4xl text-[var(--theme-accent)] group-hover:text-[var(--theme-text)] transition-colors`}></i>
                                            )}
                                        </div>
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-full bg-[var(--theme-accent)] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 pointer-events-none"></div>
                                    </div>
                                    <div className="text-center mt-6">
                                        <h4 className="text-lg font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? (skill.labelAr || t(skill.label)) : skill.label}</h4>
                                        <p className="text-sm text-[var(--theme-text-muted)] mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? (skill.subAr || t(skill.sub)) : skill.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Swiper Cards Section */}
                        <div className="skills-swiper-container pt-4 px-2 md:px-16">
                            <div className="relative group/carousel">
                                {/* Custom Navigation Arrows for Better UX */}
                                <button 
                                    className="skills-swiper-prev absolute top-auto -bottom-[68px] left-1/2 -translate-x-[120px] rtl:left-auto rtl:right-1/2 rtl:translate-x-[120px] translate-y-0 md:top-1/2 md:bottom-auto md:-left-16 rtl:md:-left-auto rtl:md:-right-16 md:translate-x-0 md:-translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full border border-[var(--theme-border-gold)] bg-[var(--theme-surface-elevated)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg focus:outline-none cursor-pointer backdrop-blur-md"
                                    aria-label="Previous slide"
                                >
                                    <i className="fas fa-chevron-left text-xl rtl:rotate-180"></i>
                                </button>
                                <button 
                                    className="skills-swiper-next absolute top-auto -bottom-[68px] right-1/2 translate-x-[120px] rtl:right-auto rtl:left-1/2 rtl:-translate-x-[120px] translate-y-0 md:top-1/2 md:bottom-auto md:-right-16 rtl:md:-right-auto rtl:md:-left-16 md:translate-x-0 md:-translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full border border-[var(--theme-border-gold)] bg-[var(--theme-surface-elevated)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg focus:outline-none cursor-pointer backdrop-blur-md"
                                    aria-label="Next slide"
                                >
                                    <i className="fas fa-chevron-right text-xl rtl:rotate-180"></i>
                                </button>

                                <Swiper
                                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                                    key={language}
                                    modules={[Pagination, Autoplay, Navigation, Keyboard]}
                                    slidesPerView={1}
                                    spaceBetween={24}
                                    loop={true}
                                    pagination={{ clickable: true, el: '.skills-pagination', dynamicBullets: true }}
                                    autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                                    navigation={{
                                        nextEl: '.skills-swiper-next',
                                        prevEl: '.skills-swiper-prev',
                                    }}
                                    keyboard={{ enabled: true, onlyInViewport: true }}
                                    breakpoints={{
                                        768: { slidesPerView: 2, spaceBetween: 30 },
                                        1024: { slidesPerView: 3, spaceBetween: 40 }
                                    }}
                                    className="skills-swiper overflow-visible py-8 px-4 md:px-0"
                                >
                                    {categories.map((card, idx) => (
                                        <SwiperSlide key={idx} style={{ height: 'auto', boxSizing: 'border-box' }} className="!h-auto box-border">
                                            <div className="skill-card w-full h-full box-border flex flex-col relative p-8 md:p-10 rounded-3xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] hover:shadow-[var(--theme-shadow-strong)] shadow-[var(--theme-shadow)] transition-all duration-500 group overflow-hidden min-h-[380px]">
                                                
                                                {/* Top Glow Highlight */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--theme-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                
                                                {/* Card Header */}
                                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                                    <div className="w-16 h-16 flex items-center justify-center bg-[var(--theme-accent-soft)] border border-[var(--theme-border-gold)] rounded-2xl text-2xl text-[var(--theme-accent)] group-hover:scale-110 group-hover:bg-[var(--theme-accent)] group-hover:text-[var(--theme-bg)] transition-all duration-500 flex-shrink-0">
                                                        {card.icon?.trim().toLowerCase() === 'simicrosoftazure' ? (
                                                            <SiMicrosoftazure />
                                                        ) : (
                                                            <i className={card.icon}></i>
                                                        )}
                                                    </div>
                                                    <div className="text-left rtl:text-right" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                        <h3 className="text-xl md:text-2xl font-bold text-[var(--theme-text)] mb-1 tracking-tight leading-tight">{language === 'ar' ? (card.titleAr || t(card.title)) : card.title}</h3>
                                                        <p className="text-[10px] md:text-xs font-mono text-[var(--theme-accent)] tracking-widest uppercase">{card.skills.length} {t('Core Tools')}</p>
                                                    </div>
                                                </div>

                                                {/* Progress Bars */}
                                                <div className="space-y-6 relative z-10 flex-grow flex flex-col justify-end">
                                                    {card.skills.map((metric, midx) => (
                                                        <div key={midx} className="skill-item group/item">
                                                            <div className="flex justify-between items-end mb-2.5">
                                                                <span className="text-[var(--theme-text-secondary)] font-medium text-sm group-hover/item:text-[var(--theme-text)] transition-colors text-left rtl:text-right w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? (metric.nameAr || t(metric.name)) : metric.name}</span>
                                                                <span className="text-[var(--theme-accent-hover)] font-bold font-mono text-sm">{metric.percent}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-[var(--theme-border)] rounded-full overflow-hidden">
                                                                <div 
                                                                    className="skill-progress-bar h-full bg-gradient-to-r from-[var(--theme-accent-hover)] to-[var(--theme-accent)] rounded-full relative"
                                                                    style={{ width: `${metric.percent}%` }}
                                                                >
                                                                    {/* Glow tip */}
                                                                    <div className="absolute top-0 right-0 bottom-0 w-6 bg-white opacity-30 blur-[2px] rounded-full"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Background Subtle Gradient */}
                                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--theme-accent)] opacity-[0.03] blur-3xl rounded-full group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"></div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            
                            {/* Pagination */}
                            <div className="skills-pagination mt-10 flex justify-center gap-2"></div>
                        </div>
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .skills-pagination .swiper-pagination-bullet {
                    background: var(--theme-border-strong);
                    opacity: 1;
                    transition: all 0.3s ease;
                    width: 8px;
                    height: 8px;
                }
                .skills-pagination .swiper-pagination-bullet-active {
                    background: var(--theme-accent);
                    width: 24px;
                    border-radius: 4px;
                }
            ` }} />
        </section>
    );
};

export default Skills;
