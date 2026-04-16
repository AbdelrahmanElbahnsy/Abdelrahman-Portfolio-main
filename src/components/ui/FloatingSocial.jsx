import React from 'react';

const FloatingSocial = () => {
  return (
    <div className="fixed left-6 bottom-0 z-40 hidden xl:flex flex-col items-center gap-6 animate-fadeIn">
      <div className="flex flex-col gap-6 mb-4">
        {[
          { icon: 'fab fa-linkedin-in', link: 'https://www.linkedin.com/in/ahmed-hamed-340570364', label: 'LinkedIn' },
          { icon: 'fab fa-github', link: 'https://github.com/ahmed1707hamed-tech', label: 'GitHub' },
          { icon: 'fab fa-whatsapp', link: 'https://wa.me/201062425594', label: 'WhatsApp' },
          { icon: 'fab fa-twitter', link: 'https://x.com/AhmedHa23091122', label: 'Twitter' }
        ].map((social, idx) => (
          <a
            key={idx}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-10 h-10 rounded-full bg-[#161b22] border border-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all duration-300 hover:-translate-y-1 shadow-lg"
            title={social.label}
          >
            <i className={`${social.icon} text-lg`}></i>
            <span className="absolute left-14 px-3 py-1 rounded bg-primary text-black text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {social.label}
            </span>
          </a>
        ))}
      </div>
      <div className="w-px h-32 bg-gradient-to-t from-primary to-transparent opacity-50"></div>
    </div>
  );
};

export default FloatingSocial;
