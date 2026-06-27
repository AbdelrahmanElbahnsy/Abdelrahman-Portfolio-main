import React from 'react';
import { toolchain } from '../../data/portfolioData';

const Toolchain = () => {
    const { row1, row2 } = toolchain;

    return (
        <section id="toolchain" className="section   relative overflow-hidden bg-[rgba(10,10,10,0.3)]">
            <div className="container mx-auto px-8 mb-12">
                <div className="section-header animate-up text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[rgba(0,210,255,0.05)] border border-[rgba(0,210,255,0.1)]">
                        <i className="fas fa-briefcase text-[var(--clr-accent)]"></i>
                        <span className="text-sm font-bold tracking-wider uppercase text-[var(--clr-accent)]">DevOps Toolchain</span>
                    </div>
                </div>
            </div>

            <div className="toolchain-wrapper flex flex-col gap-8">
                <div className="scroll-container overflow-hidden whitespace-nowrap mask-edges py-2">
                    <div className="scroll-content animate-scroll-left flex gap-6 w-max">
                        {[...row1, ...row1, ...row1].map((tool, idx) => (
                            <div key={`r1-${idx}`} className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] backdrop-blur-sm hover:border-[var(--clr-accent)] hover:bg-[rgba(0,210,255,0.05)] transition-all duration-300 group">
                                <i className={`${tool.icon} text-xl text-[var(--clr-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="scroll-container overflow-hidden whitespace-nowrap mask-edges py-2">
                    <div className="scroll-content animate-scroll-right flex gap-6 w-max">
                        {[...row2, ...row2, ...row2].map((tool, idx) => (
                            <div key={`r2-${idx}`} className="tool-card flex items-center gap-3 px-6 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] backdrop-blur-sm hover:border-[var(--clr-accent)] hover:bg-[rgba(0,210,255,0.05)] transition-all duration-300 group">
                                <i className={`${tool.icon} text-xl text-[var(--clr-accent)] group-hover:scale-110 transition-transform`}></i>
                                <span className="text-sm font-medium tracking-tight whitespace-nowrap">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .mask-edges {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
                .animate-scroll-left {
                    animation: scroll-left 40s linear infinite;
                }
                .animate-scroll-right {
                    animation: scroll-right 40s linear infinite;
                }
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @keyframes scroll-right {
                    0% { transform: translateX(-33.33%); }
                    100% { transform: translateX(0); }
                }
                .tool-card {
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .tool-card:hover {
                    box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);
                    transform: translateY(-5px);
                }
                .light-theme .tool-card {
                    background: rgba(255, 255, 255, 0.8);
                    border-color: rgba(0,0,0,0.05);
                    color: #333;
                }
                .light-theme .bg-[rgba(10,10,10,0.3)] {
                    background: rgba(0,0,0,0.02);
                }
            ` }} />
        </section>
    );
};

export default Toolchain;
