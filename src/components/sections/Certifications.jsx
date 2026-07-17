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
import { certifications } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

const Certifications = () => {
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
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-4 block">
                        Validation
                    </span>
                    <h2 className="section-title text-4xl sm:text-5xl font-black mb-6 leading-tight tracking-tight drop-shadow-md">
                        Professional Certifications
                    </h2>
                    <p className="text-[var(--clr-text-dim)] text-lg leading-relaxed">
                        Recognized industry credentials that validate my expertise in cloud architecture, system administration, and networking.
                    </p>
                </div>

                {/* 3D Coverflow Swiper */}
                <div className="w-full relative px-4 sm:px-0">
                    <Swiper
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
                                    <div className={`w-full h-full relative p-8 rounded-3xl border transition-all duration-700 flex flex-col justify-between overflow-hidden group
                                        ${isActive 
                                            ? 'bg-[rgba(15,20,35,0.85)] border-[var(--clr-accent)] shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(200,162,110,0.2)] backdrop-blur-xl z-10' 
                                            : 'bg-[rgba(10,15,25,0.6)] border-[rgba(255,255,255,0.05)] shadow-[0_15px_30px_rgba(0,0,0,0.4)] opacity-50 backdrop-blur-md'
                                        }`}
                                    >
                                        {/* Background Glow */}
                                        <div className={`absolute -inset-20 bg-gradient-to-b from-[var(--clr-accent)] to-transparent opacity-[0.03] blur-3xl pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-[0.08]' : 'opacity-0'}`}></div>

                                        {/* Top Section */}
                                        <div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-3xl text-[var(--clr-accent)] shadow-inner">
                                                    {cert.icon === 'SiMicrosoftazure' ? <SiMicrosoftazure /> : <i className={cert.icon}></i>}
                                                </div>
                                                <div className="px-3 py-1 bg-[rgba(200,162,110,0.1)] border border-[rgba(200,162,110,0.2)] text-[var(--clr-accent)] text-[9px] font-black uppercase tracking-widest rounded-full">
                                                    Verified
                                                </div>
                                            </div>

                                            <h3 className={`text-2xl font-black mb-3 leading-tight tracking-tight transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                {cert.title}
                                            </h3>
                                            
                                            <p className="text-sm font-medium text-[var(--clr-accent)] opacity-80 mb-6 uppercase tracking-wider">
                                                {cert.issuer}
                                            </p>
                                        </div>

                                        {/* Bottom Section */}
                                        <div className="mt-auto relative z-10">
                                            <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent mb-6 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                                            
                                            <a
                                                href={cert.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all duration-300
                                                    ${isActive 
                                                        ? 'bg-[var(--clr-accent)] text-black hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(200,162,110,0.4)] pointer-events-auto' 
                                                        : 'bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.05)] pointer-events-none'
                                                    }`}
                                            >
                                                <span>View Credentials</span>
                                                <i className="fas fa-arrow-right text-xs"></i>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-center gap-8 mt-4 relative z-20">
                        <button className="certs-prev w-12 h-12 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(10,15,25,0.8)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--clr-accent)] hover:text-black hover:border-[var(--clr-accent)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none group">
                            <i className="fas fa-chevron-left text-sm group-hover:-translate-x-0.5 transition-transform"></i>
                        </button>
                        
                        <div className="certs-pagination flex items-center justify-center gap-2 min-w-[100px]"></div>
                        
                        <button className="certs-next w-12 h-12 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(10,15,25,0.8)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--clr-accent)] hover:text-black hover:border-[var(--clr-accent)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none group">
                            <i className="fas fa-chevron-right text-sm group-hover:translate-x-0.5 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .cert-slide {
                    width: 340px !important;
                    height: 380px !important;
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
                    background: rgba(255,255,255,0.2);
                    opacity: 1;
                    transition: all 0.3s ease;
                    width: 8px;
                    height: 8px;
                    margin: 0 4px !important;
                }
                .certs-pagination .swiper-pagination-bullet-active {
                    background: var(--clr-accent);
                    width: 24px;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(200,162,110,0.5);
                }
            ` }} />
        </section>
    );
};

export default Certifications;
