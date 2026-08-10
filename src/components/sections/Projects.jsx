import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { projects as localProjects } from '../../data/portfolioData';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const { t, language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState(null);
  const { data: projectsData, loading, subscribe } = useFirestoreCrud('projects', { orderBy: { field: 'order', direction: 'asc' } });
  
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  React.useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  const visibleProjects = useMemo(() => {
    const dataToUse = (projectsData && projectsData.length > 0) ? projectsData : localProjects;
    return dataToUse.map(normalizeProject);
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
        className="relative bg-transparent text-[var(--theme-text)] py-7 md:py-8 lg:py-10 overflow-hidden w-full"
      >
        {/* Header */}
        <div ref={headerRef} className="section-header text-center px-8 mb-16 flex-shrink-0 z-10 relative">
          <span className="section-subtitle mb-2 block font-mono text-sm font-bold uppercase tracking-widest text-[var(--theme-accent)]">
            [ {t('Projects Architecture')} ]
          </span>
          <h2 className="section-title text-4xl font-black tracking-tight text-[var(--theme-text)] drop-shadow-md md:text-5xl">
            {t('Featured Systems')}
          </h2>
        </div>

        {/* Standard Swiper Container */}
        <div className="container mx-auto px-4 md:px-8 w-full max-w-[1400px]">
          <div className="relative group/projects-slider projects-swiper-container pt-4 px-2 md:px-16">
            
            {/* Custom Navigation Arrows */}
            <button 
                className="projects-swiper-prev absolute left-0 md:-left-4 lg:-left-8 rtl:left-auto rtl:right-0 rtl:md:-right-4 rtl:lg:-right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[var(--theme-border-gold)] bg-[var(--theme-surface-elevated)] text-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:bg-[var(--theme-accent)] flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent-soft)] hover:shadow-[0_0_20px_var(--theme-accent-soft)] focus:outline-none cursor-pointer hidden md:flex"
                aria-label="Previous project"
            >
                <i className="fas fa-chevron-left text-xl md:text-2xl drop-shadow-[0_0_3px_var(--theme-accent-soft)] rtl:rotate-180"></i>
            </button>
            <button 
                className="projects-swiper-next absolute right-0 md:-right-4 lg:-right-8 rtl:right-auto rtl:left-0 rtl:md:-left-4 rtl:lg:-left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full border-[1.5px] border-[var(--theme-border-gold)] bg-[var(--theme-surface-elevated)] text-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:bg-[var(--theme-accent)] flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-110 hover:border-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent-soft)] hover:shadow-[0_0_20px_var(--theme-accent-soft)] focus:outline-none cursor-pointer hidden md:flex"
                aria-label="Next project"
            >
                <i className="fas fa-chevron-right text-xl md:text-2xl drop-shadow-[0_0_3px_var(--theme-accent-soft)] rtl:rotate-180"></i>
            </button>

            <Swiper
                dir="ltr"
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
          </div>
        </div>
      </section>

      <ProjectModal project={activeProject} onClose={handleCloseProject} />

      <style dangerouslySetInnerHTML={{ __html: `
          .projects-pagination .swiper-pagination-bullet {
              background: var(--theme-text-muted);
              opacity: 0.3;
              transition: all 0.3s ease;
          }
          .projects-pagination .swiper-pagination-bullet-active {
              background: var(--theme-accent);
              opacity: 1;
              width: 25px;
              border-radius: 5px;
          }
      ` }} />
    </>
  );
};

export default Projects;
