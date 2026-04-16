import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Certifications = () => {
    const certs = [
        {
            title: 'CCNA (Routing & Switching)',
            issuer: 'Consulting of Computers and Information Center (CCIC)',
            icon: 'fas fa-network-wired',
            link: 'https://drive.google.com/file/d/1eisVglyMk12N8-BPqTaJNZzSTrPgruFj/view?usp=sharing'
        },
        {
            title: 'Cloud Architect',
            issuer: 'NTI & ITIDA',
            icon: 'fas fa-cloud',
            link: 'https://drive.google.com/file/d/1hJR7neWsEc0Ble6z2B_6hS1IeK-2we9-/view?usp=sharing'
        },
        {
            title: 'Red Hat System Administration',
            issuer: 'ITI & Mahara-Tech',
            icon: 'fab fa-redhat',
            link: 'https://drive.google.com/file/d/1-SEl_MdCC-phWbBFFmqt8Bvq3xlzgGmA/view?usp=sharing'
        },
        {
            title: 'Introduction to AWS Cloud',
            issuer: 'Udacity',
            icon: 'fab fa-aws',
            link: 'https://drive.google.com/file/d/17_5Cnal4OirWlMQ-bNDXvQ1VeIBFM9Gn/view?usp=sharing'
        },
        {
            title: 'Cloud Platform Job Simulation',
            issuer: 'Forage (Verizon Collaboration)',
            icon: 'fas fa-laptop-code',
            link: 'https://drive.google.com/file/d/1XlUoaxBmO_QXthSftTze-Bz5vlVK1hdE/view?usp=sharing'
        }
    ];

    return (
        <section id="certifications" className="section">
            <div className="container mx-auto px-8">
                <div className="section-header animate-up text-center mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">Validation</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black mb-4">Professional Certifications</h2>
                </div>

                <div className="certs-swiper-container pb-12 pt-4">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={true}
                        pagination={{ clickable: true, el: '.certs-pagination' }}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            768: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 40 }
                        }}
                        className="certs-swiper !overflow-visible"
                    >
                        {certs.map((cert, idx) => (
                            <SwiperSlide key={idx} className="!h-auto">
                                <div className="cert-card card h-full bg-[var(--clr-card-bg)] border border-[var(--clr-card-border)] p-8 rounded-2xl group hover:border-[var(--clr-accent)] transition-all duration-300 relative overflow-hidden">
                                    <div className="cert-badge absolute top-4 right-4 px-3 py-1 bg-[var(--clr-accent)] text-black text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg">Verify</div>
                                    <div className="cert-icon text-4xl text-[var(--clr-accent)] mb-6 transition-transform duration-300 group-hover:scale-110">
                                        <i className={cert.icon}></i>
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
