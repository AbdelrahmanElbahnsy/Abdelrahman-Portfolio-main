import React, { memo, useCallback, useMemo, useRef } from 'react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import TechTags from './TechTags';
import { useTiltEffect } from '../../hooks/useTiltEffect';

const FALLBACK_IMAGE = '/portfolio-preview.png';

const isValidImageSource = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.trim().length > 0;
};

const ProjectCard = ({ project, onClickDetails }) => {
  const cardRef = useRef(null);
  const imageSrc = isValidImageSource(project?.image) ? project.image.trim() : FALLBACK_IMAGE;
  const technologies = useMemo(() => normalizeProjectTechnologies(project), [project]);

  // 3D tilt effect with spotlight glare
  useTiltEffect(cardRef, { maxTilt: 8, glare: true });

  const handleOpenDetails = useCallback(() => {
    if (project) {
      onClickDetails(project);
    }
  }, [onClickDetails, project]);

  const handleImageError = useCallback((event) => {
    if (event.currentTarget.src !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  }, []);

  return (
    <article
      ref={cardRef}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(200,162,110,0.15)] bg-[rgba(10,14,23,0.8)] shadow-[0_20px_60px_-40px_rgba(200,162,110,0.2)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(200,162,110,0.35)] hover:shadow-[0_30px_80px_-35px_rgba(200,162,110,0.25)]"
    >
      <div className="relative h-44 overflow-hidden bg-[#060a14]">
        <img
          src={imageSrc}
          alt={project?.title || 'Project preview'}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-[1.15rem] font-bold tracking-tight text-white leading-snug">
            {project?.title || 'Untitled Project'}
          </h3>

          <TechTags technologies={technologies} maxVisible={3} className="mt-2.5" />

          <p className="mt-4 line-clamp-4 text-[13px] leading-6 text-slate-300">
            {project?.description || project?.desc || 'No description available.'}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleOpenDetails}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[var(--clr-accent)] to-[var(--clr-accent-2)] px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-110"
          >
            View Details
          </button>

          {project?.repo ? (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-[var(--clr-accent)] hover:text-white"
            >
              Repository
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default memo(ProjectCard);
