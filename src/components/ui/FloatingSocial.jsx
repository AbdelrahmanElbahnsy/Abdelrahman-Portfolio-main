import React from 'react';

const socialLinks = {
    floating: [
        { icon: 'fab fa-github', link: 'https://github.com/AbdelrahmanElbahnsy', label: 'GitHub' },
        { icon: 'fab fa-linkedin-in', link: 'https://www.linkedin.com/in/abdelrahmanelbahnsy/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BfPxex%2FALS7qj1yrt9OK5kw%3D%3D', label: 'LinkedIn' },
        { icon: 'fas fa-envelope', link: 'mailto:abdelrahmanelbahnsy3@gmail.com', label: 'Email' }
    ]
};

const FloatingSocial = () => {
  return (
    <div className="fixed left-6 bottom-0 z-40 hidden xl:flex flex-col items-center gap-6 animate-fadeIn">
      <div className="flex flex-col gap-6 mb-4">
        {socialLinks.floating.map((social, idx) => (
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
