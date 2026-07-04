import React, { useCallback, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ProjectModal from '../ui/ProjectModal';
import ProjectCard from '../ui/ProjectCard';
import { projects as localProjects } from '../../data/portfolioData';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';

gsap.registerPlugin(ScrollTrigger);

const getProjectRepo = (project) => {
  if (typeof project?.repo === 'string' && project.repo.trim().length > 0) {
    return project.repo.trim();
  }
  if (typeof project?.github === 'string' && project.github.trim().length > 0) {
    return project.github.trim();
  }
  return '';
};

const getProjectKey = (project, index) =>
  project.id ?? getProjectRepo(project) ?? `${project.title ?? 'project'}-${index}`;

const normalizeProject = (project, index) => ({
  ...project,
  id: getProjectKey(project, index),
  title: project.title || 'Untitled Project',
  description: project.description || project.desc || 'No description available.',
  image: typeof project.image === 'string' ? project.image.trim() : '',
  repo: getProjectRepo(project),
  technologies: normalizeProjectTechnologies(project),
});

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const trackRef = useRef(null);

  const visibleProjects = useMemo(() => {
    return localProjects.map(normalizeProject);
  }, [localProjects]);

  const handleOpenProject = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const activeProject = useMemo(() => {
    if (!selectedProject) return null;
    return (
      visibleProjects.find((project) => project.id === selectedProject.id) ??
      normalizeProject(selectedProject)
    );
  }, [selectedProject, visibleProjects]);

  useGSAP(
    () => {
      // Header reveal
      const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
      const titleEl = headerRef.current?.querySelector('.section-title');
      gsap.set([subtitleEl, titleEl].filter(Boolean), { opacity: 0, y: 30 });

      const headerTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      });
      headerTl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 });
      headerTl.to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15');

      // Horizontal scroll setup
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const getPinDuration = () => Math.max(getScrollAmount() * 1.5, window.innerHeight);

      const cards = track.querySelectorAll('.project-card-wrapper');

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getPinDuration()}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const viewportWidth = window.innerWidth;
            cards.forEach((card) => {
              const rect = card.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const inView = centerX > 0 && centerX < viewportWidth;
              gsap.to(card, {
                opacity: inView ? 1 : 0.4,
                scale: inView ? 1 : 0.93,
                duration: 0.4,
                overwrite: 'auto',
              });
            });
          },
        },
      });

      // Refresh ScrollTrigger after all resources (images/fonts) are fully loaded
      const handleLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <>
      <section
        id="projects"
        ref={sectionRef}
        className="relative bg-transparent text-white min-h-screen flex flex-col justify-center py-12 overflow-hidden w-full"
      >
        {/* Header */}
        <div ref={headerRef} className="section-header text-center px-8 mb-8 flex-shrink-0">
          <span className="section-subtitle mb-2 block font-mono text-sm font-bold uppercase tracking-widest text-[var(--clr-accent)]">
            [ Projects_Database ]
          </span>
          <h2 className="section-title text-4xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
            Featured Systems
          </h2>
        </div>

        {/* Horizontal scrolling track */}
        <div className="flex-1 flex items-center w-full">
          <div
            ref={trackRef}
            className="flex items-stretch gap-8 px-8 w-max"
          >
              {visibleProjects.length === 0 ? (
                <div className="flex items-center justify-center w-screen">
                  <p className="font-mono text-sm uppercase tracking-widest text-[var(--clr-accent)]">
                    No projects available.
                  </p>
                </div>
              ) : (
                visibleProjects.map((project, index) => (
                  <div
                    key={getProjectKey(project, index)}
                    className="project-card-wrapper flex-shrink-0"
                    style={{ width: 'clamp(320px, 28vw, 420px)' }}
                  >
                    <ProjectCard
                      project={project}
                      onClickDetails={handleOpenProject}
                    />
                  </div>
                ))
              )}
              {/* Spacer to ensure the last card can scroll fully into the center/left */}
              <div className="w-[10vw] flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
      </section>

      <ProjectModal project={activeProject} onClose={handleCloseProject} />
    </>
  );
};

export default Projects;
