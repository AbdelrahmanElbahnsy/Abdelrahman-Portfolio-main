import React, { useState, useEffect } from 'react';
import { personalInfo, socialLinks } from '../../data/portfolioData';

const Navbar = () => {
    const { firstName, lastName } = personalInfo;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    const navLinks = [
        { name: 'Home', href: '#hero', id: 'hero', icon: 'fas fa-home' },
        { name: 'About', href: '#about', id: 'about', icon: 'fas fa-user' },
        { name: 'Skills', href: '#skills', id: 'skills', icon: 'fas fa-tools' },
        { name: 'Projects', href: '#projects', id: 'projects', icon: 'fas fa-project-diagram' },
        { name: 'Certifications', href: '#certifications', id: 'certifications', icon: 'fas fa-certificate' },
    ];

    const handleNavClick = (id) => {
        setActiveSection(id);
        if (isMenuOpen) toggleMenu();
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY % 2 === 0) { // Throttled check
                setIsScrolled(window.scrollY > 50);
                
                // Fallback for Home if scrolled to Top
                if (window.scrollY < 100) {
                    setActiveSection('hero');
                }
            }
        };

        const observerOptions = {
            threshold: [0.3], // Single threshold for better performance
            rootMargin: '-15% 0px -65% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => observer.observe(section));

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('menu-open');
            document.body.style.overflow = 'auto';
        }
    };

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-700 ${isScrolled ? 'pt-4' : 'pt-8'}`}>
                <div className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'max-w-[1240px] px-8' : 'page-container px-4'}`}>
                    <nav className={`flex items-center justify-between px-6 py-2.5 rounded-full border transition-all duration-700 ${isScrolled ? 'bg-[rgba(10,12,16,0.92)] border-[rgba(0,210,255,0.35)] backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.7)]' : 'bg-transparent border-transparent'}`}>
                        {/* Logo */}
                        <a href="#" className="logo flex items-center gap-2 group shrink-0" onClick={() => handleNavClick('hero')}>
                            <span className={`font-black tracking-tighter text-white transition-all duration-500 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                                <span className="text-[var(--clr-accent)]">&lt;</span>{firstName.charAt(0)}<span className="hidden md:inline">{firstName.slice(1).toUpperCase()}</span><span className="text-[var(--clr-accent)]">/</span>{lastName.charAt(0)}<span className="hidden md:inline">{lastName.slice(1).toUpperCase()}</span><span className="text-[var(--clr-accent)]">&gt;</span>
                            </span>
                        </a>

                        {/* Navigation Links */}
                        <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
                            {navLinks.map((link, idx) => (
                                <li key={idx}>
                                    <a 
                                        href={link.href} 
                                        onClick={() => handleNavClick(link.id)}
                                        className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${activeSection === link.id ? 'bg-[var(--clr-accent)] text-black shadow-[0_0_20px_rgba(0,210,255,0.5)]' : 'text-[var(--clr-text-dim)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]'}`}
                                    >
                                        <i className={`${link.icon} ${activeSection === link.id ? 'opacity-100 scale-110' : 'opacity-70'}`}></i>
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                            <button 
                                onClick={toggleMenu}
                                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none z-[1001] bg-[rgba(255,255,255,0.05)] rounded-full hover:bg-[rgba(255,255,255,0.12)] transition-all"
                                aria-label="Toggle Menu"
                            >
                                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </button>
                            
                            <a 
                                href="#contact" 
                                onClick={() => handleNavClick('contact')}
                                className={`hidden md:flex items-center gap-2.5 px-4 md:px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-500 ${activeSection === 'contact' ? 'bg-white text-black ring-2 ring-white' : 'bg-[var(--clr-accent)] text-black'}`}
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                                <span className="hidden md:inline">Contact</span>
                            </a>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[999] bg-[#0a0c10]/98 backdrop-blur-2xl transition-all duration-700 lg:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className="mobile-menu-content h-full flex flex-col justify-between p-12 py-32 relative z-10">
                    <ul className="flex flex-col gap-6">
                        {[...navLinks, { name: 'Contact', href: '#contact', id: 'contact', icon: 'fas fa-paper-plane' }].map((link, idx) => (
                            <li key={idx}>
                                <a 
                                    href={link.href}
                                    onClick={() => handleNavClick(link.id)}
                                    className={`flex items-center gap-5 text-3xl font-black uppercase tracking-tighter transition-all duration-500 ${activeSection === link.id ? 'text-[var(--clr-accent)]' : 'text-white'}`}
                                >
                                    <i className={`${link.icon} text-2xl opacity-70`}></i>
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                    
                    <div className="mobile-menu-footer border-t border-[rgba(255,255,255,0.1)] pt-12">
                        <p className="text-[var(--clr-text-dim)] uppercase text-[10px] font-black tracking-[0.2em] mb-6">Let's Connect</p>
                        <div className="flex gap-8">
                            {socialLinks.navbarMobile.map((social, idx) => (
                                <a key={idx} href={social.link} target="_blank" rel="noreferrer" className="text-3xl text-white hover:text-[var(--clr-accent)] transition-all">
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
