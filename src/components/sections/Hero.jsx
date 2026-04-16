import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';

const Hero = () => {
    const [typedText, setTypedText] = useState('');
    const roles = ["Cloud Engineer", "DevOps Engineer", "AWS & Kubernetes", "CI/CD Automation"];
    
    useEffect(() => {
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
    }, []);

    const techItems = [
        { icon: 'fab fa-aws', label: 'AWS (Cloud)' },
        { icon: 'fab fa-docker', label: 'Kubernetes' },
        { icon: 'fas fa-rocket', label: 'CI/CD' },
        { icon: 'fas fa-code', label: 'Terraform' },
        { icon: 'fab fa-linux', label: 'Linux Admin' },
        { icon: 'fas fa-network-wired', label: 'Networking' },
    ];

    return (
        <section id="hero" className="relative flex items-center min-h-screen overflow-hidden bg-transparent">
            <div className="container px-8 mx-auto">
                <div className="grid items-center grid-cols-1 gap-16 pt-20 hero-grid md:grid-cols-2">
                    
                    {/* Left Side: Content */}
                    <div className="hero-left animate-up">
                        <div className="hero-badge-wrapper mb-3 pt-10">
                            <div className="hero-badge">
                                <i className="fas fa-wand-magic-sparkles sparkle-icon"></i>
                                <span>Cloud & DevOps Engineer</span>
                            </div>
                        </div>
                        <h1 className="hero-name text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-[-2px] whitespace-nowrap">
                            Ahmed <span className="highlight-surname text-[var(--clr-accent)]">Hamed</span>
                        </h1>
                        <h2 className="hero-subtitle text-xl font-semibold mb-6 h-10 text-[var(--clr-accent-3)] whitespace-nowrap">
                            <span>{typedText}</span><span className="typing-cursor ml-1 animate-[blink-cursor_0.8s_infinite]">|</span>
                        </h2>
                        <p className="hero-description text-[var(--clr-text-dim)] text-lg leading-relaxed max-w-[600px] mb-10 line-clamp-5">
                            Specialist in designing, automating, and scaling high-availability cloud infrastructure. 
                            Expert in bridging the gap between legacy networking and modern DevOps practices using 
                            AWS, Kubernetes, and Infrastructure as Code. Passionate about building resilient systems 
                            that empower businesses through seamless automation and continuous innovation.
                        </p>

                        {/* Tech Slider */}
                        <div className="mb-8 overflow-hidden tech-slider-container">
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
                                {techItems.map((item, idx) => (
                                    <SwiperSlide key={idx} style={{ width: 'auto' }}>
                                        <span className="tech-badge flex items-center gap-2 px-5 py-2 rounded-full border border-[rgba(0,210,255,0.1)] bg-[rgba(0,210,255,0.05)] text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-all duration-300">
                                            <i className={item.icon}></i>
                                            {item.label}
                                        </span>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div className="flex gap-6 hero-cta-group">
                            <a id="hero-btn-cv" href="https://drive.google.com/file/d/15tyIpHbM3vfBsw4VlT5B0ZL8oS73VTM1/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn-cv">
                                <i className="fas fa-file-download"></i>
                                <span>Download CV</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Side: Portrait */}
                    <div className="hero-right animate-up delay-1">
                        <div className="relative w-full hero-portrait group">
                            <div className="portrait-frame relative aspect-[4/5] rounded-[30px] overflow-hidden">
                                <img 
                                    src="/assets/ahmed.jpeg" 
                                    alt="Ahmed Hamed" 
                                    className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-transparent portrait-overlay"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute flex flex-col items-center gap-2 -translate-x-1/2 scroll-indicator bottom-8 left-1/2">
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

                .hero-name {
                    font-size: clamp(3rem, 8vw, 5rem);
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
                    background: rgba(0, 210, 255, 0.05);
                    border: 1px solid rgba(0, 210, 255, 0.2);
                    color: var(--clr-accent);
                    font-size: 0.9rem;
                    font-weight: 500;
                    font-style: italic;
                    letter-spacing: 0.5px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .hero-badge:hover {
                    background: rgba(0, 210, 255, 0.1);
                    border-color: var(--clr-accent);
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(0, 210, 255, 0.15);
                }

                .sparkle-icon {
                    color: var(--clr-accent-3);
                    filter: drop-shadow(0 0 5px rgba(0, 210, 255, 0.3));
                    font-size: 0.8rem;
                }
            ` }} />
        </section>
    );
};

export default Hero;
