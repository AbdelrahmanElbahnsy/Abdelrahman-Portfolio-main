import React, { useState, useEffect, useRef } from 'react';

const AirplaneSocial = () => {
    const [isActive, setIsActive] = useState(false);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsActive(!isActive);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)
            ) {
                setIsActive(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const socialLinks = [
        { href: 'https://www.linkedin.com/in/ahmed-hamed-340570364', icon: 'fab fa-linkedin-in', label: 'LinkedIn', color: '#0077b5' },
        { href: 'https://github.com/ahmed1707hamed-tech', icon: 'fab fa-github', label: 'GitHub', color: '#171515' },
        { href: 'https://wa.me/201062425594', icon: 'fab fa-whatsapp', label: 'WhatsApp', color: '#25D366' },
        { href: 'https://x.com/AhmedHa23091122', icon: 'fab fa-x-twitter', label: 'Twitter', color: '#000000' },
        { href: 'mailto:ahmed.1707.hamed@gmail.com', icon: 'fas fa-envelope', label: 'Email', color: '#EA4335' },
    ];

    return (
        <div className="airplane-social-wrapper fixed left-[30px] bottom-[30px] z-[2000]">
            {/* Social Icons Menu */}
            <div
                ref={menuRef}
                className={`flex flex-col gap-4 mb-4 transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
                    isActive ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'
                }`}
            >
                {socialLinks.map((social, idx) => (
                    <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center h-12"
                    >
                        {/* Tooltip Label */}
                        <div className="absolute left-16 opacity-0 group-hover:opacity-100 group-hover:left-14 transition-all duration-300 pointer-events-none">
                            <span className="px-3 py-1.5 rounded-lg bg-[rgba(10,10,10,0.9)] border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase whitespace-nowrap shadow-2xl backdrop-blur-md">
                                {social.label}
                            </span>
                        </div>

                        {/* Icon Container */}
                        <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg transition-all duration-300 group-hover:scale-110 shadow-lg"
                            style={{ 
                                backgroundColor: social.color,
                                border: '2px solid rgba(255, 255, 255, 0.15)'
                            }}
                        >
                            <i className={`${social.icon} transition-transform duration-300 group-hover:rotate-[15deg]`}></i>
                        </div>
                    </a>
                ))}
            </div>

            {/* Main Trigger Button */}
            <button
                ref={triggerRef}
                onClick={toggleMenu}
                className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden shadow-2xl ${
                    isActive ? 'bg-[var(--clr-accent)] rotate-45 shadow-[0_0_30px_rgba(0,210,255,0.4)]' : 'bg-[var(--clr-accent)] hover:bg-[var(--clr-accent-2)]'
                }`}
                aria-label={isActive ? "Close Menu" : "Open Social Menu"}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className={`fas ${isActive ? 'fa-times' : 'fa-paper-plane'} text-white text-xl transition-all duration-500 ${!isActive && 'group-hover:-translate-y-1 group-hover:translate-x-1'}`}></i>
                
                {/* Glow Effect */}
                {!isActive && (
                    <div className="absolute -inset-1 bg-[var(--clr-accent)] rounded-full opacity-20 group-hover:opacity-40 animate-pulse blur-md"></div>
                )}
            </button>

            <style dangerouslySetInnerHTML={{ __html: `
                .airplane-social-wrapper {
                    perspective: 1000px;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .airplane-btn-pulse {
                    animation: float 3s ease-in-out infinite;
                }
            ` }} />
        </div>
    );
};

export default AirplaneSocial;
