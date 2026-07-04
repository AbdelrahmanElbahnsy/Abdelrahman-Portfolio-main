import React, { useCallback, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ProjectModal from '../ui/ProjectModal';
import ProjectCard from '../ui/ProjectCard';
import { projects as localProjects } from '../../data/portfolioData';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';

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
  const gridRef = useRef(null);

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

  // GSAP animations
  useGSAP(
    () => {
      const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
      const titleEl = headerRef.current?.querySelector('.section-title');
      const cards = gridRef.current?.querySelectorAll('.project-card-wrapper');

      gsap.set([subtitleEl, titleEl].filter(Boolean), { opacity: 0, y: 30 });
      if (cards?.length) gsap.set(cards, { opacity: 0, y: 35 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      });

      tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
        .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15')

      if (cards?.length) {
        tl.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.1');
      }
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section id="projects" className="section relative bg-[#020617] py-20 text-white" ref={sectionRef}>
      <div className="container relative z-10 mx-auto px-8">
        <div ref={headerRef} className="section-header mb-16 text-center">
          <span className="section-subtitle mb-2 block font-mono text-sm font-bold uppercase tracking-widest text-cyan-400">
            [ Projects_Database ]
          </span>
          <h2 className="section-title mb-4 text-4xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
            Featured Systems
          </h2>
        </div>

        <div ref={gridRef} className="projects-grid grid grid-cols-1 gap-y-8 gap-x-10 lg:gap-x-12 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-70">
              <p className="font-mono text-sm uppercase tracking-widest text-cyan-400">
                No projects available.
              </p>
            </div>
          ) : (
            visibleProjects.map((project, index) => (
              <div key={getProjectKey(project, index)} className="project-card-wrapper">
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
