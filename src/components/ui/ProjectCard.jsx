import React, { memo, useCallback, useMemo } from 'react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import TechTags from './TechTags';

const FALLBACK_IMAGE = '/portfolio-preview.png';

const isValidImageSource = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.trim().length > 0;
};

const ProjectCard = ({ project, onClickDetails }) => {
  const imageSrc = isValidImageSource(project?.image) ? project.image.trim() : FALLBACK_IMAGE;
  const technologies = useMemo(() => normalizeProjectTechnologies(project), [project]);

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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#020617]/80 shadow-[0_20px_60px_-40px_rgba(6,182,212,0.45)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-[0_30px_80px_-35px_rgba(6,182,212,0.5)]">
      <div className="relative h-56 overflow-hidden bg-slate-950">
        <img
          src={imageSrc}
          alt={project?.title || 'Project preview'}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <h3 className="text-xl font-black tracking-tight text-white">
            {project?.title || 'Untitled Project'}
          </h3>

          <TechTags technologies={technologies} maxVisible={3} className="mt-4" />

          <p className="mt-5 line-clamp-4 text-sm leading-7 text-slate-300">
            {project?.description || project?.desc || 'No description available.'}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenDetails}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            View Details
          </button>

          {project?.repo ? (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
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
