import React, { useEffect, useState } from 'react';

const CircularSkill = ({ icon, percent, title, subtitle, isVisible, delay }) => {
  const [offset, setOffset] = useState(339.292);
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // 339.292

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        const progressOffset = circumference - (percent / 100) * circumference;
        setOffset(progressOffset);
      }, delay || 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible, percent, circumference, delay]);

  return (
    <div className={`circular-skill-item group flex flex-col items-center text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="relative w-[120px] h-[120px] mb-4 flex items-center justify-center">
        <svg className="rotate-[-90deg] w-full h-full">
          {/* Background Ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Progress Ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="var(--theme-accent)"
            strokeWidth="8"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl text-primary group-hover:scale-110 transition-transform duration-300">
          <i className={icon}></i>
        </div>
      </div>
      <div className="skill-info-circular">
        <h4 className="text-white font-bold text-lg mb-1">{title}</h4>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  );
};

export default CircularSkill;