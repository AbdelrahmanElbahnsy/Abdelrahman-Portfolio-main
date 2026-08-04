import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ProjectModal from '../ui/ProjectModal';
import ProjectCard from '../ui/ProjectCard';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';

gsap.registerPlugin(ScrollTrigger);

const getProjectRepo = (project) => {
  if (typeof project?.repo === 'string' && project.repo.trim().length > 0) return project.repo.trim();
  if (typeof project?.github === 'string' && project.github.trim().length > 0) return project.github.trim();
  return '';
};

const getProjectKey = (project, index) => project.id ?? getProjectRepo(project) ?? `project-${index}`;

const normalizeProject = (project, index) => ({
  ...project,
  id: getProjectKey(project, index),
  title: project.title || 'Untitled Project',
  description: project.description || project.desc || 'No description available.',
  image: typeof project.image === 'string' ? project.image.trim() : '/portfolio-preview.png',
  repo: getProjectRepo(project),
  technologies: normalizeProjectTechnologies(project),
});

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const { data: projectsData, loading, subscribe } = useFirestoreCrud('projects', { orderBy: { field: 'order', direction: 'asc' } });
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  const visibleProjects = useMemo(() => {
    if (loading) return [];
    return (projectsData || []).map(normalizeProject);
  }, [projectsData, loading]);

  const handleOpenProject = useCallback((project) => setSelectedProject(project), []);
  const handleCloseProject = useCallback(() => setSelectedProject(null), []);

  const activeProject = useMemo(() => {
    if (!selectedProject) return null;
    return visibleProjects.find((p) => p.id === selectedProject.id) ?? normalizeProject(selectedProject);
  }, [selectedProject, visibleProjects]);

  useGSAP(
    () => {
      const subtitleEl = headerRef.current?.querySelector('.section-subtitle');
      const titleEl = headerRef.current?.querySelector('.section-title');
      const swiperContainer = sectionRef.current?.querySelector('.projects-swiper-container');

      gsap.set([subtitleEl, titleEl].filter(Boolean), { opacity: 0, y: 30 });
      if (swiperContainer) gsap.set(swiperContainer, { opacity: 0, y: 50 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
      });

      tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.4 })
        .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.15');
        
      if (swiperContainer) {
        tl.to(swiperContainer, { opacity: 1, y: 0, duration: 0.8 }, '-=0.2');
      }
    },
    { scope: sectionRef }
  );

  return (
    <>
      <section
        id="projects"
        ref={sectionRef}
        className="relative bg-transparent text-white py-7 md:py-8 lg:py-10 overflow-hidden w-full"
      >
        {/* Header */}
        <div ref={headerRef} className="section-header text-center px-8 mb-16 flex-shrink-0 z-10 relative">
          <span className="section-subtitle mb-2 block font-mono text-sm font-bold uppercase tracking-widest text-[var(--clr-accent)]">
            [ Projects_Database ]
          </span>
          <h2 className="section-title text-4xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
            Featured Systems
          </h2>
        </div>

        {/* Standard Swiper Container */}
        <div className="container mx-auto px-4 md:px-8 w-full max-w-[1400px]">
          <div className="relative group/projects-slider projects-swiper-container pt-4 px-2 md:px-16">
            
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-80 bg-[#1e293b]/50 rounded-2xl border border-[#1e293b]"></div>
                 ))}
               </div>
            ) : visibleProjects.length > 0 ? (
              <>
            {/* Custom Navigation Arrows */}
            <button 
                className="projects-swiper-prev absolute left-0 md:-left-4 lg:-left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(200,162,110,0.4)] bg-[rgba(10,15,30,0.95)] text-[rgba(200,162,110,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(200,162,110,0.25)] hover:shadow-[0_0_20px_rgba(200,162,110,0.55)] focus:outline-none cursor-pointer hidden md:flex"
                aria-label="Previous project"
            >
                <i className="fas fa-chevron-left text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(200,162,110,0.4)]"></i>
            </button>
            <button 
                className="projects-swiper-next absolute right-0 md:-right-4 lg:-right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[rgba(200,162,110,0.4)] bg-[rgba(10,15,30,0.95)] text-[rgba(200,162,110,0.9)] hover:text-white flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--clr-accent)] shadow-[0_0_10px_rgba(200,162,110,0.25)] hover:shadow-[0_0_20px_rgba(200,162,110,0.55)] focus:outline-none cursor-pointer hidden md:flex"
                aria-label="Next project"
            >
                <i className="fas fa-chevron-right text-xl md:text-2xl drop-shadow-[0_0_3px_rgba(200,162,110,0.4)]"></i>
            </button>

            <Swiper
                modules={[Navigation, Pagination, Keyboard, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                keyboard={{ enabled: true }}
                pagination={{ clickable: true, el: '.projects-pagination' }}
                navigation={{
                    nextEl: '.projects-swiper-next',
                    prevEl: '.projects-swiper-prev',
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 40,
                    }
                }}
                className="projects-swiper overflow-hidden py-8 px-4 md:px-0"
            >
                {visibleProjects.map((project) => (
                    <SwiperSlide key={project.id} className="h-auto">
                        <ProjectCard project={project} onClickDetails={handleOpenProject} />
                    </SwiperSlide>
                ))}
            </Swiper>
            
            <div className="projects-pagination mt-8 flex justify-center"></div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-[#1e293b]/50 p-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">No projects found</h3>
                <p className="mt-2 text-gray-400">Check back soon for updates.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ProjectModal project={activeProject} onClose={handleCloseProject} />

      <style dangerouslySetInnerHTML={{ __html: `
          .projects-pagination .swiper-pagination-bullet {
              background: var(--clr-text-dim);
              opacity: 0.3;
              transition: all 0.3s ease;
          }
          .projects-pagination .swiper-pagination-bullet-active {
              background: var(--clr-accent);
              opacity: 1;
              width: 25px;
              border-radius: 5px;
          }
      ` }} />
    </>
  );
};

export default Projects;
