const Footer = () => {
    return (
        <footer id="footer" className="py-16 bg-transparent border-t border-[var(--clr-card-border)] animate-up">
            <div className="page-container">
                <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-8 md:px-0">
                    {/* Left Section: Branding */}
                    <div className="footer-brand space-y-6">
                        <a href="#" className="logo text-2xl font-black">
                            <span className="logo-code text-[var(--clr-accent)]">&lt;</span>AHMED<span className="logo-code text-[var(--clr-accent)]">/</span>HAMED<span className="logo-code text-[var(--clr-accent)]">&gt;</span>
                        </a>
                        <p className="footer-desc text-[var(--clr-text-dim)] max-w-xs leading-relaxed">
                            Automating Infrastructure & Building Scalable Cloud Solutions with Passion.
                        </p>
                        <div className="status-badge inline-flex items-center gap-2 px-3 py-1 bg-[rgba(39,201,63,0.1)] border border-[rgba(39,201,63,0.2)] rounded-full text-[10px] font-bold text-[#27c93f] uppercase tracking-widest">
                            <span className="status-dot w-2 h-2 rounded-full bg-[#27c93f] animate-pulse"></span>
                            Available for Opportunities
                        </div>
                    </div>

                    {/* Middle Section: Navigation */}
                    <div className="footer-nav">
                        <h4 className="text-lg font-bold mb-6">$ ls ./links</h4>
                        <ul className="grid grid-cols-2 gap-4">
                            <li><a href="#about" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">About</a></li>
                            <li><a href="#skills" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Skills</a></li>
                            <li><a href="#projects" className="text-[var(--clr-text-dim)] hover:text(--clr-accent)] transition-colors">Projects</a></li>
                            <li><a href="#journey" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Journey</a></li>
                            <li><a href="#certifications" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Certifications</a></li>
                            <li><a href="#contact" className="text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Right Section: Socials & Tech */}
                    <div className="footer-right">
                        <h4 className="text-lg font-bold mb-6">$ cat ./contact</h4>
                        <div className="footer-social-icons flex gap-4 mb-8">
                            {[
                                { link: 'https://www.facebook.com/share/1b7PbLPBpH/', icon: 'fab fa-facebook', title: 'Facebook' },
                                { link: 'https://www.instagram.com/_a7med_hamed?igsh=MTFtbHd6cTcxNzE3Yw==', icon: 'fab fa-instagram', title: 'Instagram' },
                                { link: 'https://www.linkedin.com/in/ahmed-hamed-340570364', icon: 'fab fa-linkedin', title: 'LinkedIn' },
                                { link: 'https://github.com/ahmed1707hamed-tech', icon: 'fab fa-github', title: 'GitHub' },
                                { link: 'https://wa.me/201062425594', icon: 'fab fa-whatsapp', title: 'WhatsApp' },
                                { link: 'https://x.com/AhmedHa23091122', icon: 'fab fa-twitter', title: 'Twitter' }
                            ].map((social, i) => (
                                <a key={i} href={social.link} target="_blank" rel="noreferrer" title={social.title} className="text-xl text-[var(--clr-text-dim)] hover:text-[var(--clr-accent)] transition-all hover:scale-110">
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                        <div className="tech-stack-minimal flex gap-4 text-xl text-[var(--clr-text-dim)] opacity-30">
                            <span title="AWS"><i className="fab fa-aws"></i></span>
                            <span title="Docker"><i className="fab fa-docker"></i></span>
                            <span title="Kubernetes"><i className="fas fa-dharmachakra"></i></span>
                            <span title="Terraform"><i className="fas fa-code"></i></span>
                            <span title="Jenkins"><i className="fab fa-jenkins"></i></span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom mt-16 pt-8 border-t border-[rgba(255,255,255,0.05)] text-center text-[var(--clr-text-dim)] text-xs font-mono">
                    <p>Designed & Built by Ahmed Hamed &copy; 2026</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
