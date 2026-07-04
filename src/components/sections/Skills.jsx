import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { skills } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';

const Skills = () => {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const circularRef = useRef(null);
    const { subtitle, title, description, circularSkills, categories } = skills;

    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const descEl = headerRef.current?.querySelector('.section-desc');
            const skillItems = circularRef.current?.querySelectorAll('.circular-skill-item');

            gsap.set([subtitleEl, titleEl, descEl].filter(Boolean), { opacity: 0, y: 30 });
            if (skillItems?.length) gsap.set(skillItems, { opacity: 0, y: 20, scale: 0.85 });

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
              .to(descEl, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')

            if (skillItems?.length) {
                tl.to(skillItems, {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.5, stagger: 0.08,
                    ease: 'back.out(1.4)',
                    onComplete: () => {
                        skillItems.forEach((item, idx) => {
                            const circle = item.querySelector('.progress-ring-circle');
                            const percent = parseFloat(item.dataset.percent || '0');
                            const radius = circle?.r?.baseVal?.value || 54;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (percent / 100) * circumference;
                            if (circle) {
                                gsap.to(circle, { strokeDashoffset: offset, duration: 0.8, delay: idx * 0.06, ease: 'power3.out' });
                            }
                        });
                    },
                }, '-=0.1');
            }

            const progressBars = sectionRef.current?.querySelectorAll('.skill-progress-bar');
            if (progressBars?.length) {
                progressBars.forEach((bar) => {
                    const targetWidth = bar.style.getPropertyValue('--target-width');
                    gsap.to(bar, {
                        width: targetWidth, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: { trigger: bar, start: 'top 90%', toggleActions: 'play none none none' },
                    });
                });
            }
        },
        { scope: sectionRef, dependencies: [] },
    );

    return (
        <section id="skills" className="section" ref={sectionRef}>
            <div className="container mx-auto px-8">
                <div ref={headerRef} className="section-header text-center mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{subtitle}</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black mb-4">{title}</h2>
                    <p className="section-desc text-[var(--clr-text-dim)] max-w-2xl mx-auto">{description}</p>
                </div>

                <div ref={circularRef} className="skills-circular-row flex flex-wrap justify-center gap-12 mb-20">
                    {circularSkills.map((skill, idx) => (
                        <div key={idx} className="circular-skill-item group" data-percent={skill.percent}>
                            <div className="circle-box relative w-[120px] h-[120px] flex items-center justify-center">
                                <svg className="progress-ring rotate-[-90deg]" width="120" height="120">
                                    <circle className="progress-ring-bg" cx="60" cy="60" r="54" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle className="progress-ring-circle transition-none" cx="60" cy="60" r="54" fill="transparent" stroke="var(--clr-accent)" strokeWidth="8" strokeDasharray="339.292" strokeDashoffset="339.292" />
                                </svg>
                                <div className="skill-icon absolute text-3xl text-[var(--clr-accent)] transition-transform duration-300 group-hover:scale-125 flex items-center justify-center">
                                    {skill.icon === 'SiMicrosoftazure' ? (
                                        <SiMicrosoftazure />
                                    ) : (
                                        <i className={skill.icon}></i>
                                    )}
                                </div>
                            </div>
                            <div className="skill-info-circular text-center mt-4">
                                <h4 className="text-lg font-bold">{skill.label}</h4>
                                <p className="text-xs text-[var(--clr-text-dim)]">{skill.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="skills-swiper-container pb-12 pt-4">
                    <div className="relative group/carousel">
                        {/* Navigation Arrows */}
                        <button 
                            className="skills-swiper-prev absolute left-2 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(200,162,110,0.4)] bg-[rgba(10,15,30,0.75)] backdrop-blur-md text-[rgba(200,162,110,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(200,162,110,0.25)] hover:shadow-[0_0_20px_rgba(200,162,110,0.55)] focus:outline-none cursor-pointer"
                            aria-label="Previous slide"
                        >
                            <i className="fas fa-chevron-left text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(200,162,110,0.4)]"></i>
                        </button>
                        <button 
                            className="skills-swiper-next absolute right-2 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(200,162,110,0.4)] bg-[rgba(10,15,30,0.75)] backdrop-blur-md text-[rgba(200,162,110,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(200,162,110,0.25)] hover:shadow-[0_0_20px_rgba(200,162,110,0.55)] focus:outline-none cursor-pointer"
                            aria-label="Next slide"
                        >
                            <i className="fas fa-chevron-right text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(200,162,110,0.4)]"></i>
                        </button>

                        <Swiper
                            modules={[Pagination, Autoplay, Navigation, Keyboard]}
                            slidesPerView={1}
                            spaceBetween={20}
                            loop={true}
                            pagination={{ clickable: true, el: '.skills-pagination' }}
                            autoplay={{ delay: 3500, disableOnInteraction: false }}
                            navigation={{
                                nextEl: '.skills-swiper-next',
                                prevEl: '.skills-swiper-prev',
                            }}
                            keyboard={{ enabled: true, onlyInViewport: true }}
                            breakpoints={{
                                768: { slidesPerView: 2, spaceBetween: 30 },
                                1024: { slidesPerView: 3, spaceBetween: 40 }
                            }}
                            className="skills-swiper !overflow-visible px-14 md:px-0"
                        >
                            {categories.map((card, idx) => (
                                <SwiperSlide key={idx} className="!h-auto">
                                    <div className="skill-card card h-full border border-[var(--clr-card-border)] bg-[var(--clr-card-bg)] backdrop-blur-md p-8 rounded-xl hover:border-[var(--clr-accent)] transition-all duration-300">
                                        <div className="skill-card-header flex items-center gap-4 mb-6">
                                            <div className="skill-card-icon w-12 h-12 flex items-center justify-center bg-[rgba(200,162,110,0.1)] rounded-lg text-2xl text-[var(--clr-accent)]">
                                                <i className={card.icon}></i>
                                            </div>
                                            <div>
                                                <h3 className="skill-card-title text-xl font-bold">{card.title}</h3>
                                                <p className="skill-card-subtitle text-xs text-[var(--clr-text-dim)] uppercase tracking-wider">{card.skills.length} Tools</p>
                                            </div>
                                        </div>
                                        <div className="skill-card-body space-y-4">
                                            {card.skills.map((metric, midx) => (
                                                <div key={midx} className="skill-item">
                                                    <div className="skill-metric flex justify-between text-sm mb-1">
                                                        <span className="skill-metric-label text-[var(--clr-text-dim)]">{metric.name}</span>
                                                        <span className="skill-metric-percent font-bold">{metric.percent}%</span>
                                                    </div>
                                                    <div className="skill-progress h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                                        <div
                                                            className="skill-progress-bar h-full bg-[var(--clr-accent)] rounded-full"
                                                            style={{ width: '0%', '--target-width': `${metric.percent}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <div className="skills-pagination mt-8 flex justify-center"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .circular-skill-item .circle-box {
                    transition: transform 0.3s ease;
                }
                .circular-skill-item:hover .circle-box {
                    transform: scale(1.05);
                }
                .skills-pagination .swiper-pagination-bullet {
                    background: var(--clr-text-dim);
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }
                .skills-pagination .swiper-pagination-bullet-active {
                    background: var(--clr-accent);
                    opacity: 1;
                    width: 25px;
                    border-radius: 5px;
                }
            ` }} />
        </section>
    );
};

export default Skills;
