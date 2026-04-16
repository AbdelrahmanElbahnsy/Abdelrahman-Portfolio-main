import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
    const [status, setStatus] = useState("READY");
    const [logLines, setLogLines] = useState([]);
    const [finalSuccess, setFinalSuccess] = useState(false);
    const formRef = useRef();
    const logOutputRef = useRef();

    const SERVICE_ID = "service_xqf8lth";
    const TEMPLATE_ID = "template_0fafhc9";
    const PUBLIC_KEY = "5ARUwkGWcGbfTxqeO";

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
        sequence.forEach((line, index) => {
            currentDelay += line.delay;
            setTimeout(() => {
                setLogLines(prev => [...prev, { text: line.text, class: "" }]);
            }, currentDelay);
        });

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
            .then(() => {
                setTimeout(() => {
                    setLogLines(prev => [...prev, { text: "$ message delivered successfully âœ”", class: "success" }]);
                    setTimeout(() => {
                        setFinalSuccess(true);
                        setStatus("DEPLOYED");
                    }, 900);
                }, currentDelay + 1000);
            })
            .catch((error) => {
                console.error("EmailJS error:", error);
                setTimeout(() => {
                    setLogLines(prev => [...prev, { text: "$ ERROR: Failed to send message. Please try again.", class: "error" }]);
                    setStatus("FAILED");
                    setTimeout(() => {
                        setStatus("READY");
                        setLogLines([]);
                    }, 3000);
                }, currentDelay + 1000);
            });
    };

    return (
        <section id="contact" className="section">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="section-header animate-up text-center mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">Get In Touch</span>
                    <h2 className="section-title text-2xl sm:text-3xl md:text-5xl font-black mb-4">Deployment Request</h2>
                </div>

                <div className="contact-grid grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Channels */}
                    <div className="contact-left animate-left">
                        <div className="contact-info-wrapper space-y-8">
                            <div className="channels-section bg-[var(--clr-card-bg)] border border-[var(--clr-card-border)] p-6 sm:p-8 rounded-2xl">
                                <h3 className="contact-sub-title text-[var(--clr-accent)] font-bold flex items-center gap-3 mb-6">
                                    <i className="fas fa-network-wired"></i> Contact Channels
                                </h3>
                                <div className="channel-list space-y-6">
                                    {[
                                        { icon: 'fas fa-envelope', label: 'Email', value: 'ahmed.1707.hamed@gmail.com', link: 'mailto:ahmed.1707.hamed@gmail.com' },
                                        { icon: 'fas fa-phone', label: 'Phone', value: '01062425594', link: 'tel:01062425594' },
                                        { icon: 'fab fa-github', label: 'GitHub', value: 'github.com/ahmed1707hamed-tech', link: 'https://github.com/ahmed1707hamed-tech' },
                                        { icon: 'fab fa-linkedin', label: 'LinkedIn', value: 'LinkedIn Profile', link: 'https://www.linkedin.com/in/ahmed-hamed-340570364' },
                                        { icon: 'fas fa-map-marker-alt', label: 'Location', value: 'Mansoura, Egypt', link: null }
                                    ].map((channel, i) => (
                                        <div key={i} className="channel-item flex items-center gap-4 group">
                                            <div className="icon-box w-12 h-12 flex-shrink-0 sm:w-14 sm:h-14 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-[var(--clr-accent)] text-lg sm:text-xl group-hover:scale-110 transition-all border border-[rgba(255,255,255,0.05)]">
                                                <i className={channel.icon}></i>
                                            </div>
                                            <div className="channel-info min-w-0 flex-1">
                                                <span className="channel-label text-[10px] font-mono uppercase tracking-widest text-[var(--clr-text-dim)] block mb-1">{channel.label}</span>
                                                {channel.link ? (
                                                    <a href={channel.link} className="channel-link font-bold text-[var(--clr-text)] hover:text-[var(--clr-accent)] transition-colors break-all text-sm sm:text-base leading-tight block">{channel.value}</a>
                                                ) : (
                                                    <span className="channel-value font-bold text-[var(--clr-text)] text-sm sm:text-base">{channel.value}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Terminal Form */}
                    <div className="contact-right animate-right">
                        <div className="terminal-form-window bg-[var(--clr-terminal-bg)] rounded-2xl border border-[var(--clr-card-border)] overflow-hidden shadow-2xl">
                            <div className="terminal-header py-4 px-6 bg-[var(--clr-terminal-header)] flex items-center justify-between border-b border-[rgba(255,255,255,0.05)]">
                                <div className="terminal-buttons flex gap-2">
                                    <span className="dot w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                                    <span className="dot w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                                    <span className="dot w-3 h-3 rounded-full bg-[#27c93f]"></span>
                                </div>
                                <div className="terminal-title font-mono text-xs text-[var(--clr-text-dim)]">message.sh</div>
                                <div className="terminal-status font-mono text-[10px] text-[var(--clr-text-dim)]">
                                    STATUS: <span className={`status-text ${status === 'DEPLOYED' ? 'text-[#27c93f]' : status === 'FAILED' ? 'text-[#ff5f56]' : 'text-inherit'}`}>{status}</span>
                                </div>
                            </div>
                            <div className="terminal-body p-6 sm:p-8 min-h-[400px] relative">
                                {!finalSuccess ? (
                                    status === "READY" ? (
                                        <form className="devops-form space-y-6" ref={formRef} onSubmit={handleSubmit}>
                                            <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="form-group">
                                                    <label className="block text-xs font-mono text-[var(--clr-text-dim)] mb-2"><span className="text-[var(--clr-accent)] mr-2">$</span> Name</label>
                                                    <input type="text" name="from_name" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-sm focus:border-[var(--clr-accent)] outline-none" placeholder="Your full name" required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="block text-xs font-mono text-[var(--clr-text-dim)] mb-2"><span className="text-[var(--clr-accent)] mr-2">$</span> Email</label>
                                                    <input type="email" name="from_email" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-sm focus:border-[var(--clr-accent)] outline-none" placeholder="your@email.com" required />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-xs font-mono text-[var(--clr-text-dim)] mb-2"><span className="text-[var(--clr-accent)] mr-2">$</span> Subject</label>
                                                <select name="subject" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-sm focus:border-[var(--clr-accent)] outline-none" required>
                                                    <option value="" disabled>Select an option</option>
                                                    <option value="Job Opportunity">Job Opportunity</option>
                                                    <option value="Collaboration">Collaboration</option>
                                                    <option value="Internship">Internship</option>
                                                    <option value="General Inquiry">General Inquiry</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="block text-xs font-mono text-[var(--clr-text-dim)] mb-2"><span className="text-[var(--clr-accent)] mr-2">$</span> Message</label>
                                                <textarea name="message" rows="4" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-sm focus:border-[var(--clr-accent)] outline-none resize-none" placeholder="Tell me about the opportunity..." required></textarea>
                                            </div>
                                            <button type="submit" className="terminal-submit-btn w-full py-4 bg-[var(--clr-accent)] text-black font-black uppercase text-sm rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all">
                                                Send Message <i className="fas fa-paper-plane"></i>
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="terminal-log-panel font-mono text-xs space-y-2">
                                            {logLines.map((line, i) => (
                                                <div key={i} className={`log-line ${line.class === 'success' ? 'text-[#27c93f]' : line.class === 'error' ? 'text-[#ff5f56]' : 'text-[var(--clr-text)]'}`}>
                                                    {line.text}
                                                </div>
                                            ))}
                                            <div className="log-line text-[var(--clr-accent)] animate-pulse">_</div>
                                        </div>
                                    )
                                ) : (
                                    <div className="success-message text-center py-12 animate-in">
                                        <i className="fas fa-check-circle text-6xl text-[#27c93f] mb-6"></i>
                                        <h3 className="text-2xl font-bold mb-2">Message Delivered</h3>
                                        <p className="text-[var(--clr-text-dim)]">Thank you! I'll get back to you soon.</p>
                                        <button onClick={() => { setFinalSuccess(false); setStatus("READY"); setLogLines([]); }} className="mt-8 text-[var(--clr-accent)] underline font-mono text-sm">Send another?</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Available For */}
                <div className="opportunity-section-full mt-24 pt-24 border-t border-[rgba(255,255,255,0.05)] text-center animate-up">
                    <h3 className="contact-sub-title text-[var(--clr-accent)] font-bold flex items-center justify-center gap-3 mb-12">
                        <i className="fas fa-briefcase"></i> Available For
                    </h3>
                    <div className="opp-cards-full grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: 'fas fa-graduation-cap', title: 'Internships', desc: 'Cloud & DevOps programs' },
                            { icon: 'fas fa-user-gear', title: 'Junior DevOps Roles', desc: 'Entry-level engineering' },
                            { icon: 'fab fa-aws', title: 'Cloud Engineering', desc: 'AWS infrastructure roles' }
                        ].map((opp, i) => (
                            <div key={i} className="opp-card p-6 sm:p-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl hover:border-[var(--clr-accent)] transition-all group">
                                <div className="opp-icon text-3xl text-[var(--clr-accent)] mb-4 group-hover:scale-110 transition-transform">
                                    <i className={opp.icon}></i>
                                </div>
                                <h4 className="font-bold mb-2">{opp.title}</h4>
                                <p className="text-sm text-[var(--clr-text-dim)]">{opp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
