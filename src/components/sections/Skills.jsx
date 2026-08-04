import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SiMicrosoftazure } from 'react-icons/si';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { transformSkills } from '../../cms/utils/transformSkills';

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const circularRef = useRef(null);
    const { data: firestoreData, loading, subscribe } = useFirestoreCrud('skills');
    
    // Subscribe to realtime updates on mount
    useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);

    const subtitle = 'Expertise';
    const title = 'Skills & Technologies';
    const description = 'A comprehensive toolkit for building and managing modern cloud infrastructure.';

    // Use Firestore data if available, otherwise empty state
    const { circularSkills, categories } = firestoreData && firestoreData.length > 0
        ? transformSkills(firestoreData)
        : { circularSkills: [], categories: [] };

    useGSAP(
        () => {
            if (loading) return; // Wait until loading is done
            
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
        { scope: sectionRef, dependencies: [circularSkills, categories, loading] }
    );

    return (
        <section id="skills" className="section relative !overflow-visible" ref={sectionRef}>
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div ref={headerRef} className="section-header text-center mb-12 md:mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-3 block">
                        {subtitle}
                    </span>
                    <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                        {title}
                    </h2>
                    <p className="section-desc text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Circular Skills Row */}
                <div ref={circularRef} className="skills-circular-row flex flex-wrap justify-center gap-10 md:gap-16 mb-24">
                    {circularSkills.map((skill, idx) => (
                        <div key={idx} className="circular-skill-item group flex flex-col items-center cursor-pointer" data-percent={skill.percent}>
                            <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center bg-[rgba(15,20,30,0.5)] rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.02)] group-hover:border-[rgba(200,162,110,0.3)] transition-colors duration-500">
                                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                                    {/* Background Circle */}
                                    <circle cx="50%" cy="50%" r="58" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                    {/* Progress Circle */}
                                    <circle className="progress-ring-circle transition-none" cx="50%" cy="50%" r="58" fill="transparent" stroke="var(--clr-accent)" strokeWidth="6" strokeDasharray="364.42" strokeDashoffset="364.42" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-2 md:inset-3 bg-[rgba(10,15,25,0.8)] rounded-full flex items-center justify-center z-10 shadow-[0_4px_15px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500">
                                    {skill.icon === 'SiMicrosoftazure' ? (
                                        <SiMicrosoftazure className="text-3xl md:text-4xl text-[var(--clr-accent)] group-hover:text-white transition-colors" />
                                    ) : (
                                        <i className={`${skill.icon} text-3xl md:text-4xl text-[var(--clr-accent)] group-hover:text-white transition-colors`}></i>
                                    )}
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 rounded-full bg-[var(--clr-accent)] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 pointer-events-none"></div>
                            </div>
                            <div className="text-center mt-6">
                                <h4 className="text-lg font-bold text-white group-hover:text-[var(--clr-accent)] transition-colors">{skill.label}</h4>
                                <p className="text-sm text-gray-500 mt-1">{skill.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Swiper Cards Section */}
                <div className="skills-swiper-container pt-4 px-2 md:px-16">
                    <div className="relative group/carousel">
                        {/* Custom Navigation Arrows for Better UX */}
                        <button 
                            className="skills-swiper-prev absolute top-auto -bottom-[68px] left-1/2 -translate-x-[120px] translate-y-0 md:top-1/2 md:bottom-auto md:-left-16 md:translate-x-0 md:-translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full border border-[rgba(200,162,110,0.2)] bg-[rgba(15,20,30,0.95)] text-[var(--clr-accent)] hover:bg-[var(--clr-accent)] hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg focus:outline-none cursor-pointer backdrop-blur-md"
                            aria-label="Previous slide"
                        >
                            <i className="fas fa-chevron-left text-xl"></i>
                        </button>
                        <button 
                            className="skills-swiper-next absolute top-auto -bottom-[68px] right-1/2 translate-x-[120px] translate-y-0 md:top-1/2 md:bottom-auto md:-right-16 md:translate-x-0 md:-translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full border border-[rgba(200,162,110,0.2)] bg-[rgba(15,20,30,0.95)] text-[var(--clr-accent)] hover:bg-[var(--clr-accent)] hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg focus:outline-none cursor-pointer backdrop-blur-md"
                            aria-label="Next slide"
                        >
                            <i className="fas fa-chevron-right text-xl"></i>
                        </button>

                        <Swiper
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
                                <SwiperSlide key={idx} className="!h-auto">
                                    <div className="skill-card h-full relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[rgba(25,30,45,0.6)] to-[rgba(10,15,25,0.9)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(200,162,110,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 group overflow-hidden">
                                        
                                        {/* Top Glow Highlight */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--clr-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        {/* Card Header */}
                                        <div className="flex items-center gap-4 mb-8 relative z-10">
                                            <div className="w-16 h-16 flex items-center justify-center bg-[rgba(200,162,110,0.05)] border border-[rgba(200,162,110,0.1)] rounded-2xl text-2xl text-[var(--clr-accent)] group-hover:scale-110 group-hover:bg-[var(--clr-accent)] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(200,162,110,0.4)] transition-all duration-500 flex-shrink-0">
                                                <i className={card.icon}></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight leading-tight">{card.title}</h3>
                                                <p className="text-[10px] md:text-xs font-mono text-[var(--clr-accent)] tracking-widest uppercase">{card.skills.length} Core Tools</p>
                                            </div>
                                        </div>

                                        {/* Progress Bars */}
                                        <div className="space-y-6 relative z-10">
                                            {card.skills.map((metric, midx) => (
                                                <div key={midx} className="skill-item group/item">
                                                    <div className="flex justify-between items-end mb-2.5">
                                                        <span className="text-gray-300 font-medium text-sm group-hover/item:text-white transition-colors">{metric.name}</span>
                                                        <span className="text-[var(--clr-accent)] font-bold font-mono text-sm">{metric.percent}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-[rgba(0,0,0,0.5)] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                                                        <div 
                                                            className="skill-progress-bar h-full bg-gradient-to-r from-[rgba(200,162,110,0.6)] to-[var(--clr-accent)] rounded-full relative"
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
                                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--clr-accent)] opacity-[0.03] blur-3xl rounded-full group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"></div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    
                    {/* Pagination */}
                    <div className="skills-pagination mt-10 flex justify-center gap-2"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .skills-pagination .swiper-pagination-bullet {
                    background: rgba(255,255,255,0.2);
                    opacity: 1;
                    transition: all 0.3s ease;
                    width: 8px;
                    height: 8px;
                }
                .skills-pagination .swiper-pagination-bullet-active {
                    background: var(--clr-accent);
                    width: 24px;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(200,162,110,0.4);
                }
            ` }} />
        </section>
    );
};

export default Skills;
