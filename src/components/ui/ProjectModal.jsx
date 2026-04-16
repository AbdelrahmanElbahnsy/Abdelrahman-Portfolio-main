import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import TechTags from './TechTags';

const FALLBACK_IMAGE = '/portfolio-preview.png';

const ProjectModal = ({ project, onClose }) => {
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    if (!project) {
      setIsVisible(false);
      document.body.style.overflow = '';
      return undefined;
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEsc);
    setIsVisible(true);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, project]);

  useEffect(() => {
    if (!project) {
      setImageSrc(FALLBACK_IMAGE);
      return;
    }

    const nextImage = typeof project.image === 'string' && project.image.trim().length > 0
      ? project.image.trim()
      : FALLBACK_IMAGE;

    setImageSrc(nextImage);
  }, [project]);

  const technologies = useMemo(() => normalizeProjectTechnologies(project), [project]);

  const repoLink = useMemo(() => {
    if (typeof project?.repo === 'string' && project.repo.trim().length > 0) {
      return project.repo.trim();
    }

    if (typeof project?.github === 'string' && project.github.trim().length > 0) {
      return project.github.trim();
    }

    return '';
  }, [project]);

  const handleOutsideClick = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  const handleImageError = useCallback(() => {
    setImageSrc(FALLBACK_IMAGE);
  }, []);

  if (!project) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg sm:p-6"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="project-modal-title"
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-4xl overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#020617]/95 shadow-[0_30px_100px_-40px_rgba(6,182,212,0.45)] transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="relative h-64 overflow-hidden bg-slate-950 sm:h-[250px]">
          <img
            src={imageSrc}
            alt={project.title}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-[#020617]/60 to-transparent" />
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.45)]" />
            <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.35)]" />
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.35)]" />
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <h2 id="project-modal-title" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {project.title}
          </h2>

          <TechTags technologies={technologies} className="mt-4" />

          <div className="mt-8 rounded-[28px] border-l-2 border-cyan-400/70 bg-[#020617] p-6 shadow-inner shadow-cyan-500/10">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-cyan-300 opacity-90">
              $ cat description.txt
            </div>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
              {project.description || project.desc || 'No description available.'}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {repoLink ? (
              <a
                href={repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_-10px_rgba(6,182,212,0.65)] transition hover:shadow-[0_0_30px_0_rgba(6,182,212,0.85)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                Repository
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-transparent px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectModal);
