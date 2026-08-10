import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { personalInfo, socialLinks } from '../../data/portfolioData';
import { SiMicrosoftazure } from 'react-icons/si';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const Footer = () => {
    const { t, language } = useLanguage();
    const { data: profileData, subscribe: subscribeProfile } = useFirestoreSingleDoc('profile', 'main');
    const { data: heroData, subscribe: subscribeHero } = useFirestoreSingleDoc('hero', 'main');

    useEffect(() => {
        const unsubscribeProfile = subscribeProfile();
        const unsubscribeHero = subscribeHero();
        return () => {
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribeHero) unsubscribeHero();
        };
    }, [subscribeProfile, subscribeHero]);

    const fallbackFirstName = personalInfo.firstName;
    const fallbackLastName = personalInfo.lastName;

    const fullName = profileData?.fullName;
    let firstName = fallbackFirstName;
    let lastName = fallbackLastName;
    
    if (fullName) {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || fallbackFirstName;
        lastName = nameParts.slice(1).join(' ') || fallbackLastName;
    }
    
    const footerTagline = language === 'ar' ? (profileData?.footerTaglineAr || personalInfo.footerTaglineAr || profileData?.footerTagline || personalInfo.footerTagline) : (profileData?.footerTagline || personalInfo.footerTagline);
    const availabilityStatus = language === 'ar' ? (heroData?.availabilityStatusAr || personalInfo.availabilityStatusAr || heroData?.availabilityStatus || personalInfo.availabilityStatus) : (heroData?.availabilityStatus || personalInfo.availabilityStatus);
    const copyrightYear = new Date().getFullYear();
    const footerRef = useRef(null);

    useGSAP(
        () => {
            const columns = footerRef.current?.querySelectorAll('.footer-col');
            const socials = footerRef.current?.querySelectorAll('.footer-social-icon');

            const tl = gsap.timeline({
                scrollTrigger: { 
                    trigger: footerRef.current, 
                    start: 'top 90%', 
                    toggleActions: 'play none none none' 
                }
            });

            if (columns?.length) {
                tl.fromTo(columns, 
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
                );
            }

            if (socials?.length) {
                tl.fromTo(socials, 
                    { opacity: 0, scale: 0.3 },
                    { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(2)' },
                    "<0.3" // Start slightly after columns begin
                );
            }
        },
        { scope: footerRef, dependencies: [] },
    );

    return (
        <footer id="footer" className="py-7 md:py-8 lg:py-10 bg-[var(--theme-surface)] border-t border-[var(--theme-border-strong)]" ref={footerRef}>
            <div className="page-container">
                <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-8 md:px-0">
                    <div className="footer-col footer-brand space-y-6">
                        <a href="#" className="logo text-lg sm:text-2xl font-black text-[var(--theme-text)] flex items-center gap-1 flex-wrap" dir="ltr">
                            {language === 'ar' ? (
                                /* Arabic: render as a single RTL unit, never split */
                                <span dir="ltr" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    <span className="logo-code text-[var(--theme-accent)]">&lt; </span>
                                    <span dir="rtl" style={{ unicodeBidi: 'isolate', whiteSpace: 'nowrap' }}>
                                        {profileData?.firstNameAr || personalInfo.firstNameAr}
                                        <span className="logo-code text-[var(--theme-accent)]"> / </span>
                                        {profileData?.lastNameAr || personalInfo.lastNameAr}
                                    </span>
                                    <span className="logo-code text-[var(--theme-accent)]"> &gt;</span>
                                </span>
                            ) : (
                                /* English: render the full name as ONE non-breaking LTR unit unless extremely small */
                                <span dir="ltr" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
                                    <span className="logo-code text-[var(--theme-accent)]">&lt;</span>
                                    <span style={{ wordBreak: 'keep-all' }}>{firstName.toUpperCase()}</span>
                                    <span className="logo-code text-[var(--theme-accent)]">/</span>
                                    <span style={{ wordBreak: 'keep-all' }}>{lastName.toUpperCase()}</span>
                                    <span className="logo-code text-[var(--theme-accent)]">&gt;</span>
                                </span>
                            )}
                        </a>
                        <p className="footer-desc text-[var(--theme-text-secondary)] max-w-xs leading-relaxed text-left rtl:text-right" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {footerTagline}
                        </p>
                        <div className="status-badge inline-flex items-center gap-2 px-3 py-1 bg-[rgba(39,201,63,0.1)] border border-[rgba(39,201,63,0.2)] rounded-full text-[10px] font-bold text-[#27c93f] uppercase tracking-widest">
                            <span className="status-dot w-2 h-2 rounded-full bg-[#27c93f] animate-pulse"></span>
                            {t(availabilityStatus)}
                        </div>
                    </div>

                    <div className="footer-col footer-nav">
                        <h4 className="text-lg font-bold mb-6 text-[var(--theme-text)] text-left rtl:text-right" dir="ltr">$ ls ./links</h4>
                        <ul className="grid grid-cols-2 gap-4 text-left rtl:text-right">
                            <li><a href="#about" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors">{t('About')}</a></li>
                            <li><a href="#skills" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors">{t('Skills')}</a></li>
                            <li><a href="#projects" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors">{t('Projects')}</a></li>
                            <li><a href="#journey" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors">{t('Journey')}</a></li>
                            <li><a href="#certifications" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors">{t('Certifications')}</a></li>
                            <li><a href="#contact" className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors">{t('Contact')}</a></li>
                        </ul>
                    </div>

                    <div className="footer-col footer-right flex flex-col items-start rtl:items-end">
                        <h4 className="text-lg font-bold mb-6 text-[var(--theme-text)] text-left rtl:text-right" dir="ltr">$ cat ./contact</h4>
                        <div className="footer-social-icons flex gap-4 mb-8">
                            {socialLinks.footer.map((social, i) => (
                                <a key={i} href={social.link} target="_blank" rel="noreferrer" title={social.title} className="footer-social-icon text-xl text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-all hover:scale-110">
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                        <div className="tech-stack-minimal flex gap-4 text-xl text-[var(--theme-text-secondary)] opacity-30">
                            <span title="Azure"><SiMicrosoftazure /></span>
                            <span title="Docker"><i className="fab fa-docker"></i></span>
                            <span title="Kubernetes"><i className="fas fa-dharmachakra"></i></span>
                            <span title="Terraform"><i className="fas fa-code"></i></span>
                            <span title="Jenkins"><i className="fab fa-jenkins"></i></span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom mt-16 pt-8 border-t border-[var(--theme-border-strong)] text-center text-[var(--theme-text-muted)] text-xs font-mono">
                    <p>{t('Designed & Built by')} {personalInfo.fullName} &copy; {copyrightYear}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
