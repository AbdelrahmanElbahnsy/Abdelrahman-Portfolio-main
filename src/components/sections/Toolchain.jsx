import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

const toolchain = {
    row1: [
        { name: 'Docker', icon: 'fab fa-docker' },
        { name: 'Kubernetes', icon: 'fas fa-dharmachakra' },
        { name: 'Terraform', icon: 'fas fa-code' },
        { name: 'Jenkins', icon: 'fab fa-jenkins' },
        { name: 'GitHub Actions', icon: 'fab fa-github' },
        { name: 'GitLab CI', icon: 'fab fa-gitlab' },
        { name: 'ArgoCD', icon: 'fas fa-ship' },
    ],
    row2: [
        { name: 'AWS', icon: 'fab fa-aws' },
        { name: 'Azure', icon: 'fab fa-microsoft' },
        { name: 'Linux', icon: 'fab fa-linux' },
        { name: 'Ansible', icon: 'fas fa-cogs' },
        { name: 'Prometheus', icon: 'fas fa-chart-line' },
        { name: 'Grafana', icon: 'fas fa-chart-pie' },
        { name: 'ELK Stack', icon: 'fas fa-database' },
    ]
};

gsap.registerPlugin(ScrollTrigger);

const Toolchain = () => {
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
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[rgba(200,162,110,0.05)] border border-[rgba(200,162,110,0.1)]">
                        <i className="fas fa-briefcase text-[var(--clr-accent)]"></i>
                        <span className="text-sm font-bold tracking-wider uppercase text-[var(--clr-accent)]">DevOps Toolchain</span>
                    </div>
                </div>
            </div>

            <div className="toolchain-wrapper flex flex-col gap-6 mask-edges">
                <Swiper
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
                            <div className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-[var(--clr-accent)] hover:bg-[rgba(200,162,110,0.05)] transition-all duration-300 group cursor-grab active:cursor-grabbing">
                                <i className={`${tool.icon} text-xl text-[var(--clr-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap">{tool.name}</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <Swiper
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
                            <div className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-[var(--clr-accent)] hover:bg-[rgba(200,162,110,0.05)] transition-all duration-300 group cursor-grab active:cursor-grabbing">
                                <i className={`${tool.icon} text-xl text-[var(--clr-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap">{tool.name}</span>
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
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .tool-card:hover {
                    box-shadow: 0 0 20px rgba(200, 162, 110, 0.2);
                    transform: translateY(-5px);
                }
                .light-theme .tool-card {
                    background: rgba(255, 255, 255, 0.8);
                    border-color: rgba(0,0,0,0.05);
                    color: #333;
                }
                .light-theme .bg-\\[rgba\\(10\\,10\\,10\\,0\\.3\\)\\] {
                    background: rgba(0,0,0,0.02);
                }
            ` }} />
        </section>
    );
};

export default Toolchain;
