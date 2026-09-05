import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { personalInfo, socialLinks } from '../../data/portfolioData';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useLanguage } from '../../i18n/LanguageContext';

const Navbar = ({ splashDone = true }) => {
    const { data: profileData, subscribe: subscribeProfile } = useFirestoreSingleDoc('profile', 'main');
    const { data: navbarItemsData, subscribe: subscribeNavbar } = useFirestoreCrud('navbarItems', { orderByField: 'order', orderDirection: 'asc' });
    const { language, toggleLanguage, t } = useLanguage();

    useEffect(() => {
        const unsubscribeProfile = subscribeProfile();
        const unsubscribeNavbar = subscribeNavbar();
        return () => {
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribeNavbar) unsubscribeNavbar();
        };
    }, [subscribeProfile, subscribeNavbar]);

    const fallbackFirstName = personalInfo.firstName || 'Abdelrahman';
    const fallbackLastName = personalInfo.lastName || 'El-bahnsy';

    let firstName = fallbackFirstName;
    let lastName = fallbackLastName;
    
    if (profileData?.fullName) {
        const nameParts = profileData.fullName.split(' ');
        firstName = nameParts[0] || fallbackFirstName;
        lastName = nameParts.slice(1).join(' ') || fallbackLastName;
    }
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Hydrate from DOM class set by index.html script
        if (typeof document !== 'undefined') {
            setIsDarkMode(!document.documentElement.classList.contains('light-theme'));
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDarkMode;
        setIsDarkMode(newIsDark);
        localStorage.setItem('portfolio-theme', newIsDark ? 'dark' : 'light');
        if (!newIsDark) {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    };

    const headerRef = useRef(null);
    const navRef = useRef(null);
    const menuOverlayRef = useRef(null);
    const menuItemsRef = useRef(null);
    const isScrollingRef = useRef(false);

    const defaultNavLinks = [
        { name: 'Home', href: '#home', id: 'hero', icon: 'fas fa-home' },
        { name: 'About', href: '#about', id: 'about', icon: 'fas fa-user' },
        { name: 'Skills', href: '#skills', id: 'skills', icon: 'fas fa-tools' },
        { name: 'Projects', href: '#projects', id: 'projects', icon: 'fas fa-project-diagram' },
        { name: 'Certifications', href: '#certifications', id: 'certifications', icon: 'fas fa-certificate' },
        { name: 'Journey', href: '#journey', id: 'journey', icon: 'fas fa-route' },
    ];

    const navLinks = React.useMemo(() => {
        const sourceData = (!navbarItemsData || navbarItemsData.length === 0) ? defaultNavLinks : navbarItemsData;
        const desiredOrder = ['#home', '#hero', '#about', '#skills', '#projects', '#certifications', '#journey'];
        
        return sourceData
            .filter(item => item.href !== '#contact')
            .map(item => {
                const fallbackLink = defaultNavLinks.find(link => link.href === item.href) || {};
                const href = item.href || fallbackLink.href || '#';
                const cleanHash = href.replace('#', '').toLowerCase();
                const id = cleanHash === 'home' ? 'hero' : cleanHash || fallbackLink.id || '';
                
                const englishName = fallbackLink.name || item.name || item.label || 'Untitled';
                return {
                    name: language === 'ar' ? (item.labelAr || item.nameAr || t(fallbackLink.name || englishName)) : englishName,
                    href: href,
                    id: id,
                    icon: item.icon || fallbackLink.icon || 'fas fa-circle'
                };
            })
            .sort((a, b) => {
                const indexA = desiredOrder.indexOf(a.href);
                const indexB = desiredOrder.indexOf(b.href);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
    }, [navbarItemsData, language]);

    const handleNavClick = (e, id) => {
        if (e && e.preventDefault) e.preventDefault();
        isScrollingRef.current = true;
        setActiveSection(id);
        if (isMenuOpen) toggleMenu();
        
        const hash = id === 'hero' ? 'home' : id;
        window.history.pushState(null, '', `#${hash}`);
        
        if (id === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const target = document.getElementById(id);
            if (target) {
                const headerOffset = headerRef.current ? headerRef.current.offsetHeight : 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({
                     top: offsetPosition,
                     behavior: 'smooth'
                });
            }
        }

        setTimeout(() => {
            isScrollingRef.current = false;
        }, 1200);
    };

    useEffect(() => {
        const getValidSectionId = (hash) => {
            const cleanHash = hash.replace('#', '').toLowerCase();
            if (!cleanHash) return null;
            return cleanHash === 'home' ? 'hero' : cleanHash;
        };

        const handleHashChange = () => {
            if (isScrollingRef.current) return;
            const targetId = getValidSectionId(window.location.hash);
            if (targetId) {
                setActiveSection(targetId);
            }
        };

        // Initial setup on mount
        const initialTargetId = getValidSectionId(window.location.hash);
        
        if (initialTargetId) {
            setActiveSection(initialTargetId);
            isScrollingRef.current = true; // Lock observer
            setTimeout(() => {
                const target = document.getElementById(initialTargetId);
                if (target) {
                    const headerOffset = headerRef.current ? headerRef.current.offsetHeight : 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    window.scrollTo({ top: elementPosition + window.scrollY - headerOffset, behavior: 'auto' });
                }
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 1000);
            }, 500); // Wait for DOM
        } else {
            // Determine active section from actual scroll position immediately on mount
            setTimeout(() => {
                const sectionIds = ['hero', 'about', 'skills', 'projects', 'certifications', 'journey', 'contact', 'toolchain'];
                const anchor = window.innerHeight * 0.4;
                for (const id of sectionIds) {
                    const el = document.getElementById(id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top <= anchor && rect.bottom > anchor) {
                            setActiveSection(id);
                            break;
                        }
                    }
                }
            }, 500);
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // GSAP entrance animation
    useGSAP(
        () => {
            if (!headerRef.current) return;

            // Immediately set initial state to prevent flash
            gsap.set(headerRef.current, { y: -80, opacity: 0 });

            if (!splashDone) return;

            gsap.to(headerRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power4.out',
                delay: 0.1,
            });
        },
        { scope: headerRef, dependencies: [splashDone] },
    );

    const hasUserScrolledRef = useRef(false);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 50);

                    if (!isScrollingRef.current) {
                        const sectionIds = ['hero', 'about', 'skills', 'projects', 'certifications', 'journey', 'contact', 'toolchain'];
                        const anchor = window.innerHeight * 0.4;

                        let currentActiveId = null;
                        let minDistance = Infinity;

                        for (const id of sectionIds) {
                            const el = document.getElementById(id);
                            if (el) {
                                const rect = el.getBoundingClientRect();
                                if (rect.top <= anchor && rect.bottom > anchor) {
                                    currentActiveId = id;
                                    break;
                                }
                                const distance = Math.min(Math.abs(rect.top - anchor), Math.abs(rect.bottom - anchor));
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    currentActiveId = id;
                                }
                            }
                        }

                        if (currentActiveId) {
                            setActiveSection(prev => {
                                if (prev !== currentActiveId) {
                                    const hash = currentActiveId === 'hero' ? 'home' : currentActiveId;
                                    // Update URL silently
                                    if (window.location.hash !== `#${hash}`) {
                                        window.history.replaceState(null, '', `#${hash}`);
                                    }
                                    return currentActiveId;
                                }
                                return prev;
                            });
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check to sync state
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Animate mobile menu open/close
    useEffect(() => {
        if (!menuOverlayRef.current || !menuItemsRef.current) return;

        if (isMenuOpen) {
            gsap.to(menuOverlayRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power4.out',
                onStart: () => {
                    menuOverlayRef.current.style.pointerEvents = 'auto';
                },
            });

            const items = menuItemsRef.current.querySelectorAll('.mobile-nav-item');
            gsap.from(items, {
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power4.out',
                delay: 0.2,
            });
        } else {
            gsap.to(menuOverlayRef.current, {
                opacity: 0,
                y: '-100%',
                duration: 0.4,
                ease: 'power3.in',
                onComplete: () => {
                    if (menuOverlayRef.current) {
                        menuOverlayRef.current.style.pointerEvents = 'none';
                    }
                },
            });
        }
    }, [isMenuOpen]);

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
            <header ref={headerRef} className={`sticky top-0 left-0 w-full z-[1000] transition-all duration-700 ${isScrolled ? 'pt-2 sm:pt-4' : 'pt-4 sm:pt-8'}`}>
                <div className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'max-w-[1240px] px-4 sm:px-8' : 'page-container px-4'}`}>
                    <nav ref={navRef} className={`w-full box-border flex flex-nowrap items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 xl:px-6 py-2.5 rounded-full border backdrop-blur-[18px] transition-all duration-700 ${isScrolled ? 'bg-[var(--theme-nav-bg)] border-[var(--theme-nav-border)] shadow-[var(--theme-nav-shadow)]' : 'bg-transparent border-transparent'}`}>
                        {/* Left Region: Logo */}
                        <div className="flex items-center shrink-0 min-w-0">
                            <a href="#hero" className="logo flex items-center gap-1 group min-w-0" onClick={(e) => handleNavClick(e, 'hero')} dir="ltr" style={{ overflowWrap: 'anywhere' }}>
                                {language === 'ar' ? (
                                    /* Arabic navbar logo ظ¤ LTR outer, RTL name text */
                                    <span className={`font-black tracking-tighter text-[var(--theme-nav-text)] transition-all duration-500 ${isScrolled ? 'text-base sm:text-lg xl:text-xl' : 'text-lg sm:text-xl xl:text-2xl'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
                                        <span className="text-[var(--theme-accent)]">&lt; </span>
                                        <span dir="rtl" style={{ unicodeBidi: 'isolate', whiteSpace: 'nowrap' }}>
                                            {profileData?.firstNameAr || personalInfo.firstNameAr}
                                            <span className="text-[var(--theme-accent)] hidden md:inline"> / </span>
                                            <span className="hidden md:inline">{profileData?.lastNameAr || personalInfo.lastNameAr}</span>
                                        </span>
                                        <span className="text-[var(--theme-accent)]"> &gt;</span>
                                    </span>
                                ) : (
                                    /* English navbar logo */
                                    <span className={`font-black tracking-tighter text-[var(--theme-nav-text)] transition-all duration-500 ${isScrolled ? 'text-base sm:text-lg xl:text-xl' : 'text-lg sm:text-xl xl:text-2xl'}`} style={{ whiteSpace: 'normal', wordBreak: 'keep-all' }}>
                                        <span className="text-[var(--theme-accent)]">&lt;</span>{firstName.charAt(0)}<span className="hidden md:inline">{firstName.slice(1).toUpperCase()}</span><span className="text-[var(--theme-accent)] hidden md:inline">/</span>{lastName.charAt(0)}<span className="hidden md:inline" style={{ whiteSpace: 'nowrap' }}>{lastName.slice(1).toUpperCase()}</span><span className="text-[var(--theme-accent)]">&gt;</span>
                                    </span>
                                )}
                            </a>
                        </div>

                        {/* Center Region: Navigation Links */}
                        <div className="hidden xl:flex justify-center px-4">
                            <ul className="flex flex-nowrap items-center justify-center gap-1 2xl:gap-2">
                                {navLinks.map((link, idx) => (
                                    <li key={idx} className="flex items-center shrink-0">
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.id)}
                                            className={`flex items-center justify-center gap-1.5 px-2.5 2xl:px-4 py-2.5 rounded-full text-[10px] 2xl:text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${activeSection === link.id ? 'bg-[var(--theme-nav-active-bg)] text-[var(--theme-nav-active-text)] shadow-[var(--theme-nav-active-shadow)]' : 'text-[var(--theme-nav-text-dim)] hover:text-[var(--theme-nav-text)] hover:bg-[var(--theme-nav-hover-bg)]'}`}
                                        >
                                            <i className={`${link.icon} ${activeSection === link.id ? 'opacity-100 scale-110' : 'opacity-70'}`}></i>
                                            <span>{link.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Region: Action Buttons */}
                        <div className="flex items-center justify-end shrink-0 gap-3">
                            <button
                                onClick={toggleLanguage}
                                className="flex w-10 h-10 items-center justify-center bg-[var(--theme-nav-btn-bg)] rounded-full hover:bg-[var(--theme-nav-btn-hover)] transition-all shrink-0 text-[var(--theme-nav-text)] font-black text-xs focus:outline-none"
                                aria-label="Toggle Language"
                            >
                                <span className="flex items-center gap-1">
                                    <i className="fas fa-globe"></i>
                                    {language === 'en' ? 'AR' : 'EN'}
                                </span>
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="flex w-10 h-10 items-center justify-center bg-[var(--theme-nav-btn-bg)] rounded-full hover:bg-[var(--theme-nav-btn-hover)] transition-all shrink-0 text-[var(--theme-nav-text)] focus:outline-none"
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-base`}></i>
                            </button>

                            <button
                                onClick={toggleMenu}
                                className="xl:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none z-[1001] bg-[var(--theme-nav-btn-bg)] rounded-full hover:bg-[var(--theme-nav-btn-hover)] transition-all shrink-0"
                                aria-label="Toggle Menu"
                            >
                                <span className={`w-5 h-0.5 bg-[var(--theme-nav-text)] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-[var(--theme-nav-text)] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-[var(--theme-nav-text)] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </button>

                            <a
                                href="#contact"
                                onClick={(e) => handleNavClick(e, 'contact')}
                                className={`hidden md:flex items-center shrink-0 gap-2 2xl:gap-2.5 px-4 2xl:px-6 py-2.5 text-[10px] 2xl:text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-500 ${activeSection === 'contact' ? 'bg-[var(--theme-nav-contact-active-bg)] text-[var(--theme-nav-contact-active-text)] ring-2 ring-[var(--theme-nav-contact-active-ring)]' : 'bg-[var(--theme-accent)] text-black'}`}
                            >
                                <i className="fas fa-paper-plane text-xs rtl:rotate-180"></i>
                                <span className="hidden md:inline">{t('Contact')}</span>
                            </a>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                ref={menuOverlayRef}
                className="fixed inset-0 z-[999] bg-[#0a0c10]/98 backdrop-blur-2xl lg:hidden"
                style={{ opacity: 0, transform: 'translateY(-100%)', pointerEvents: 'none' }}
            >
                <div ref={menuItemsRef} className="mobile-menu-content h-full flex flex-col justify-between p-12 py-32 relative z-10">
                    <ul className="flex flex-col gap-5 md:gap-6">
                        {[...navLinks, { name: language === 'ar' ? '╪ز┘ê╪د╪╡┘ ┘à╪╣┘è' : 'Contact', href: '#contact', id: 'contact', icon: 'fas fa-paper-plane' }].map((link, idx) => (
                            <li key={idx} className="mobile-nav-item">
                                <a
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.id)}
                                    className={`flex items-center gap-3.5 md:gap-5 text-[26px] md:text-3xl font-black uppercase tracking-tighter transition-all duration-500 ${activeSection === link.id ? 'text-[var(--theme-accent)]' : 'text-white'}`}
                                >
                                    <i className={`${link.icon} text-[22px] md:text-2xl opacity-70`}></i>
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="mobile-menu-footer border-t border-[rgba(255,255,255,0.1)] pt-12">
                        <p className="text-[var(--theme-text-dim)] uppercase text-[10px] font-black tracking-[0.2em] mb-6">{t("Let's Connect")}</p>
                        <div className="flex gap-8">
                            {socialLinks.navbarMobile.map((social, idx) => (
                                <a key={idx} href={social.link} target="_blank" rel="noopener noreferrer" className="text-[35px] md:text-3xl text-white hover:text-[var(--theme-accent)] transition-all relative z-50">
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
