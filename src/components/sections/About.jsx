import React from 'react';

const About = () => {
    const terminalItems = [
        { key: 'role', value: 'DevOps & Cloud Engineer' },
        // { key: 'experience', value: '7+ Years in IT Infrastructure' },
        { key: 'cloud', value: 'AWS (Solutions Architect)' },
        { key: 'containers', value: 'Docker, Kubernetes (EKS/AKS)' },
        { key: 'iac', value: 'Terraform, Ansible, CloudFormation' },
        { key: 'cicd', value: 'Jenkins, GitHub Actions, GitLab CI' },
        { key: 'monitoring', value: 'Prometheus, Grafana, ELK' },
        { key: 'os', value: 'Linux (Admin), Windows Server' },
        { key: 'networking', value: 'CCNA, CCNP Level Expertise' },
        { key: 'status', value: 'Available for New Challenges' },
    ];

    return (
        <section id="about" className="section">
            <div className="container mx-auto px-8">
                <div className="section-header mb-16 animate-up text-left">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">Discovery</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black">Beyond the Console</h2>
                </div>
                
                <div className="about-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
                    <div className="about-image order-2 md:order-1 h-full">
                        <div className="modern-terminal terminal-mini animate-up group h-full flex flex-col">
                            <div className="terminal-header bg-[var(--clr-terminal-header)] p-4 flex items-center gap-4 border-b border-[var(--clr-card-border)] shrink-0">
                                <div className="terminal-controls flex gap-2">
                                    <span className="dot red w-3.5 h-3.5 rounded-full bg-[#ff5f56]"></span>
                                    <span className="dot yellow w-3.5 h-3.5 rounded-full bg-[#ffbd2e]"></span>
                                    <span className="dot green w-3.5 h-3.5 rounded-full bg-[#27c93f]"></span>
                                </div>
                                <span className="terminal-title font-mono text-xs text-[var(--clr-text-dim)] uppercase tracking-wider">~/ahmed-hamed â€” devops-bash</span>
                            </div>
                            <div className="terminal-body bg-[var(--clr-terminal-bg)] p-6 md:p-8 flex-grow flex items-center overflow-x-hidden">
                                <ul className="terminal-list space-y-4 font-mono text-xs md:text-base w-full">
                                    {terminalItems.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 items-start">
                                            <span className="term-key text-[var(--clr-accent)] shrink-0">{item.key}:</span>
                                            <span className="term-value text-[var(--clr-text)] break-words">{item.value}</span>
                                        </li>
                                    ))}
                                    <li className="pt-2">
                                        <span className="text-[var(--clr-accent)] animate-pulse">_</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
 
                    <div className="about-text order-1 md:order-2 flex flex-col justify-center gap-6 text-left">
                        <p className="lead text-2xl font-bold text-[var(--clr-text)] border-l-4 border-[var(--clr-accent)] pl-6 py-2 bg-[rgba(0,210,255,0.03)]">From Enterprise Networking to Cloud Orchestration.</p>
                        <p className="text-[var(--clr-text-dim)] leading-relaxed text-lg">
                            Ahmed Hamed is a Cloud & DevOps Engineer with a robust technical foundation rooted in 
                            <strong className="text-white"> Enterprise Networking and System Administration</strong>. My journey began with 
                            deep-dives into CCNA, CCNP, and MCSA, which instilled in me a fundamental understanding 
                            of networking architecture and server infrastructure before transitioning into the modern 
                            world of Cloud Computing and DevOps.
                        </p>
                        <p className="text-[var(--clr-text-dim)] leading-relaxed text-lg">
                            I specialize in bridging the gap between hardware-level precision and cloud-scale 
                            automation. My focus is on creating high-performance, secure, and reliable environments 
                            through <span className="text-[var(--clr-accent)] italic">Infrastructure as Code (IaC)</span>, containerization, and automated CI/CD pipelines.
                        </p>
                        
                        <div className="about-badges flex flex-wrap gap-4 mt-6">
                            <div className="badge flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(0,210,255,0.15)] text-sm font-bold hover:border-[var(--clr-accent)] hover:bg-[rgba(0,210,255,0.05)] transition-all duration-300">
                                <i className="fas fa-shield-alt text-[var(--clr-accent)] text-lg"></i> Networking Mindset
                            </div>
                            <div className="badge flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(0,210,255,0.15)] text-sm font-bold hover:border-[var(--clr-accent)] hover:bg-[rgba(0,210,255,0.05)] transition-all duration-300">
                                <i className="fas fa-bolt text-[var(--clr-accent)] text-lg"></i> Problem Solver
                            </div>
                            <div className="badge flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(0,210,255,0.15)] text-sm font-bold hover:border-[var(--clr-accent)] hover:bg-[rgba(0,210,255,0.05)] transition-all duration-300">
                                <i className="fas fa-microchip text-[var(--clr-accent)] text-lg"></i> Infrastructure Expert
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .modern-terminal {
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid var(--clr-card-border);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modern-terminal:hover {
                    border-color: var(--clr-accent);
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 30px 60px rgba(0,210,255,0.15);
                }
                .terminal-body {
                    position: relative;
                }
                .terminal-body::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle at bottom right, rgba(0, 210, 255, 0.05), transparent 70%);
                    pointer-events: none;
                }
            ` }} />
        </section>
    );
};

export default About;
