import React, { useCallback, useMemo, useState } from 'react';
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

  return (
    <section id="projects" className="section relative bg-[#020617] py-20 text-white">
      <div className="container relative z-10 mx-auto px-8">
        <div className="section-header animate-up mb-16 text-center">
          <span className="section-subtitle mb-2 block font-mono text-sm font-bold uppercase tracking-widest text-cyan-400">
            [ Projects_Database ]
          </span>
          <h2 className="section-title mb-4 text-4xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
            Featured Systems
          </h2>
        </div>

        <div className="projects-grid grid grid-cols-1 gap-y-8 gap-x-10 lg:gap-x-12 animate-up md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-70">
              <p className="font-mono text-sm uppercase tracking-widest text-cyan-400">
                No projects available.
              </p>
            </div>
          ) : (
            visibleProjects.map((project, index) => (
              <ProjectCard
                key={getProjectKey(project, index)}
                project={project}
                onClickDetails={handleOpenProject}
              />
            ))
          )}
        </div>
      </div>

      <ProjectModal project={activeProject} onClose={handleCloseProject} />
    </section>
  );
};

export default Projects;
