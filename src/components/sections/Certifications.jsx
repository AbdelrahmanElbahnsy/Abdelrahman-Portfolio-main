import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { certifications as fallbackCertifications } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useLanguage } from '../../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Certifications = () => {
    const { t, language } = useLanguage();
    const { data: firestoreData, loading, error, subscribe } = useFirestoreCrud('certifications', { orderByField: 'order', orderDirection: 'asc' });

    React.useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);

    const certifications = React.useMemo(() => {
        if (!firestoreData) return [];
        return firestoreData.map(cert => {
            const fallbackMatch = fallbackCertifications.find(c => c.title === cert.title);
            return {
                ...cert,
                icon: cert.icon || (fallbackMatch ? fallbackMatch.icon : 'fas fa-certificate')
            };
        });
    }, [firestoreData]);

    const sectionRef = useRef(null);
    const headerRef = useRef(null);

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

    return (
        <section id="certifications" className="section bg-transparent relative overflow-hidden" ref={sectionRef}>
            <div className="container mx-auto px-4 md:px-8">
                
                {/* Center Header */}
                <div ref={headerRef} className="section-header text-center mb-16 max-w-2xl mx-auto">
                    <span className="section-subtitle text-[var(--theme-accent)] font-mono uppercase tracking-widest text-sm mb-4 block">
                        {t('Validation')}
                    </span>
                    <h2 className="section-title text-4xl sm:text-5xl font-black mb-6 leading-tight tracking-tight drop-shadow-md text-[var(--theme-text)]">
                        {t('Professional Certifications')}
                    </h2>
                    <p className="text-[var(--theme-text-secondary)] text-lg leading-relaxed">
                        {t('Recognized industry credentials that validate my expertise in cloud architecture, system administration, and networking.')}
                    </p>
                </div>

                {/* 3D Coverflow Swiper or States */}
                <div className="w-full relative px-4 sm:px-0 min-h-[400px] flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center text-[var(--theme-accent)]">
                            <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
                            <p>{t('Loading certifications...')}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                            <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                            <p>{t('Failed to load certifications')}</p>
                            <p className="text-sm opacity-80 mt-2">{error}</p>
                        </div>
                    ) : certifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-[var(--theme-text-muted)] bg-[var(--theme-surface)] p-8 rounded-3xl border border-[var(--theme-border)] shadow-inner">
                            <i className="fas fa-folder-open text-4xl mb-4 opacity-50"></i>
                            <p>{t('No certifications found.')}</p>
                        </div>
                    ) : (
                        <Swiper
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            key={language}
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={'auto'}
                            loop={true}
                            coverflowEffect={{
                                rotate: 0,
                                stretch: 0,
                                depth: 200,
                                modifier: 1.5,
                                slideShadows: false,
                            }}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            pagination={{
                                el: '.certs-pagination',
                                clickable: true,
                            }}
                            navigation={{
                                prevEl: '.certs-prev',
                                nextEl: '.certs-next',
                            }}
                            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
                            className="certs-3d-swiper w-full pt-10 pb-16 !overflow-visible"
                        >
                            {[...certifications, ...certifications].map((cert, idx) => (
                                <SwiperSlide key={idx} className="cert-slide">
                                    {({ isActive }) => (
                                        <div className={`w-full h-full relative p-5 md:p-8 rounded-3xl border transition-all duration-700 flex flex-col justify-between overflow-hidden group
                                            ${isActive 
                                                ? 'bg-[var(--theme-surface-elevated)] border-[var(--theme-accent)] shadow-[var(--theme-shadow-strong)] backdrop-blur-xl z-10' 
                                                : 'bg-[var(--theme-surface)] border-[var(--theme-border)] shadow-[var(--theme-shadow)] opacity-50 backdrop-blur-md'
                                            }`}
                                        >
                                            {/* Background Glow */}
                                            <div className={`absolute -inset-20 bg-gradient-to-b from-[var(--theme-accent)] to-transparent opacity-[0.03] blur-3xl pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-[0.08]' : 'opacity-0'}`}></div>

                                            {/* Top Section */}
                                            <div>
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="w-16 h-16 rounded-2xl bg-[var(--theme-accent-soft)] border border-[var(--theme-border-gold)] flex items-center justify-center text-3xl text-[var(--theme-accent)] shadow-inner">
                                                        {cert.icon === 'SiMicrosoftazure' ? <SiMicrosoftazure /> : <i className={cert.icon}></i>}
                                                    </div>
                                                    <div className="px-3 py-1 bg-[var(--theme-accent-soft)] border border-[var(--theme-border-gold)] text-[var(--theme-accent)] text-[9px] font-black uppercase tracking-widest rounded-full">
                                                        {t('Verified')}
                                                    </div>
                                                </div>

                                                <h3 className={`text-2xl font-black mb-3 leading-tight tracking-tight transition-colors duration-500 ${isActive ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-secondary)]'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                    {language === 'ar' ? (cert.titleAr || t(cert.title)) : cert.title}
                                                </h3>
                                                
                                                <p className="text-sm font-medium text-[var(--theme-accent)] opacity-80 mb-6 uppercase tracking-wider" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                    {language === 'ar' ? (cert.issuerAr || t(cert.issuer)) : cert.issuer}
                                                </p>
                                            </div>

                                            {/* Bottom Section */}
                                            <div className="mt-auto relative z-10">
                                                <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--theme-border-strong)] to-transparent mb-6 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                                                
                                                <a
                                                    href={cert.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all duration-300
                                                        ${isActive 
                                                            ? 'bg-[var(--theme-accent)] text-[var(--theme-btn-text)] hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_0_20px_var(--theme-accent-soft)] pointer-events-auto' 
                                                            : 'bg-transparent text-[var(--theme-text-muted)] border border-[var(--theme-border)] pointer-events-none'
                                                        }`}
                                                >
                                                    <span>{t('View Credentials')}</span>
                                                    <i className="fas fa-arrow-right text-xs rtl:rotate-180"></i>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-center gap-4 md:gap-8 mt-4 relative z-20">
                        <button className="certs-prev w-10 h-10 md:w-12 md:h-12 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] backdrop-blur-md flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:border-[var(--theme-accent)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none group shrink-0">
                            <i className="fas fa-chevron-left text-sm group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform rtl:rotate-180"></i>
                        </button>
                        
                        <div className="certs-pagination flex items-center justify-center gap-1 md:gap-2 min-w-[80px] md:min-w-[100px] flex-wrap"></div>
                        
                        <button className="certs-next w-10 h-10 md:w-12 md:h-12 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] backdrop-blur-md flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:border-[var(--theme-accent)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none group shrink-0">
                            <i className="fas fa-chevron-right text-sm group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform rtl:rotate-180"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .cert-slide {
                    width: 280px !important;
                    max-width: 90vw !important;
                    height: 380px !important;
                }
                @media (min-width: 380px) {
                    .cert-slide {
                        width: 320px !important;
                    }
                }
                @media (min-width: 768px) {
                    .cert-slide {
                        width: 450px !important;
                        height: 400px !important;
                    }
                }
                .certs-3d-swiper .swiper-slide {
                    background-position: center;
                    background-size: cover;
                }
                .certs-pagination .swiper-pagination-bullet {
                    background: var(--theme-border-strong);
                    opacity: 1;
                    transition: all 0.3s ease;
                    width: 8px;
                    height: 8px;
                    margin: 0 4px !important;
                }
                .certs-pagination .swiper-pagination-bullet-active {
                    background: var(--theme-accent);
                    width: 24px;
                    border-radius: 4px;
                    box-shadow: 0 0 10px var(--theme-accent-soft);
                }
            ` }} />
        </section>
    );
};

export default Certifications;
