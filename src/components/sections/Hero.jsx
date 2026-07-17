import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { heroTechSlider, personalInfo } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';

// Custom Sleek Scramble Text Hook
const useScrambleText = (targetText, delay = 0, enabled = true) => {
    const [text, setText] = useState('');
    const chars = '!<>-_\\\\/[]{}—=+*^?#________';
    
    useEffect(() => {
        if (!enabled) {
            setText('');
            return;
        }
        
        let iteration = 0;
        let animationFrame;
        
        const scramble = () => {
            setText(targetText.split('').map((char, index) => {
                if (index < iteration) {
                    return targetText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));
            
            if (iteration >= targetText.length) {
                cancelAnimationFrame(animationFrame);
                setText(targetText);
            } else {
                iteration += 1 / 2.5; // speed
                animationFrame = requestAnimationFrame(scramble);
            }
        };
        
        const timeout = setTimeout(() => {
            animationFrame = requestAnimationFrame(scramble);
        }, delay);
        
        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(animationFrame);
        };
    }, [targetText, delay, enabled]);
    
    return text;
};

const Hero = ({ splashDone = true }) => {
    const { roles, badge, firstName, lastName, description, portrait, cvUrl } = personalInfo;

    // Scrambled names
    const scrambledFirstName = useScrambleText(firstName, 1200, splashDone);
    const scrambledLastName = useScrambleText(lastName, 1800, splashDone);

    // Typing effect for the HUD
    const [typedRole, setTypedRole] = useState('');
    
    useEffect(() => {
        if (!splashDone) {
            setTypedRole('');
            return;
        }
        
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeTimeout;

        const type = () => {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                setTypedRole(currentRole.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setTypedRole(currentRole.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 80;

            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2500;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 400;
            }

            typeTimeout = setTimeout(type, typeSpeed);
        };

        const initialDelay = setTimeout(type, 1000);
        
        return () => {
            clearTimeout(initialDelay);
            clearTimeout(typeTimeout);
        };
    }, [roles, splashDone]);

    // Refs
    const sectionRef = useRef(null);
    const portraitRef = useRef(null);
    const leftContentRef = useRef(null);
    const subtitleRef = useRef(null);
    const descRef = useRef(null);
    const orbitingNodesRef = useRef(null);
    const watermarkRef = useRef(null);
    
    // 3D Tilt Effect on Portrait Container
    const handleMouseMove = (e) => {
        if (!portraitRef.current || !watermarkRef.current) return;
        const rect = portraitRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -12; // Max 12 deg
        const rotateY = ((x - centerX) / centerX) * 12;
        
        gsap.to(portraitRef.current, {
            rotateX, rotateY, duration: 0.5, ease: 'power2.out', transformPerspective: 1000
        });

        // Parallax for watermark
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        gsap.to(watermarkRef.current, {
            x: (e.clientX - windowCenterX) * 0.05,
            y: (e.clientY - windowCenterY) * 0.05,
            duration: 1,
            ease: 'power2.out'
        });
    };
    
    const handleMouseLeave = () => {
        if (!portraitRef.current || !watermarkRef.current) return;
        gsap.to(portraitRef.current, {
            rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1, 0.3)'
        });
        gsap.to(watermarkRef.current, {
            x: 0, y: 0, duration: 1, ease: 'power2.out'
        });
    };

    useGSAP(() => {
        if (!splashDone) {
            gsap.set(leftContentRef.current, { opacity: 0, x: -30 });
            gsap.set(portraitRef.current, { opacity: 0, scale: 0.85 });
            gsap.set([subtitleRef.current, descRef.current], { opacity: 0, y: 20 });
            if (orbitingNodesRef.current) gsap.set(orbitingNodesRef.current.children, { opacity: 0, scale: 0 });
            return;
        }

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.to(leftContentRef.current, { opacity: 1, x: 0, duration: 1.2, delay: 0.2 })
          .to(portraitRef.current, { opacity: 1, scale: 1, duration: 1.5, ease: 'back.out(1.2)' }, '-=1')
          .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.8')
          .to(descRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
          
        if (orbitingNodesRef.current) {
            tl.to(orbitingNodesRef.current.children, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.5');
        }

        // Float animation for portrait
        tl.then(() => {
            gsap.to(portraitRef.current, { y: -15, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        });
          
    }, { scope: sectionRef, dependencies: [splashDone] });

    return (
        <section 
            id="hero" 
            ref={sectionRef} 
            className="relative flex items-center min-h-screen overflow-hidden bg-transparent pt-20 pb-10"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Blob & Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--clr-accent)] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.06] pointer-events-none animate-pulse-slow z-0"></div>
            
            <div ref={watermarkRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
                <span className="text-[15vw] font-black text-white opacity-[0.02] tracking-tighter whitespace-nowrap leading-none">CLOUD</span>
            </div>

            <div className="container px-6 md:px-8 mx-auto relative z-10">
                <div className="grid items-center grid-cols-1 gap-12 lg:gap-16 lg:grid-cols-12">
                    
                    {/* Left Content */}
                    <div ref={leftContentRef} className="lg:col-span-7 flex flex-col justify-center mt-10 lg:mt-0">
                        <div className="hero-badge-wrapper mb-6">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                <span className="w-2 h-2 rounded-full bg-[var(--clr-accent)] animate-pulse shadow-[0_0_10px_var(--clr-accent)]"></span>
                                <span className="text-xs sm:text-sm font-mono tracking-widest text-[var(--clr-text-dim)] uppercase">{badge}</span>
                            </div>
                        </div>
                        
                        <h1 className="hero-name text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter min-h-[90px] sm:min-h-[140px]">
                            <span className="block text-white mb-1 sm:mb-2">{scrambledFirstName}</span>
                            <span className="block bg-gradient-to-r from-[var(--clr-accent)] to-[var(--clr-accent-3)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(200,162,110,0.3)]">
                                {scrambledLastName}
                            </span>
                        </h1>

                        {/* Original Clean Subtitle and Description */}
                        <div ref={subtitleRef} className="hero-subtitle mb-6 mt-4">
                            <h2 className="text-xl sm:text-2xl font-light text-[var(--clr-text-dim)] flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-[var(--clr-accent)]"></span>
                                <span className="typed-text-container">
                                    <span className="text-white font-medium">{typedRole}</span>
                                    <span className="cursor inline-block w-2 h-5 bg-[var(--clr-accent)] ml-1 align-middle animate-[blink-cursor_1s_infinite]"></span>
                                </span>
                            </h2>
                        </div>

                        <p ref={descRef} className="hero-desc text-base sm:text-lg text-gray-400 mb-10 max-w-xl leading-relaxed font-sans">
                            {description}
                        </p>

                        <div className="flex gap-6">
                            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black text-sm sm:text-base font-bold uppercase tracking-widest rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.5)] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                                <i className="fas fa-terminal"></i>
                                <span>Deploy CV</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Content - 3D Portrait & Orbiting Nodes */}
                    <div className="lg:col-span-5 relative mt-16 lg:mt-0 flex justify-center items-center perspective-1000 z-10">
                        
                        {/* Orbiting Tech Nodes */}
                        <div ref={orbitingNodesRef} className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none z-0">
                            {heroTechSlider.slice(0, 6).map((tech, idx) => {
                                const angle = (idx * 360) / 6;
                                return (
                                    <div 
                                        key={idx} 
                                        className="absolute top-[0] left-[0] orbit-container"
                                        style={{
                                            '--angle': `${angle}deg`,
                                            '--radius': 'clamp(150px, 18vw, 240px)',
                                            '--duration': '35s'
                                        }}
                                    >
                                        <div className="orbit-item">
                                            <div className="orbit-content w-12 h-12 sm:w-14 sm:h-14 bg-[#0d121c] border border-[rgba(255,255,255,0.15)] rounded-2xl flex items-center justify-center text-xl sm:text-2xl text-[var(--clr-text-dim)] shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all hover:text-[var(--clr-accent)] hover:border-[rgba(200,162,110,0.6)] hover:scale-110 pointer-events-auto cursor-pointer" title={tech.label}>
                                                {tech.icon === 'SiMicrosoftazure' ? <SiMicrosoftazure /> : <i className={tech.icon}></i>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Interactive Portrait Container */}
                        <div 
                            ref={portraitRef}
                            className="relative w-[260px] h-[340px] sm:w-[320px] sm:h-[420px] lg:w-[380px] lg:h-[480px] transform-style-3d z-20 mx-auto"
                        >
                            {/* Glow behind portrait */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--clr-accent)] to-[var(--clr-accent-3)] opacity-20 blur-3xl rounded-full transform translate-z-[-50px]"></div>
                            
                            <div className="w-full h-full rounded-[2rem] overflow-hidden border border-[rgba(255,255,255,0.15)] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative bg-[#0a0f18]">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-transparent to-transparent z-10"></div>
                                <img src={portrait} alt={firstName} className="w-full h-full object-cover object-[center_10%]" />
                            </div>
                            
                            {/* Floating "Status" Widget on portrait */}
                            <div className="absolute -bottom-5 sm:-bottom-8 left-4 right-4 sm:left-8 sm:right-8 z-30 px-3 sm:px-4 py-3 bg-[#111824] border border-[rgba(255,255,255,0.15)] rounded-xl flex items-center justify-between transform translate-z-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                    <span className="text-[10px] sm:text-xs font-mono text-white tracking-widest uppercase">System Online</span>
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-[var(--clr-accent)] font-mono border border-[rgba(200,162,110,0.2)] bg-[rgba(200,162,110,0.05)] px-2 py-1 rounded">100% Uptime</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }

                .perspective-1000 {
                    perspective: 1000px;
                }
                
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                
                .translate-z-\\[40px\\] {
                    transform: translateZ(40px);
                }
                
                .translate-z-\\[-50px\\] {
                    transform: translateZ(-50px);
                }

                /* Orbit Animation System */
                .orbit-container {
                    animation: orbit-rotation var(--duration) linear infinite;
                    transform: translate(-50%, -50%) rotate(var(--angle));
                    transform-origin: 0 0;
                }

                .orbit-item {
                    transform: translateX(var(--radius));
                }

                .orbit-content {
                    animation: orbit-counter-rotation var(--duration) linear infinite;
                }

                @keyframes orbit-rotation {
                    from { transform: translate(-50%, -50%) rotate(var(--angle)); }
                    to { transform: translate(-50%, -50%) rotate(calc(var(--angle) + 360deg)); }
                }

                @keyframes orbit-counter-rotation {
                    from { transform: rotate(calc(var(--angle) * -1)); }
                    to { transform: rotate(calc((var(--angle) + 360deg) * -1)); }
                }
            ` }} />
        </section>
    );
};

export default Hero;
