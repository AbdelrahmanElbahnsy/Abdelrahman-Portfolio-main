import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { skills } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';

const Skills = () => {
    const sectionRef = useRef(null);
    const { subtitle, title, description, circularSkills, categories } = skills;

    useEffect(() => {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.circular-skill-item');
                    items.forEach((item, idx) => {
                        setTimeout(() => {
                            item.classList.add('reveal');
                            const circle = item.querySelector('.progress-ring-circle');
                            const percent = parseFloat(item.dataset.percent || '0');
                            const radius = circle.r.baseVal.value;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (percent / 100) * circumference;
                            circle.style.strokeDashoffset = offset;
                        }, idx * 180);
                    });
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        if (sectionRef.current) {
            skillsObserver.observe(sectionRef.current);
        }

        return () => skillsObserver.disconnect();
    }, []);

    return (
        <section id="skills" className="section" ref={sectionRef}>
            <div className="container mx-auto px-8">
                <div className="section-header animate-up text-center mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{subtitle}</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black mb-4">{title}</h2>
                    <p className="section-desc text-[var(--clr-text-dim)] max-w-2xl mx-auto">{description}</p>
                </div>

                <div className="skills-circular-row flex flex-wrap justify-center gap-12 mb-20">
                    {circularSkills.map((skill, idx) => (
                        <div key={idx} className="circular-skill-item group" data-percent={skill.percent}>
                            <div className="circle-box relative w-[120px] h-[120px] flex items-center justify-center">
                                <svg className="progress-ring rotate-[-90deg]" width="120" height="120">
                                    <circle className="progress-ring-bg" cx="60" cy="60" r="54" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle className="progress-ring-circle transition-all duration-1000 ease-out" cx="60" cy="60" r="54" fill="transparent" stroke="var(--clr-accent)" strokeWidth="8" strokeDasharray="339.292" strokeDashoffset="339.292" />
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
                            className="skills-swiper-prev absolute left-2 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(0,210,255,0.4)] bg-[rgba(10,15,30,0.75)] backdrop-blur-md text-[rgba(0,210,255,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(0,210,255,0.25)] hover:shadow-[0_0_20px_rgba(0,210,255,0.55)] focus:outline-none cursor-pointer"
                            aria-label="Previous slide"
                        >
                            <i className="fas fa-chevron-left text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(0,210,255,0.4)]"></i>
                        </button>
                        <button 
                            className="skills-swiper-next absolute right-2 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(0,210,255,0.4)] bg-[rgba(10,15,30,0.75)] backdrop-blur-md text-[rgba(0,210,255,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(0,210,255,0.25)] hover:shadow-[0_0_20px_rgba(0,210,255,0.55)] focus:outline-none cursor-pointer"
                            aria-label="Next slide"
                        >
                            <i className="fas fa-chevron-right text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(0,210,255,0.4)]"></i>
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
                                            <div className="skill-card-icon w-12 h-12 flex items-center justify-center bg-[rgba(0,210,255,0.1)] rounded-lg text-2xl text-[var(--clr-accent)]">
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
                                                            className="skill-progress-bar h-full bg-[var(--clr-accent)] transition-all duration-1000 ease-in-out"
                                                            style={{ width: '0%', '--target-width': `${metric.percent}%` }}
                                                            ref={(el) => {
                                                                if (el) {
                                                                    const observer = new IntersectionObserver((entries) => {
                                                                        if (entries[0].isIntersecting) {
                                                                            el.style.width = el.style.getPropertyValue('--target-width');
                                                                            observer.disconnect();
                                                                        }
                                                                    });
                                                                    observer.observe(el);
                                                                }
                                                            }}
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
