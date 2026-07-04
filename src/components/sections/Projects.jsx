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
  const pinRef = useRef(null);

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
    if (!selectedProject) {
      return null;
    }

    return (
      visibleProjects.find((project) => project.id === selectedProject.id) ??
      normalizeProject(selectedProject)
    );
  }, [selectedProject, visibleProjects]);

  // GSAP: Header reveal + horizontal scroll
  useGSAP(
    () => {
      const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
      const titleEl = headerRef.current?.querySelector('.section-title');
      const cards = trackRef.current?.querySelectorAll('.project-card-wrapper');

      // Header reveal
      gsap.set([subtitleEl, titleEl].filter(Boolean), { opacity: 0, y: 30 });

      const headerTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      });

      headerTl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 });
      headerTl.to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15');

      // Horizontal scroll pinning
      if (trackRef.current && cards?.length > 1) {
        const trackWidth = trackRef.current.scrollWidth;
        const viewWidth = pinRef.current?.offsetWidth || window.innerWidth;
        const scrollDistance = trackWidth - viewWidth;

        if (scrollDistance > 0) {
          // Cards fade in as they enter
          gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 });

          gsap.to(trackRef.current, {
            x: -scrollDistance,
            ease: 'none',
            scrollTrigger: {
              trigger: pinRef.current,
              start: 'top 15%',
              end: () => `+=${scrollDistance * 1.2}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              onUpdate: (self) => {
                // Reveal cards as they enter the viewport
                cards.forEach((card) => {
                  const rect = card.getBoundingClientRect();
                  if (rect.left < viewWidth * 0.85 && rect.right > 0) {
                    gsap.to(card, {
                      opacity: 1, y: 0, scale: 1,
                      duration: 0.5,
                      ease: 'power2.out',
                      overwrite: 'auto',
                    });
                  }
                });
              },
            },
          });
        } else {
          // Fallback: standard vertical grid if not enough cards
          if (cards?.length) {
            gsap.set(cards, { opacity: 0, y: 35 });
            headerTl.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.1');
          }
        }
      } else if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 35 });
        headerTl.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.1');
      }
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section id="projects" className="section relative bg-transparent py-20 text-white" ref={sectionRef}>
      <div className="container relative z-10 mx-auto px-8">
        <div ref={headerRef} className="section-header mb-16 text-center">
          <span className="section-subtitle mb-2 block font-mono text-sm font-bold uppercase tracking-widest text-[var(--clr-accent)]">
            [ Projects_Database ]
          </span>
          <h2 className="section-title mb-4 text-4xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
            Featured Systems
          </h2>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div ref={pinRef} className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-8 px-8"
          style={{
            width: 'max-content',
            paddingRight: '5vw',
          }}
        >
          {visibleProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-70 w-full">
              <p className="font-mono text-sm uppercase tracking-widest text-[var(--clr-accent)]">
                No projects available.
              </p>
            </div>
          ) : (
            visibleProjects.map((project, index) => (
              <div
                key={getProjectKey(project, index)}
                className="project-card-wrapper flex-shrink-0"
                style={{ width: 'clamp(300px, 30vw, 400px)' }}
              >
                <ProjectCard
                  project={project}
                  onClickDetails={handleOpenProject}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <ProjectModal project={activeProject} onClose={handleCloseProject} />
    </section>
  );
};

export default Projects;
