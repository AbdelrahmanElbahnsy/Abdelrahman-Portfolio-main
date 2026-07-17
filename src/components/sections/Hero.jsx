import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { heroTechSlider, personalInfo } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';
import SplitText from '../ui/SplitText';

const Hero = ({ splashDone = true }) => {
    const [typedText, setTypedText] = useState('');
    const { roles, badge, firstName, lastName, description, portrait, fullName, cvUrl } = personalInfo;

    // Refs for GSAP targets
    const sectionRef = useRef(null);
    const badgeRef = useRef(null);
    const nameRef = useRef(null);
    const subtitleRef = useRef(null);
    const descRef = useRef(null);
    const sliderRef = useRef(null);
    const ctaRef = useRef(null);
    const portraitRef = useRef(null);
    const scrollIndicatorRef = useRef(null);

    // Magnetic effect on CTA button
    useMagneticEffect(ctaRef, { strength: 0.35, radius: 80 });

    // Typing effect
    useEffect(() => {
        if (!splashDone) return;

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeout;

        const type = () => {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                setTypedText(currentRole.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setTypedText(currentRole.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 500;
            }

            timeout = setTimeout(type, typeSpeed);
        };

        timeout = setTimeout(type, 1500);
        return () => clearTimeout(timeout);
    }, [roles, splashDone]);

    // GSAP entrance timeline
    useGSAP(
        () => {
            const targets = [
                badgeRef.current,
                nameRef.current,
                subtitleRef.current,
                descRef.current,
                sliderRef.current,
                ctaRef.current,
                portraitRef.current,
                scrollIndicatorRef.current,
            ].filter(Boolean);

            // Set initial state immediately so they don't flash visible
            gsap.set(targets, { opacity: 0, y: 30 });
            gsap.set(portraitRef.current, { opacity: 0, scale: 0.9, clipPath: 'circle(0% at 50% 50%)', y: 0 });
            gsap.set(ctaRef.current, { opacity: 0, y: 25, scale: 0.92 });
            const nameChars = nameRef.current?.querySelectorAll('.split-unit');
            if (nameChars?.length) gsap.set(nameChars, { opacity: 0, y: 30, rotateX: -40 });

            if (!splashDone) return;

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                delay: 0.15,
            });

            tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' });

            // Char-by-char name reveal
            if (nameChars?.length) {
                tl.to(nameChars, {
                    opacity: 1, y: 0, rotateX: 0,
                    duration: 0.5, stagger: 0.03,
                    ease: 'back.out(1.2)',
                }, '-=0.1');
                tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.01 }, '<');
            } else {
                tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.1');
            }

            tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
            tl.to(portraitRef.current, { opacity: 1, scale: 1, clipPath: 'circle(75% at 50% 50%)', duration: 0.9, ease: 'power3.out' }, '-=0.3');
            tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.6');
            tl.to(sliderRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
            tl.to(ctaRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2');
            tl.to(scrollIndicatorRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.1');

            // Continuous float for portrait
            tl.then(() => {
                gsap.to(portraitRef.current, { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            });
        },
        { scope: sectionRef, dependencies: [splashDone] },
    );

    return (
        <section
            id="hero"
            ref={sectionRef}
            className="relative flex items-center min-h-screen overflow-hidden bg-transparent"
        >
            <div className="container px-8 mx-auto">
                <div className="grid items-center grid-cols-1 gap-16 pt-20 hero-grid md:grid-cols-2">
                    <div className="hero-left">
                        <div ref={badgeRef} className="hero-badge-wrapper mb-3 pt-10">
                            <div className="hero-badge">
                                <i className="fas fa-wand-magic-sparkles sparkle-icon"></i>
                                <span>{badge}</span>
                            </div>
                        </div>
                        <h1
                            ref={nameRef}
                            className="hero-name text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] tracking-[-2px]"
                        >
                            <SplitText mode="char">{firstName}</SplitText>{' '}
                            <span className="highlight-surname text-[var(--clr-accent)]">
                                {lastName}
                            </span>
                        </h1>
                        <h2
                            ref={subtitleRef}
                            className="hero-subtitle text-lg sm:text-xl font-semibold mb-6 min-h-[40px] text-[var(--clr-accent-3)]"
                        >
                            <span>{typedText}</span>
                            <span className="typing-cursor ml-1 animate-[blink-cursor_0.8s_infinite]">
                                |
                            </span>
                        </h2>
                        <p
                            ref={descRef}
                            className="hero-description text-[var(--clr-text-dim)] text-lg leading-relaxed max-w-[600px] mb-10 line-clamp-5"
                        >
                            {description}
                        </p>

                        <div ref={sliderRef} className="mb-8 overflow-hidden tech-slider-container">
                            <Swiper
                                dir="ltr"
                                modules={[Autoplay, FreeMode]}
                                slidesPerView="auto"
                                spaceBetween={20}
                                loop={true}
                                speed={5000}
                                autoplay={{
                                    delay: 0,
                                    disableOnInteraction: false,
                                }}
                                freeMode={true}
                                className="tech-slider"
                            >
                                {heroTechSlider.map((item, idx) => (
                                    <SwiperSlide key={idx} style={{ width: 'auto' }}>
                                        <span className="tech-badge flex items-center gap-2 px-5 py-2 rounded-full border border-[rgba(200,162,110,0.1)] bg-[rgba(200,162,110,0.05)] text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-all duration-300">
                                            {item.icon === 'SiMicrosoftazure' ? (
                                                <SiMicrosoftazure />
                                            ) : (
                                                <i className={item.icon}></i>
                                            )}
                                            {item.label}
                                        </span>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div ref={ctaRef} className="flex gap-6 hero-cta-group">
                            <a
                                id="hero-btn-cv"
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-cv"
                            >
                                <i className="fas fa-file-download"></i>
                                <span>Download CV</span>
                            </a>
                        </div>
                    </div>

                    <div className="hero-right md:ml-6">
                        <div ref={portraitRef} className="relative w-full hero-portrait group md:translate-x-8">
                            <div className="portrait-frame relative aspect-[4/5] rounded-[30px] overflow-hidden">
                                <img
                                    src={portrait}
                                    alt={fullName}
                                    className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                                    loading="eager"
                                    fetchPriority="high"
                                    width="800"
                                    height="1000"
                                />
                                <div className="absolute inset-0 bg-transparent portrait-overlay"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                ref={scrollIndicatorRef}
                className="absolute flex flex-col items-center gap-2 -translate-x-1/2 scroll-indicator bottom-8 left-1/2"
            >
                <a href="#about" className="flex flex-col items-center scroll-link">
                    <span className="mouse w-6 h-10 border-2 border-[var(--clr-text-dim)] rounded-full relative">
                        <span className="wheel w-1 h-2 bg-[var(--clr-accent)] rounded-full absolute top-2 left-1/2 -translate-x-1/2 animate-[scroll-wheel_1s_infinite]"></span>
                    </span>
                </a>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .portrait-frame {
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%),
                                        linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%),
                                linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
                    mask-composite: intersect;
                    -webkit-mask-composite: source-in;
                }

                @keyframes scroll-wheel {
                    0% { transform: translate(-50%, 0); opacity: 1; }
                    100% { transform: translate(-50%, 15px); opacity: 0; }
                }

                .highlight-surname {
                    background: linear-gradient(to right, var(--clr-accent), var(--clr-accent-3));
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .tech-slider {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 16px;
                    border-radius: 9999px;
                    background: rgba(200, 162, 110, 0.05);
                    border: 1px solid rgba(200, 162, 110, 0.2);
                    color: var(--clr-accent);
                    font-size: 0.9rem;
                    font-weight: 500;
                    font-style: italic;
                    letter-spacing: 0.5px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .hero-badge:hover {
                    background: rgba(200, 162, 110, 0.1);
                    border-color: var(--clr-accent);
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(200, 162, 110, 0.15);
                }

                .sparkle-icon {
                    color: var(--clr-accent-3);
                    filter: drop-shadow(0 0 5px rgba(200, 162, 110, 0.3));
                    font-size: 0.8rem;
                }
            ` }} />
        </section>
    );
};

export default Hero;
