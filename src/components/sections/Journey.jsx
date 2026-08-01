import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCreative, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-creative';
import { journey } from '../../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

const Journey = () => {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const [activePhase, setActivePhase] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const { subtitle, title, description, phases } = journey;

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
                        <div ref={headerRef} className="section-header text-left mb-8 md:mb-12">
                            <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-4 block">
                                {subtitle}
                            </span>
                            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight drop-shadow-md">
                                {title}
                            </h2>
                            <p className="text-[var(--clr-text-dim)] text-lg leading-relaxed">
                                {description}
                            </p>
                        </div>
                        
                        {/* Interactive Tabs / Stepper */}
                        <div className="relative pl-1 w-full max-w-full">
                            {/* Vertical Line (Desktop only) */}
                            <div className="hidden md:block absolute left-[7px] top-3 bottom-3 w-[2px] bg-[rgba(255,255,255,0.05)]"></div>
                            
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
                                            <div className={`hidden md:block step-dot w-2 h-2 rounded-full origin-center transition-all duration-300 ${isActive ? 'bg-[var(--clr-accent)] scale-150 shadow-[0_0_15px_var(--clr-accent)]' : 'bg-[rgba(255,255,255,0.15)] group-hover:bg-[rgba(255,255,255,0.3)]'}`}></div>
                                            
                                            {/* Text / Mobile Pill */}
                                            <div className={`step-text px-5 py-2.5 md:p-0 rounded-full md:rounded-none md:bg-transparent text-sm font-bold origin-left flex items-center transition-all duration-300 border md:border-transparent ${isActive ? 'bg-[var(--clr-accent)] border-[var(--clr-accent)] md:bg-transparent text-[#0a0e17] md:text-white scale-[1.02] md:scale-105 md:translate-x-2 shadow-[0_0_15px_rgba(200,162,110,0.3)] md:shadow-none' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] md:border-transparent md:bg-transparent text-[var(--clr-text-dim)] group-hover:text-white group-hover:bg-[rgba(255,255,255,0.08)] md:group-hover:bg-transparent'}`}>
                                                <span className={`text-[10px] uppercase tracking-widest font-mono mr-2 md:mr-3 transition-opacity ${isActive ? 'opacity-80 md:opacity-100' : 'opacity-40'}`}>
                                                    0{phase.phase}
                                                </span>
                                                {phase.title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Swiper Carousel */}
                    <div className="w-full md:w-[65%] lg:w-[70%] pt-2 md:pt-10 relative">
                        <Swiper
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
                                        <div className={`journey-card card h-fit md:h-full p-6 sm:p-10 border bg-[var(--clr-card-bg)] transition-all duration-700 rounded-3xl group relative overflow-hidden backdrop-blur-md 
                                            ${isActive 
                                                ? 'border-[var(--clr-accent)] shadow-[0_20px_50px_rgba(200,162,110,0.15)] scale-100 opacity-100' 
                                                : 'border-[var(--clr-card-border)] scale-[0.9] opacity-60 cursor-pointer hover:opacity-100 hover:scale-95'}`}
                                            onClick={() => {
                                                if (!isActive && swiperInstance) {
                                                    swiperInstance.slideTo(idx);
                                                }
                                            }}
                                        >
                                            
                                            {/* Accent Glow Effect */}
                                            <div className={`absolute top-0 right-0 w-64 h-64 bg-[var(--clr-accent)] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-[0.05]' : 'opacity-0'}`}></div>

                                            <span className="text-[var(--clr-accent)] font-black text-[11px] uppercase tracking-[0.2em] mb-2 md:mb-4 block">
                                                PHASE {phase.phase}
                                            </span>
                                            
                                            <h3 className={`text-2xl sm:text-3xl font-black mb-3 md:mb-5 tracking-tight transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                {phase.title}
                                            </h3>
                                            
                                            <p className="text-base sm:text-lg text-[var(--clr-text-dim)] leading-relaxed mb-5 md:mb-8 line-clamp-4 md:line-clamp-none">
                                                {phase.description}
                                            </p>

                                            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
                                                {phase.tags.map((tag, tidx) => (
                                                    <span key={tidx} className={`flex items-center justify-center text-center w-full md:w-auto px-2 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-gray-300 hover:border-[rgba(200,162,110,0.4)] hover:text-white hover:bg-[rgba(200,162,110,0.1)]' : 'bg-transparent border-[rgba(255,255,255,0.02)] text-gray-500 border'}`}>
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
                            <button className="journey-prev w-12 h-12 rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent flex items-center justify-center text-white hover:bg-[var(--clr-accent)] hover:text-black hover:border-[var(--clr-accent)] shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed">
                                <i className="fas fa-chevron-left text-sm"></i>
                            </button>
                            <button className="journey-next w-12 h-12 rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent flex items-center justify-center text-white hover:bg-[var(--clr-accent)] hover:text-black hover:border-[var(--clr-accent)] shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed">
                                <i className="fas fa-chevron-right text-sm"></i>
                            </button>
                        </div>
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
