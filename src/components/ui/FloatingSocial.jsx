import React from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useEffect } from 'react';

const FloatingSocial = () => {
  const { data: socialsData, loading, error, subscribe } = useFirestoreCrud('socials', { orderByField: 'order', orderDirection: 'asc' });

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  if (loading || error || !socialsData || socialsData.length === 0) {
      return null;
  }

  return (
    <div className="fixed left-6 bottom-0 z-40 hidden xl:flex flex-col items-center gap-6 animate-fadeIn">
      <div className="flex flex-col gap-6 mb-4">
        {socialsData.map((social, idx) => (
          <a
            key={idx}
            href={social.url || social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-10 h-10 rounded-full bg-[#161b22] border border-white/5 flex items-center justify-center text-gray-500 hover:text-[var(--theme-accent)] hover:border-[var(--theme-accent)] transition-all duration-300 hover:-translate-y-1 shadow-lg"
            title={social.platform || social.label}
          >
            <i className={`${social.icon} text-lg`}></i>
            <span className="absolute left-14 px-3 py-1 rounded bg-[var(--theme-accent)] text-black text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {social.platform || social.label}
            </span>
          </a>
        ))}
      </div>
      <div className="w-px h-32 bg-gradient-to-t from-[var(--theme-accent)] to-transparent opacity-50"></div>
    </div>
  );
};

export default FloatingSocial;
