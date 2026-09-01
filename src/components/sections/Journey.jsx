import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCreative, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-creative';
import { journey as defaultJourney } from '../../data/portfolioData';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useLanguage } from '../../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Journey = () => {
    const { t, language } = useLanguage();
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const [activePhase, setActivePhase] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState(null);
    
    const { data: firestoreData, loading, error, subscribe } = useFirestoreCrud('journey', { orderByField: 'order', orderDirection: 'asc' });

    React.useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);

    const rawSubtitle = defaultJourney.subtitle;
    const rawTitle = defaultJourney.title;
    const rawDescription = defaultJourney.description;

    const subtitle = language === 'ar' ? (defaultJourney.subtitleAr || rawSubtitle) : rawSubtitle;
    const title = language === 'ar' ? (defaultJourney.titleAr || rawTitle) : rawTitle;
    const description = language === 'ar' ? (defaultJourney.descriptionAr || rawDescription) : rawDescription;

    const phases = React.useMemo(() => {
        const dataToUse = (firestoreData && firestoreData.length > 0) ? firestoreData : defaultJourney.phases;
        return dataToUse.map((doc, idx) => {
            const defaultPhase = defaultJourney.phases.find(p => p.title === doc.title) || defaultJourney.phases[idx] || {};
            return {
                phase: doc.phase || doc.order || (idx + 1),
                title: doc.title || defaultPhase.title || '',
                description: doc.description || defaultPhase.description || '',
                titleAr: doc.titleAr || defaultPhase.titleAr || null,
                descriptionAr: doc.descriptionAr || defaultPhase.descriptionAr || null,
                tags: doc.technologies ? doc.technologies.split(',').map(t => t.trim()) : (doc.tags || defaultPhase.tags || [])
            };
        });
    }, [firestoreData]);

    // Header Animation
    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const descEl = headerRef.current?.querySelector('p');

            gsap.set([subtitleEl, titleEl, descEl].filter(Boolean), { opacity: 0, y: 30 });

            const headerTl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
            });

            headerTl
                .to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
                .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15')
                .to(descEl, { opacity: 1, y: 0, duration: 0.4 }, '-=0.15');
        },
        { scope: sectionRef }
    );

    const handleStepperClick = (idx) => {
        setActivePhase(idx);
        if (swiperInstance) {
            swiperInstance.slideTo(idx);
        }
    };

    return (
        <section id="journey" className="section bg-transparent relative overflow-hidden" ref={sectionRef}>
            <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start">
                    
                    {/* Left Column: Header & Interactive Tabs */}
                    <div className="w-full md:w-[35%] lg:w-[30%] shrink-0">
                        <div ref={headerRef} className="section-header text-left rtl:text-right mb-8 md:mb-12">
                            <span className="section-subtitle text-[var(--theme-accent)] font-mono uppercase tracking-widest text-sm mb-4 block">
                                {subtitle}
                            </span>
                            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight drop-shadow-md text-[var(--theme-text)]">
                                {title}
                            </h2>
                            <p className="text-[var(--theme-text-secondary)] text-lg leading-relaxed">
                                {description}
                            </p>
                        </div>
                        
                        {/* Interactive Tabs / Stepper */}
                        {!loading && !error && phases.length > 0 && (
                            <div className="relative pl-1 rtl:pl-0 rtl:pr-1 w-full max-w-full">
                                {/* Vertical Line (Desktop only) */}
                                <div className="hidden md:block absolute left-[7px] rtl:left-auto rtl:right-[7px] top-3 bottom-3 w-[2px] bg-[rgba(255,255,255,0.05)]"></div>
                                
                                <div className="flex overflow-x-auto md:overflow-visible md:flex-col gap-3 md:gap-6 relative z-10 pb-4 md:pb-0 w-full" style={{ scrollbarWidth: 'none' }}>
                                    {phases.map((phase, idx) => {
                                        const isActive = activePhase === idx;
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => handleStepperClick(idx)}
                                                className="stepper-item flex items-center gap-3 md:gap-5 group cursor-pointer shrink-0"
                                            >
                                                {/* Dot (Desktop only) */}
                                                <div className={`hidden md:block step-dot w-2 h-2 rounded-full origin-center transition-all duration-300 ${isActive ? 'bg-[var(--theme-accent)] scale-150 shadow-[0_0_15px_var(--theme-accent-soft)]' : 'bg-[var(--theme-border-strong)] group-hover:bg-[var(--theme-border-gold)]'}`}></div>
                                                
                                                {/* Text / Mobile Pill */}
                                                <div className={`step-text px-5 py-2.5 md:p-0 rounded-full md:rounded-none md:bg-transparent text-sm font-bold origin-left rtl:origin-right flex items-center transition-all duration-300 border md:border-transparent ${isActive ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)] md:bg-transparent text-[var(--theme-bg)] md:text-[var(--theme-text)] scale-[1.02] md:scale-105 md:translate-x-2 rtl:md:-translate-x-2 shadow-[0_0_15px_var(--theme-accent-soft)] md:shadow-none' : 'bg-[var(--theme-surface-elevated)] border-[var(--theme-border)] md:border-transparent md:bg-transparent text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-text)] group-hover:bg-[var(--theme-surface)] md:group-hover:bg-transparent'}`}>
                                                    <span className={`text-[10px] uppercase tracking-widest font-mono mr-2 rtl:mr-0 rtl:ml-2 md:mr-3 rtl:md:mr-0 rtl:md:ml-3 transition-opacity ${isActive ? 'opacity-80 md:opacity-100' : 'opacity-40'}`}>
                                                        0{phase.phase}
                                                    </span>
                                                    <span dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? (phase.titleAr || phase.title) : phase.title}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Swiper Carousel or States */}
                    <div className="w-full md:w-[65%] lg:w-[70%] pt-2 md:pt-10 relative">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center text-[var(--theme-accent)] min-h-[400px]">
                                <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
                                <p>{t('Loading journey...')}</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 min-h-[400px]">
                                <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                                <p>{t('Failed to load journey')}</p>
                                <p className="text-sm opacity-80 mt-2">{error}</p>
                            </div>
                        ) : (
                            <>
                                <Swiper
                                    dir="ltr"
                                    modules={[Navigation, EffectCreative, Autoplay]}
                                    onSwiper={setSwiperInstance}
                                    onSlideChange={(swiper) => setActivePhase(swiper.activeIndex)}
                                    centeredSlides={true}
                                    slidesPerView={1.2}
                                    spaceBetween={20}
                                    breakpoints={{
                                        768: {
                                            slidesPerView: 1.8,
                                            spaceBetween: 25
                                        },
                                        1024: {
                                            slidesPerView: 2.2,
                                            spaceBetween: 30
                                        }
                                    }}
                                    autoplay={{
                                        delay: 3500,
                                        disableOnInteraction: false,
                                    }}
                                    navigation={{
                                        prevEl: '.journey-prev',
                                        nextEl: '.journey-next',
                                    }}
                                    className="journey-swiper w-full !pb-8"
                                >
                                    {phases.map((phase, idx) => (
                                        <SwiperSlide key={idx} className="h-auto">
                                            {({ isActive }) => (
                                                <div className={`journey-card card h-fit md:h-full p-6 sm:p-10 border bg-[var(--theme-surface-elevated)] transition-all duration-700 rounded-3xl group relative overflow-hidden backdrop-blur-md 
                                                    ${isActive 
                                                        ? 'border-[var(--theme-accent)] shadow-[0_20px_50px_var(--theme-accent-soft)] scale-100 opacity-100' 
                                                        : 'border-[var(--theme-border)] scale-[0.9] opacity-60 cursor-pointer hover:opacity-100 hover:scale-95'}`}
                                                    onClick={() => {
                                                        if (!isActive && swiperInstance) {
                                                            swiperInstance.slideTo(idx);
                                                        }
                                                    }}
                                                >
                                                    
                                                    {/* Accent Glow Effect */}
                                                    <div className={`absolute top-0 right-0 rtl:right-auto rtl:left-0 w-64 h-64 bg-[var(--theme-accent)] rounded-full -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2 blur-3xl pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-[0.05]' : 'opacity-0'}`}></div>

                                                    <span className="text-[var(--theme-accent)] font-black text-[11px] uppercase tracking-[0.2em] mb-2 md:mb-4 block text-left rtl:text-right" dir="auto">
                                                        {t('PHASE')} {phase.phase}
                                                    </span>
                                                    
                                                    <h3 className={`text-2xl sm:text-3xl font-black mb-3 md:mb-5 tracking-tight transition-colors duration-500 text-left rtl:text-right ${isActive ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-secondary)]'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                        {language === 'ar' ? (phase.titleAr || phase.title) : phase.title}
                                                    </h3>
                                                    
                                                    <p className="text-base sm:text-lg text-[var(--theme-text-muted)] leading-relaxed mb-5 md:mb-8 line-clamp-4 md:line-clamp-none text-left rtl:text-right" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                        {language === 'ar' ? (phase.descriptionAr || phase.description) : phase.description}
                                                    </p>

                                                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3" dir="ltr">
                                                        {phase.tags.map((tag, tidx) => (
                                                            <span key={tidx} className={`flex items-center justify-center text-center w-full md:w-auto px-2 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-[var(--theme-surface)] border-[var(--theme-border-strong)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-border-gold)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-accent-soft)]' : 'bg-transparent border-[var(--theme-border)] text-[var(--theme-text-muted)] border'}`}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Custom Navigation Arrows (Centered horizontally below carousel) */}
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <button className="journey-prev w-12 h-12 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:border-[var(--theme-accent)] shadow-[var(--theme-shadow)] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed">
                                        <i className="fas fa-chevron-left text-sm rtl:rotate-180"></i>
                                    </button>
                                    <button className="journey-next w-12 h-12 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:border-[var(--theme-accent)] shadow-[var(--theme-shadow)] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed">
                                        <i className="fas fa-chevron-right text-sm rtl:rotate-180"></i>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .journey-swiper {
                    padding-top: 1rem;
                    padding-bottom: 2rem;
                }
                .swiper-slide {
                    display: flex;
                    height: auto;
                }
            ` }} />
        </section>
    );
};

export default Journey;
