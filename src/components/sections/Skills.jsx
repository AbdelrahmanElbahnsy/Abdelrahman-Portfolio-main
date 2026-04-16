import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Skills = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.circular-skill-item');
                    items.forEach((item, idx) => {
                        setTimeout(() => {
                            item.classList.add('reveal');
                            const circle = item.querySelector('.progress-ring-circle');
                            const percent = parseFloat(item.dataset.percent || '0');
                            const radius = circle.r.baseVal.value;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (percent / 100) * circumference;
                            circle.style.strokeDashoffset = offset;
                        }, idx * 180);
                    });
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        if (sectionRef.current) {
            skillsObserver.observe(sectionRef.current);
        }

        return () => skillsObserver.disconnect();
    }, []);

    const circularSkills = [
        { label: 'Cloud', sub: 'AWS Expert', percent: 90, icon: 'fab fa-aws' },
        { label: 'Containers', sub: 'Docker + K8s', percent: 88, icon: 'fab fa-docker' },
        { label: 'CI/CD', sub: 'Pipelines', percent: 92, icon: 'fas fa-infinity' },
        { label: 'IaC', sub: 'Terraform', percent: 85, icon: 'fas fa-code-branch' },
        { label: 'Networking', sub: 'CCNA / CCNP', percent: 80, icon: 'fas fa-network-wired' },
    ];

    const skillCards = [
        {
            title: 'Cloud Platform',
            count: '4 Tools',
            icon: 'fab fa-aws',
            metrics: [
                { label: 'EC2 & VPC', percent: 90 },
                { label: 'IAM & Security', percent: 85 },
                { label: 'S3 Storage', percent: 88 },
                { label: 'Load Balancer', percent: 82 },
            ]
        },
        {
            title: 'DevOps & CI/CD',
            count: '4 Tools',
            icon: 'fas fa-infinity',
            metrics: [
                { label: 'Jenkins', percent: 88 },
                { label: 'GitHub Actions', percent: 85 },
                { label: 'CI/CD Pipelines', percent: 90 },
                { label: 'Automation', percent: 87 },
            ]
        },
        {
            title: 'Containers & Orchestration',
            count: '4 Tools',
            icon: 'fab fa-docker',
            metrics: [
                { label: 'Docker', percent: 92 },
                { label: 'Docker Compose', percent: 88 },
                { label: 'Kubernetes', percent: 85 },
                { label: 'Container Security', percent: 80 },
            ]
        },
        {
            title: 'Infrastructure as Code',
            count: '3 Tools',
            icon: 'fas fa-code-branch',
            metrics: [
                { label: 'Terraform', percent: 87 },
                { label: 'Infrastructure Automation', percent: 85 },
                { label: 'Provisioning', percent: 83 },
            ]
        },
        {
            title: 'Networking',
            count: '4 Tools',
            icon: 'fas fa-network-wired',
            metrics: [
                { label: 'Routing & Switching', percent: 92 },
                { label: 'TCP/IP', percent: 90 },
                { label: 'Network Security', percent: 85 },
                { label: 'Load Balancing', percent: 84 },
            ]
        },
        {
            title: 'Programming & Scripting',
            count: '3 Tools',
            icon: 'fas fa-terminal',
            metrics: [
                { label: 'Python', percent: 85 },
                { label: 'Bash', percent: 82 },
                { label: 'Shell Scripting', percent: 80 },
            ]
        },
        {
            title: 'Operating Systems',
            count: '4 Tools',
            icon: 'fab fa-linux',
            metrics: [
                { label: 'Linux Administration', percent: 92 },
                { label: 'Windows Server', percent: 85 },
                { label: 'System Hardening', percent: 83 },
                { label: 'Process Management', percent: 86 },
            ]
        },
        {
            title: 'Monitoring & Observability',
            count: '4 Tools',
            icon: 'fas fa-chart-line',
            metrics: [
                { label: 'Prometheus', percent: 88 },
                { label: 'Grafana', percent: 87 },
                { label: 'Logging (ELK / Loki)', percent: 85 },
                { label: 'Metrics & Alerting', percent: 86 },
            ]
        }
    ];

    return (
        <section id="skills" className="section" ref={sectionRef}>
            <div className="container mx-auto px-8">
                <div className="section-header animate-up text-center mb-16">
                    <span className="section-subtitle text-[var(--clr-accent)] font-mono uppercase tracking-widest text-sm mb-2 block">Expertise</span>
                    <h2 className="section-title text-4xl md:text-5xl font-black mb-4">Skills & Technologies</h2>
                    <p className="section-desc text-[var(--clr-text-dim)] max-w-2xl mx-auto">A comprehensive toolkit for building and managing modern cloud infrastructure.</p>
                </div>

                <div className="skills-circular-row flex flex-wrap justify-center gap-12 mb-20">
                    {circularSkills.map((skill, idx) => (
                        <div key={idx} className="circular-skill-item group" data-percent={skill.percent}>
                            <div className="circle-box relative w-[120px] h-[120px] flex items-center justify-center">
                                <svg className="progress-ring rotate-[-90deg]" width="120" height="120">
                                    <circle className="progress-ring-bg" cx="60" cy="60" r="54" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle className="progress-ring-circle transition-all duration-1000 ease-out" cx="60" cy="60" r="54" fill="transparent" stroke="var(--clr-accent)" strokeWidth="8" strokeDasharray="339.292" strokeDashoffset="339.292" />
                                </svg>
                                <div className="skill-icon absolute text-3xl text-[var(--clr-accent)] transition-transform duration-300 group-hover:scale-125">
                                    <i className={skill.icon}></i>
                                </div>
                            </div>
                            <div className="skill-info-circular text-center mt-4">
                                <h4 className="text-lg font-bold">{skill.label}</h4>
                                <p className="text-xs text-[var(--clr-text-dim)]">{skill.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="skills-swiper-container pb-12 pt-4">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={true}
                        pagination={{ clickable: true, el: '.skills-pagination' }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        breakpoints={{
                            768: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 40 }
                        }}
                        className="skills-swiper !overflow-visible"
                    >
                        {skillCards.map((card, idx) => (
                            <SwiperSlide key={idx} className="!h-auto">
                                <div className="skill-card card h-full border border-[var(--clr-card-border)] bg-[var(--clr-card-bg)] backdrop-blur-md p-8 rounded-xl hover:border-[var(--clr-accent)] transition-all duration-300">
                                    <div className="skill-card-header flex items-center gap-4 mb-6">
                                        <div className="skill-card-icon w-12 h-12 flex items-center justify-center bg-[rgba(0,210,255,0.1)] rounded-lg text-2xl text-[var(--clr-accent)]">
                                            <i className={card.icon}></i>
                                        </div>
                                        <div>
                                            <h3 className="skill-card-title text-xl font-bold">{card.title}</h3>
                                            <p className="skill-card-subtitle text-xs text-[var(--clr-text-dim)] uppercase tracking-wider">{card.count}</p>
                                        </div>
                                    </div>
                                    <div className="skill-card-body space-y-4">
                                        {card.metrics.map((m, midx) => (
                                            <div key={midx} className="skill-item">
                                                <div className="skill-metric flex justify-between text-sm mb-1">
                                                    <span className="skill-metric-label text-[var(--clr-text-dim)]">{m.label}</span>
                                                    <span className="skill-metric-percent font-bold">{m.percent}%</span>
                                                </div>
                                                <div className="skill-progress h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                                    <div 
                                                        className="skill-progress-bar h-full bg-[var(--clr-accent)] transition-all duration-1000 ease-in-out" 
                                                        style={{ width: '0%', '--target-width': `${m.percent}%` }}
                                                        ref={(el) => {
                                                            if (el) {
                                                                const observer = new IntersectionObserver((entries) => {
                                                                    if (entries[0].isIntersecting) {
                                                                        el.style.width = el.style.getPropertyValue('--target-width');
                                                                        observer.disconnect();
                                                                    }
                                                                });
                                                                observer.observe(el);
                                                            }
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="skills-pagination mt-8 flex justify-center"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .circular-skill-item .circle-box {
                    transition: transform 0.3s ease;
                }
                .circular-skill-item:hover .circle-box {
                    transform: scale(1.05);
                }
                .skills-pagination .swiper-pagination-bullet {
                    background: var(--clr-text-dim);
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }
                .skills-pagination .swiper-pagination-bullet-active {
                    background: var(--clr-accent);
                    opacity: 1;
                    width: 25px;
                    border-radius: 5px;
                }
            ` }} />
        </section>
    );
};

export default Skills;
