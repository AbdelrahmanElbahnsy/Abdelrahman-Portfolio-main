import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { toolchain } from '../../data/portfolioData';
import { useLanguage } from '../../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Toolchain = () => {
    const { t } = useLanguage();
    const { row1, row2 } = toolchain;
    const sectionRef = useRef(null);
    const headerRef = useRef(null);

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
        },
        { scope: sectionRef }
    );

    return (
        <section id="toolchain" className="section relative overflow-hidden bg-[rgba(10,10,10,0.3)]" ref={sectionRef}>
            <div className="container mx-auto px-8 mb-12">
                <div ref={headerRef} className="section-header text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[var(--theme-accent-soft)] border border-[var(--theme-border-gold)]">
                        <i className="fas fa-briefcase text-[var(--theme-accent)]"></i>
                        <span className="text-sm font-bold tracking-wider uppercase text-[var(--theme-accent)]">{t('DevOps Toolchain')}</span>
                    </div>
                </div>
            </div>

            <div className="toolchain-wrapper flex flex-col gap-6 mask-edges">
                <Swiper
                    dir="ltr"
                    modules={[Autoplay]}
                    spaceBetween={24}
                    slidesPerView={'auto'}
                    loop={true}
                    speed={4000}
                    allowTouchMove={true}
                    grabCursor={true}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    className="toolchain-swiper w-full !py-4"
                >
                    {[...row1, ...row1, ...row1].map((tool, idx) => (
                        <SwiperSlide key={`r1-${idx}`} className="!w-auto">
                            <div className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] transition-all duration-300 group cursor-grab active:cursor-grabbing">
                                <i className={`${tool.icon} text-xl text-[var(--theme-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap text-[var(--theme-text)]">{tool.name}</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <Swiper
                    dir="ltr"
                    modules={[Autoplay]}
                    spaceBetween={24}
                    slidesPerView={'auto'}
                    loop={true}
                    speed={4000}
                    allowTouchMove={true}
                    grabCursor={true}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                        reverseDirection: true,
                    }}
                    className="toolchain-swiper w-full !py-4"
                >
                    {[...row2, ...row2, ...row2].map((tool, idx) => (
                        <SwiperSlide key={`r2-${idx}`} className="!w-auto">
                            <div className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] transition-all duration-300 group cursor-grab active:cursor-grabbing">
                                <i className={`${tool.icon} text-xl text-[var(--theme-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap text-[var(--theme-text)]">{tool.name}</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .mask-edges {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
                .toolchain-swiper .swiper-wrapper {
                    transition-timing-function: linear !important;
                }
                .tool-card {
                    box-shadow: var(--theme-shadow);
                }
                .tool-card:hover {
                    box-shadow: var(--theme-shadow-strong);
                    transform: translateY(-5px);
                }
            ` }} />
        </section>
    );
};

export default Toolchain;
