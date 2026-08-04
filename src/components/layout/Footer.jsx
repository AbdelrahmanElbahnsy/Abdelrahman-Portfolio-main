import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useEffect } from 'react';
import { SiMicrosoftazure } from 'react-icons/si';

const Footer = () => {
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

    const fullName = profileData?.fullName || 'Abdelrahman El-bahnsy';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'El-bahnsy';
    const availabilityStatus = heroData?.availabilityStatus || 'Available for Work';
    const footerTagline = 'Architecting reliable, scalable, and secure cloud ecosystems with a DevOps mindset.';
    const copyrightYear = new Date().getFullYear();

    const socialLinks = {
        footer: [
            { icon: 'fab fa-github', link: 'https://github.com/AbdelrahmanElbahnsy', title: 'GitHub' },
            { icon: 'fab fa-linkedin-in', link: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BfPxex%2FALS7qj1yrt9OK5kw%3D%3D', title: 'LinkedIn' },
            { icon: 'fas fa-envelope', link: 'mailto:abdelrahmanelbahnsy3@gmail.com', title: 'Email' }
        ]
    };

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
        <footer id="footer" className="py-7 md:py-8 lg:py-10 bg-transparent border-t border-[var(--clr-card-border)]" ref={footerRef}>
            <div className="page-container">
                <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-8 md:px-0">
                    <div className="footer-col footer-brand space-y-6">
                        <a href="#" className="logo text-2xl font-black">
                            <span className="logo-code text-[var(--clr-accent)]">&lt;</span>{firstName.toUpperCase()}<span className="logo-code text-[var(--clr-accent)]">/</span>{lastName.toUpperCase()}<span className="logo-code text-[var(--clr-accent)]">&gt;</span>
                        </a>
                        <p className="footer-desc text-[var(--clr-text-dim)] max-w-xs leading-relaxed">
                            {footerTagline}
                        </p>
                        <div className="status-badge inline-flex items-center gap-2 px-3 py-1 bg-[rgba(39,201,63,0.1)] border border-[rgba(39,201,63,0.2)] rounded-full text-[10px] font-bold text-[#27c93f] uppercase tracking-widest">
                            <span className="status-dot w-2 h-2 rounded-full bg-[#27c93f] animate-pulse"></span>
                            {availabilityStatus}
                        </div>
                    </div>

                    <div className="footer-col footer-nav">
                        <h4 className="text-lg font-bold mb-6">$ ls ./links</h4>
                        <ul className="grid grid-cols-2 gap-4">
                            <li><a href="#about" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">About</a></li>
                            <li><a href="#skills" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Skills</a></li>
                            <li><a href="#projects" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Projects</a></li>
                            <li><a href="#journey" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Journey</a></li>
                            <li><a href="#certifications" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Certifications</a></li>
                            <li><a href="#contact" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-col footer-right">
                        <h4 className="text-lg font-bold mb-6">$ cat ./contact</h4>
                        <div className="footer-social-icons flex gap-4 mb-8">
                            {socialLinks.footer.map((social, i) => (
                                <a key={i} href={social.link} target="_blank" rel="noreferrer" title={social.title} className="footer-social-icon text-xl text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-all hover:scale-110">
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                        <div className="tech-stack-minimal flex gap-4 text-xl text-[var(--clr-text-dim)] opacity-30">
                            <span title="Azure"><SiMicrosoftazure /></span>
                            <span title="Docker"><i className="fab fa-docker"></i></span>
                            <span title="Kubernetes"><i className="fas fa-dharmachakra"></i></span>
                            <span title="Terraform"><i className="fas fa-code"></i></span>
                            <span title="Jenkins"><i className="fab fa-jenkins"></i></span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom mt-16 pt-8 border-t border-[rgba(255,255,255,0.05)] text-center text-[var(--clr-text-dim)] text-xs font-mono">
                    <p>Designed & Built by {fullName} &copy; {copyrightYear}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
