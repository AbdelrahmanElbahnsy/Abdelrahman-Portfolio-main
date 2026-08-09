import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { personalInfo, socialLinks } from '../../data/portfolioData';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';

const Navbar = ({ splashDone = true }) => {
    const { data: profileData, subscribe: subscribeProfile } = useFirestoreSingleDoc('profile', 'main');
    const { data: navbarItemsData, subscribe: subscribeNavbar } = useFirestoreCrud('navbarItems', { orderByField: 'order', orderDirection: 'asc' });

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
                
                return {
                    name: item.label || item.name || fallbackLink.name || 'Untitled',
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
    }, [navbarItemsData]);

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
            <header ref={headerRef} className={`sticky top-0 left-0 w-full z-[1000] transition-all duration-700 ${isScrolled ? 'pt-4' : 'pt-8'}`}>
                <div className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'max-w-[1240px] px-8' : 'page-container px-4'}`}>
                    <nav ref={navRef} className={`w-full box-border flex flex-nowrap items-center px-4 xl:px-6 py-2.5 rounded-full border transition-all duration-700 ${isScrolled ? 'bg-[rgba(10,14,23,0.98)] border-[rgba(200,162,110,0.35)] shadow-[0_15px_50px_rgba(0,0,0,0.7)]' : 'bg-transparent border-transparent'}`}>
                        {/* Left Region: Logo */}
                        <div className="flex items-center shrink-0">
                            <a href="#hero" className="logo flex items-center gap-2 group" onClick={(e) => handleNavClick(e, 'hero')}>
                                <span className={`font-black tracking-tighter text-white transition-all duration-500 ${isScrolled ? 'text-lg xl:text-xl' : 'text-xl xl:text-2xl'}`}>
                                    <span className="text-[var(--clr-accent)]">&lt;</span>{firstName.charAt(0)}<span className="hidden md:inline">{firstName.slice(1).toUpperCase()}</span><span className="text-[var(--clr-accent)]">/</span>{lastName.charAt(0)}<span className="hidden md:inline">{lastName.slice(1).toUpperCase()}</span><span className="text-[var(--clr-accent)]">&gt;</span>
                                </span>
                            </a>
                        </div>

                        {/* Center Region: Navigation Links */}
                        <div className="hidden xl:flex flex-1 min-w-0 justify-center px-4">
                            <ul className="flex flex-nowrap items-center justify-center gap-1 2xl:gap-2">
                                {navLinks.map((link, idx) => (
                                    <li key={idx} className="flex items-center shrink-0">
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.id)}
                                            className={`flex items-center justify-center gap-1.5 px-2.5 2xl:px-4 py-2.5 rounded-full text-[10px] 2xl:text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${activeSection === link.id ? 'bg-[var(--clr-accent)] text-black shadow-[0_0_20px_rgba(200,162,110,0.5)]' : 'text-[var(--clr-text-dim)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]'}`}
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
                                onClick={toggleMenu}
                                className="xl:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none z-[1001] bg-[rgba(255,255,255,0.05)] rounded-full hover:bg-[rgba(255,255,255,0.12)] transition-all shrink-0"
                                aria-label="Toggle Menu"
                            >
                                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </button>

                            <a
                                href="#contact"
                                onClick={(e) => handleNavClick(e, 'contact')}
                                className={`hidden md:flex items-center shrink-0 gap-2 2xl:gap-2.5 px-4 2xl:px-6 py-2.5 text-[10px] 2xl:text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-500 ${activeSection === 'contact' ? 'bg-white text-black ring-2 ring-white' : 'bg-[var(--clr-accent)] text-black'}`}
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                                <span className="hidden md:inline">Contact</span>
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
                        {[...navLinks, { name: 'Contact', href: '#contact', id: 'contact', icon: 'fas fa-paper-plane' }].map((link, idx) => (
                            <li key={idx} className="mobile-nav-item">
                                <a
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.id)}
                                    className={`flex items-center gap-3.5 md:gap-5 text-[26px] md:text-3xl font-black uppercase tracking-tighter transition-all duration-500 ${activeSection === link.id ? 'text-[var(--clr-accent)]' : 'text-white'}`}
                                >
                                    <i className={`${link.icon} text-[22px] md:text-2xl opacity-70`}></i>
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="mobile-menu-footer border-t border-[rgba(255,255,255,0.1)] pt-12">
                        <p className="text-[var(--clr-text-dim)] uppercase text-[10px] font-black tracking-[0.2em] mb-6">Let's Connect</p>
                        <div className="flex gap-8">
                            {socialLinks.navbarMobile.map((social, idx) => (
                                <a key={idx} href={social.link} target="_blank" rel="noopener noreferrer" className="text-[35px] md:text-3xl text-white hover:text-[var(--clr-accent)] transition-all relative z-50">
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
