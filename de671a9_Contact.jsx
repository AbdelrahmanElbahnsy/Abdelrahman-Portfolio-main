import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { contact } from "../../data/portfolioData";
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useLanguage } from '../../i18n/LanguageContext';

const Contact = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState("READY");
    const [logLines, setLogLines] = useState([]);
    const [finalSuccess, setFinalSuccess] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [customSubject, setCustomSubject] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isDropdownOpen]);
    
    const formRef = useRef();
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const oppsRef = useRef(null);
    const { data: firestoreData, subscribe } = useFirestoreSingleDoc('contact', 'main');
    
    useEffect(() => {
        const unsubscribe = subscribe();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribe]);

    const contactData = React.useMemo(() => {
        if (!firestoreData) return contact;
        
        const mergedChannels = contact.channels.map(ch => {
            if (ch.label === 'Email' && firestoreData.email) return { ...ch, value: firestoreData.email, link: `mailto:${firestoreData.email}` };
            if (ch.label === 'Phone' && firestoreData.phone) return { ...ch, value: firestoreData.phone, link: `tel:${firestoreData.phone.replace(/[^0-9+]/g, '')}` };
            if (ch.label === 'Location' && firestoreData.location) return { ...ch, value: firestoreData.location };
            return ch;
        });

        return {
            ...contact,
            ...firestoreData,
            channels: mergedChannels,
            opportunities: firestoreData.opportunities || contact.opportunities,
            formSubjects: firestoreData.formSubjects || contact.formSubjects,
            emailjs: contact.emailjs // Always fallback to local config for API keys
        };
    }, [firestoreData]);
    const { subtitle, title, channels, formSubjects, opportunities, emailjs: emailjsConfig } = contactData;
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || emailjsConfig.SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || emailjsConfig.TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || emailjsConfig.PUBLIC_KEY;

    // GSAP animations
    useGSAP(
        () => {
            const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
            const titleEl = headerRef.current?.querySelector('.section-title');
            const channelItems = leftRef.current?.querySelectorAll('.channel-item');
            const oppCards = oppsRef.current?.querySelectorAll('.opp-card');

            gsap.set([subtitleEl, titleEl].filter(Boolean), { opacity: 0, y: 30 });
            gsap.set(leftRef.current, { opacity: 0, x: -35 });
            gsap.set(rightRef.current, { opacity: 0, x: 35, rotateY: 3 });
            if (channelItems?.length) gsap.set(channelItems, { opacity: 0, x: -20 });
            if (oppCards?.length) gsap.set(oppCards, { opacity: 0, y: 30 });

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
            });

            tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
              .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15')
              .to(leftRef.current, { opacity: 1, x: 0, duration: 0.5 }, '-=0.1')

            if (channelItems?.length) {
                tl.to(channelItems, { opacity: 1, x: 0, duration: 0.3, stagger: 0.05 }, '-=0.3');
            }

            tl.to(rightRef.current, { opacity: 1, x: 0, rotateY: 0, transformPerspective: 800, duration: 0.6 }, '-=0.2')

            if (oppCards?.length) {
                gsap.set(oppCards, { opacity: 0, y: 30 });
                const oppTl = gsap.timeline({
                    defaults: { ease: 'power3.out' },
                    scrollTrigger: { trigger: oppsRef.current, start: 'top 85%', toggleActions: 'play none none none' },
                });
                oppTl.to(oppCards, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 });
            }
        },
        { scope: sectionRef, dependencies: [] },
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("PROVISIONING");
        setLogLines([]);

        const sequence = [
            { text: "$ initializing deployment sequence...", delay: 600 },
            { text: "$ connecting to mail-relay.aws.internal...", delay: 800 },
            { text: "$ authenticating session...", delay: 500 },
            { text: "$ encapsulating payload...", delay: 700 },
            { text: "$ transmitting data...", delay: 1000 }
        ];

        let currentDelay = 0;
        sequence.forEach((line) => {
            currentDelay += line.delay;
            setTimeout(() => {
                setLogLines(prev => [...prev, { text: line.text, class: "" }]);
            }, currentDelay);
        });

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, { publicKey: PUBLIC_KEY })
            .then(() => {
                setTimeout(() => {
                    setLogLines(prev => [...prev, { text: "$ message delivered successfully ✔", class: "success" }]);
                    setTimeout(() => {
                        setFinalSuccess(true);
                        setStatus("DEPLOYED");
                    }, 900);
                }, currentDelay + 1000);
            })
            .catch((error) => {
                console.error("EmailJS error status:", error?.status);
                console.error("EmailJS error text:", error?.text);
                console.error("EmailJS error message:", error?.message);
                console.error("EmailJS error raw:", error);
                setTimeout(() => {
                    setLogLines(prev => [...prev, { text: `$ ERROR: Failed to send message (${error?.text || 'Unknown Error'}).`, class: "error" }]);
                    setStatus("FAILED");
                    setTimeout(() => {
                        setStatus("READY");
                        setLogLines([]);
                    }, 3000);
                }, currentDelay + 1000);
            });
    };

    return (
        <section id="contact" className="section" ref={sectionRef}>
            <div className="container mx-auto px-4 sm:px-8">
                <div ref={headerRef} className="section-header text-center mb-16">
                    <span className="section-subtitle text-[var(--theme-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">{t(subtitle)}</span>
                    <h2 className="section-title text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-[var(--theme-text)]">{t(title)}</h2>
                </div>

                <div className="contact-grid grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div ref={leftRef} className="contact-left">
                        <div className="contact-info-wrapper space-y-8">
                            <div className="channels-section bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] p-6 sm:p-8 rounded-2xl">
                                <h3 className="contact-sub-title text-[var(--theme-accent)] font-bold flex items-center gap-3 mb-6 rtl:flex-row-reverse rtl:justify-end">
                                    <i className="fas fa-network-wired"></i> {t('Contact Channels')}
                                </h3>
                                <div className="channel-list space-y-6">
                                    {channels.map((channel, i) => (
                                        <div key={i} className="channel-item flex items-center gap-4 group">
                                            <div className="icon-box w-12 h-12 flex-shrink-0 sm:w-14 sm:h-14 rounded-xl bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-accent)] text-lg sm:text-xl group-hover:scale-110 transition-all border border-[var(--theme-border-strong)]">
                                                <i className={channel.icon}></i>
                                            </div>
                                            <div className="channel-info min-w-0 flex-1 text-left rtl:text-right">
                                                <span className="channel-label text-[10px] font-mono uppercase tracking-widest text-[var(--theme-text-muted)] block mb-1">{t(channel.label)}</span>
                                                {channel.link ? (
                                                    <a href={channel.link} className="channel-link font-bold text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors break-words text-sm sm:text-base leading-tight block rtl:text-left rtl:inline-block" style={{ overflowWrap: 'anywhere' }} dir="ltr">{channel.value}</a>
                                                ) : (
                                                    <span className="channel-value font-bold text-[var(--theme-text)] break-words text-sm sm:text-base rtl:text-left rtl:inline-block" style={{ overflowWrap: 'anywhere' }} dir="ltr">{channel.value}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div ref={rightRef} className="contact-right">
                        <div className="terminal-form-window bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border-strong)] overflow-hidden shadow-2xl">
                            <div className="terminal-header py-4 px-6 bg-[var(--theme-surface-elevated)] flex items-center justify-between border-b border-[var(--theme-border-strong)]">
                                <div className="terminal-buttons flex gap-2">
                                    <span className="dot w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                                    <span className="dot w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                                    <span className="dot w-3 h-3 rounded-full bg-[#27c93f]"></span>
                                </div>
                                <div className="terminal-title font-mono text-xs text-[var(--theme-text-secondary)]">message.sh</div>
                                <div className="terminal-status font-mono text-[10px] text-[var(--theme-text-secondary)]">
                                    {t('STATUS')}: <span className={`status-text ${status === 'DEPLOYED' ? 'text-[#27c93f]' : status === 'FAILED' ? 'text-[#ff5f56]' : 'text-[var(--theme-text)]'}`}>{t(status)}</span>
                                </div>
                            </div>
                            <div className="terminal-body p-6 sm:p-8 min-h-[400px] relative text-left" dir="ltr">
                                {!finalSuccess ? (
                                    status === "READY" ? (
                                        <form className="devops-form space-y-6" ref={formRef} onSubmit={handleSubmit} autoComplete="off">
                                            <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="form-group">
                                                    <label className="block text-xs font-mono text-[var(--theme-text-secondary)] mb-2 text-left rtl:text-right" dir="auto"><span className="text-[var(--theme-accent)] mr-2 rtl:mr-0 rtl:ml-2" dir="ltr">$</span> {t('Name')}</label>
                                                    <input type="text" name="contact_name_field" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} className="w-full bg-transparent border border-[var(--theme-border-strong)] rounded-lg p-3 text-sm text-[var(--theme-text)] focus:border-[var(--theme-accent)] outline-none" placeholder={t('Your full name')} required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="block text-xs font-mono text-[var(--theme-text-secondary)] mb-2 text-left rtl:text-right" dir="auto"><span className="text-[var(--theme-accent)] mr-2 rtl:mr-0 rtl:ml-2" dir="ltr">$</span> {t('Email')}</label>
                                                    <input type="email" name="contact_email_field" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} className="w-full bg-transparent border border-[var(--theme-border-strong)] rounded-lg p-3 text-sm text-[var(--theme-text)] focus:border-[var(--theme-accent)] outline-none" placeholder={t('your@email.com')} required />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-xs font-mono text-[var(--theme-text-secondary)] mb-2 text-left rtl:text-right" dir="auto"><span className="text-[var(--theme-accent)] mr-2 rtl:mr-0 rtl:ml-2" dir="ltr">$</span> {t('Subject')}</label>
                                                <div className="relative" ref={dropdownRef}>
                                                    {/* Visually hidden text input so HTML5 validation works */}
                                                    {selectedSubject !== 'Other (Specify)' && (
                                                        <input type="text" name="subject" value={selectedSubject} onChange={() => {}} required className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0 pointer-events-none" tabIndex="-1" />
                                                    )}
                                                    
                                                    {/* Custom Select Button */}
                                                    <div
                                                        className={`w-full bg-transparent border rounded-lg p-3 text-sm flex justify-between items-center cursor-pointer outline-none transition-colors ${
                                                            isDropdownOpen ? 'border-[var(--theme-accent)]' : 'border-[var(--theme-border-strong)] hover:border-[var(--theme-border-gold)]'
                                                        }`}
                                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    >
                                                        <span className={selectedSubject ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-secondary)]'}>
                                                            {selectedSubject ? t(selectedSubject) : t('Select an option')}
                                                        </span>
                                                        <i className={`fas fa-chevron-down text-[var(--theme-text-secondary)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                                                    </div>
                                                    
                                                    {/* Dropdown Options */}
                                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? 'max-h-64 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        <ul className="bg-[var(--theme-surface-elevated)] border border-[var(--theme-accent)] rounded-lg overflow-hidden shadow-2xl">
                                                            {formSubjects.map((subject) => (
                                                                <li
                                                                    key={subject}
                                                                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                                                                        selectedSubject === subject
                                                                            ? 'bg-[var(--theme-accent)] text-[var(--theme-btn-text)] font-bold'
                                                                            : 'text-[var(--theme-text)] hover:bg-[var(--theme-accent-soft)]'
                                                                    }`}
                                                                    onClick={() => {
                                                                        setSelectedSubject(subject);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                >
                                                                    {t(subject)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                
                                                {/* Custom Subject Input */}
                                                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedSubject === 'Other (Specify)' ? 'max-h-32 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                                                    <label className="block text-xs font-mono text-[var(--theme-text-secondary)] mb-2 text-left rtl:text-right" dir="auto"><span className="text-[var(--theme-accent)] mr-2 rtl:mr-0 rtl:ml-2" dir="ltr">$</span> {t('Specify your subject')}</label>
                                                    <input 
                                                        type="text" 
                                                        name={selectedSubject === 'Other (Specify)' ? "subject" : ""} 
                                                        value={customSubject} 
                                                        onChange={(e) => setCustomSubject(e.target.value)} 
                                                        required={selectedSubject === 'Other (Specify)'} 
                                                        className="w-full bg-transparent border border-[var(--theme-border-strong)] rounded-lg p-3 text-sm text-[var(--theme-text)] focus:border-[var(--theme-accent)] outline-none" 
                                                        placeholder={t('Please describe your request...')} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-xs font-mono text-[var(--theme-text-secondary)] mb-2 text-left rtl:text-right" dir="auto"><span className="text-[var(--theme-accent)] mr-2 rtl:mr-0 rtl:ml-2" dir="ltr">$</span> {t('Message')}</label>
                                                <textarea name="message" rows="4" className="w-full bg-transparent border border-[var(--theme-border-strong)] rounded-lg p-3 text-sm text-[var(--theme-text)] focus:border-[var(--theme-accent)] outline-none resize-none" placeholder={t('Tell me about the opportunity...')} required></textarea>
                                            </div>
                                            <button type="submit" className="terminal-submit-btn w-full py-4 bg-[var(--theme-accent)] text-[var(--theme-btn-text)] font-black uppercase text-sm rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_20px_var(--theme-accent-soft)] transition-all flex-row-reverse rtl:flex-row">
                                                <i className="fas fa-paper-plane rtl:rotate-180"></i> {t('Send Message')}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="terminal-log-panel font-mono text-xs space-y-2 text-left" dir="ltr">
                                            {logLines.map((line, i) => (
                                                <div key={i} className={`log-line ${line.class === 'success' ? 'text-[#27c93f]' : line.class === 'error' ? 'text-[#ff5f56]' : 'text-[var(--theme-text)]'}`}>
                                                    {line.text}
                                                </div>
                                            ))}
                                            <div className="log-line text-[var(--theme-accent)] animate-pulse">_</div>
                                        </div>
                                    )
                                ) : (
                                    <div className="success-message text-center py-12 animate-in">
                                        <i className="fas fa-check-circle text-6xl text-[#27c93f] mb-6"></i>
                                        <h3 className="text-2xl font-bold mb-2 text-[var(--theme-text)]">{t('Message Delivered')}</h3>
                                        <p className="text-[var(--theme-text-secondary)]">{t("Thank you! I'll get back to you soon.")}</p>
                                        <button onClick={() => { setFinalSuccess(false); setStatus("READY"); setLogLines([]); }} className="mt-8 text-[var(--theme-accent)] underline font-mono text-sm">{t('Send another?')}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div ref={oppsRef} className="opportunity-section-full mt-12 md:mt-16 pt-12 md:pt-16 border-t border-[var(--theme-border)] text-center">
                    <h3 className="contact-sub-title text-[var(--theme-accent)] font-bold flex items-center justify-center gap-3 mb-8 rtl:flex-row-reverse">
                        <i className="fas fa-briefcase"></i> {t('Available For')}
                    </h3>
                    <div className="opp-cards-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {opportunities.map((opp, i) => (
                            <div key={i} className="opp-card p-6 sm:p-8 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-strong)] rounded-2xl hover:border-[var(--theme-accent)] transition-all group">
                                <div className="opp-icon text-3xl text-[var(--theme-accent)] mb-4 group-hover:scale-110 transition-transform">
                                    <i className={opp.icon}></i>
                                </div>
                                <h4 className="font-bold mb-2 text-[var(--theme-text)]">{t(opp.title)}</h4>
                                <p className="text-sm text-[var(--theme-text-secondary)]">{t(opp.desc)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
