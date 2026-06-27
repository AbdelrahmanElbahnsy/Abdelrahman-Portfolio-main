import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { certifications } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';

const Certifications = () => {
    return (
        <section id="certifications" className="section">
            <div className="container mx-auto px-8">
                <div className="section-header animate-up text-center mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">Validation</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black mb-4">Professional Certifications</h2>
                </div>

                <div className="certs-swiper-container pb-12 pt-4">
                    <div className="relative group/carousel">
                        {/* Navigation Arrows */}
                        <button 
                            className="certs-swiper-prev absolute left-2 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(0,210,255,0.4)] bg-[rgba(10,15,30,0.75)] backdrop-blur-md text-[rgba(0,210,255,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(0,210,255,0.25)] hover:shadow-[0_0_20px_rgba(0,210,255,0.55)] focus:outline-none cursor-pointer"
                            aria-label="Previous slide"
                        >
                            <i className="fas fa-chevron-left text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(0,210,255,0.4)]"></i>
                        </button>
                        <button 
                            className="certs-swiper-next absolute right-2 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(0,210,255,0.4)] bg-[rgba(10,15,30,0.75)] backdrop-blur-md text-[rgba(0,210,255,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(0,210,255,0.25)] hover:shadow-[0_0_20px_rgba(0,210,255,0.55)] focus:outline-none cursor-pointer"
                            aria-label="Next slide"
                        >
                            <i className="fas fa-chevron-right text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(0,210,255,0.4)]"></i>
                        </button>

                        <Swiper
                            modules={[Pagination, Autoplay, Navigation, Keyboard]}
                            slidesPerView={1}
                            spaceBetween={20}
                            loop={true}
                            pagination={{ clickable: true, el: '.certs-pagination' }}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            navigation={{
                                nextEl: '.certs-swiper-next',
                                prevEl: '.certs-swiper-prev',
                            }}
                            keyboard={{ enabled: true, onlyInViewport: true }}
                            breakpoints={{
                                768: { slidesPerView: 2, spaceBetween: 30 },
                                1024: { slidesPerView: 3, spaceBetween: 40 }
                            }}
                            className="certs-swiper !overflow-visible px-14 md:px-0"
                        >
                            {certifications.map((cert, idx) => (
                                <SwiperSlide key={idx} className="!h-auto">
                                    <div className="cert-card card h-full bg-[var(--clr-card-bg)] border border-[var(--clr-card-border)] p-8 rounded-2xl group hover:border-[var(--clr-accent)] transition-all duration-300 relative overflow-hidden">
                                        <div className="cert-badge absolute top-4 right-4 px-3 py-1 bg-[var(--clr-accent)] text-black text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg">Verify</div>
                                        <div className="cert-icon text-4xl text-[var(--clr-accent)] mb-6 transition-transform duration-300 group-hover:scale-110">
                                            {cert.icon === 'SiMicrosoftazure' ? (
                                                <SiMicrosoftazure />
                                            ) : (
                                                <i className={cert.icon}></i>
                                            )}
                                        </div>
                                        <div className="cert-info">
                                            <h3 className="cert-title text-xl font-bold mb-2 group-hover:text-[var(--clr-accent)] transition-colors">{cert.title}</h3>
                                            <p className="cert-issuer text-sm text-[var(--clr-text-dim)] mb-6">{cert.issuer}</p>
                                            <a
                                                href={cert.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cert-link inline-flex items-center gap-2 text-[var(--clr-accent)] font-bold text-sm hover:gap-3 transition-all underline decoration-2 underline-offset-4"
                                            >
                                                View Certificate <i className="fas fa-external-link-alt"></i>
                                            </a>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <div className="certs-pagination mt-8 flex justify-center"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .certs-pagination .swiper-pagination-bullet {
                    background: var(--clr-text-dim);
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }
                .certs-pagination .swiper-pagination-bullet-active {
                    background: var(--clr-accent);
                    opacity: 1;
                    width: 25px;
                    border-radius: 5px;
                }
                .cert-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at top right, rgba(0, 210, 255, 0.05), transparent 70%);
                    pointer-events: none;
                }
            ` }} />
        </section>
    );
};

export default Certifications;
