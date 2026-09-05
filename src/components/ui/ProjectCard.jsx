import React, { memo, useCallback, useMemo, useRef } from 'react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import TechTags from './TechTags';
import { useTiltEffect } from '../../hooks/useTiltEffect';
import { useLanguage } from '../../i18n/LanguageContext';

const FALLBACK_IMAGE = '/portfolio-preview.png';

const isValidImageSource = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.trim().length > 0;
};

const ProjectCard = ({ project, onClickDetails }) => {
  const { t, language } = useLanguage();
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] shadow-[var(--theme-shadow)] transition duration-300 hover:-translate-y-1 hover:border-[var(--theme-accent)] hover:shadow-[var(--theme-shadow-strong)]"
    >
      <div className="relative h-44 overflow-hidden bg-[var(--theme-bg)]">
        <img
          src={imageSrc}
          alt={project?.title || 'Project preview'}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          width="600"
          height="400"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-[var(--theme-bg)]/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-[1.15rem] font-bold tracking-tight text-[var(--theme-text)] leading-snug" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' ? (project?.titleAr || t(project?.title)) : (project?.title || 'Untitled Project')}
          </h3>

          <TechTags technologies={technologies} maxVisible={3} className="mt-2.5" />

          <p className="mt-4 line-clamp-4 text-[13px] leading-6 text-[var(--theme-text-secondary)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar'
              ? (project?.descriptionAr || project?.descAr || project?.description || project?.desc || 'لا يوجد وصف.')
              : (project?.description || project?.desc || 'No description available.')}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleOpenDetails}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--theme-accent)] px-3.5 py-2 text-xs font-semibold text-[var(--theme-btn-text)] transition hover:brightness-110"
          >
            {t('View Details')}
          </button>

          {project?.repo ? (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--theme-border-strong)] px-3.5 py-2 text-xs font-semibold text-[var(--theme-text-secondary)] transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-text)]"
            >
              {t('Repository')}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default memo(ProjectCard);
