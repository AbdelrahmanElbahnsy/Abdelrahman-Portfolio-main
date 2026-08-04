import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import AddProject from './AddProject';
import toast from 'react-hot-toast';
import { Trash2, ExternalLink, Pencil, Plus, Briefcase, Eye, EyeOff } from 'lucide-react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import TechTags from '../ui/TechTags';

import EnterpriseDataTable from './UI/Enterprise/Table/EnterpriseDataTable';
import { EnterpriseToolbar, EnterpriseSearch, EnterpriseFilters } from './UI/Enterprise/Table/EnterpriseToolbar';
import EnterpriseDrawer from './UI/Enterprise/Modals/EnterpriseDrawer';
import EnterpriseStatusBadge from './UI/Enterprise/Feedback/EnterpriseStatusBadge';

const ProjectsManager = () => {
  const { data: projects, loading, fetchAll, create, update, remove } = useFirestoreCrud('projects', {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProjects = useMemo(() => {
    let filtered = projects || [];
    
    // 1. Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.technologies?.some(t => typeof t === 'string' ? t.toLowerCase().includes(q) : t.name?.toLowerCase().includes(q))
      );
    }

    // 2. Status filtering (Live vs Draft etc based on links, since project schema lacks 'status' explicitly right now, we infer it)
    if (filterStatus === 'published') {
      filtered = filtered.filter(p => p.liveLink || p.githubLink || p.live || p.github);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(p => !p.liveLink && !p.githubLink && !p.live && !p.github);
    }

    return filtered;
  }, [projects, searchQuery, filterStatus]);

  const openDrawerForNew = useCallback(() => {
    setSelectedProject(null);
    setIsDrawerOpen(true);
  }, []);

  const openDrawerForEdit = useCallback((project) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedProject(null), 300); // clear after animation
  }, []);

  const handleSaveProject = useCallback(async (projectData) => {
    try {
      if (selectedProject?.id) {
        await update(selectedProject.id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await create(projectData);
        toast.success('Project published successfully!');
      }

      await fetchAll();
      closeDrawer();
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error('Could not save project to database.');
      throw err;
    }
  }, [fetchAll, selectedProject, update, create, closeDrawer]);

  const handleDelete = useCallback(async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this project?')) {
      try {
        await remove(id);
        await fetchAll();
        if (selectedProject?.id === id) {
          closeDrawer();
        }
        toast.success('Project deleted');
      } catch (err) {
        toast.error(`Deletion failed: ${err.message}`);
      }
    }
  }, [fetchAll, closeDrawer, selectedProject, remove]);

  const columns = useMemo(() => [
    {
      header: 'Project Details',
      accessorKey: 'title',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
            {row.image ? <img src={row.image} alt="" className="w-full h-full object-cover"/> : <Briefcase className="w-5 h-5 text-gray-600"/>}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{row.title}</p>
            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: false,
      cell: (row) => {
        const hasLink = row.liveLink || row.githubLink || row.live || row.github;
        return hasLink 
          ? <EnterpriseStatusBadge status="Published" type="success" />
          : <EnterpriseStatusBadge status="Draft" type="warning" />;
      }
    },
    {
      header: 'Tech Stack',
      accessorKey: 'technologies',
      sortable: false,
      cell: (row) => (
        <div className="max-w-[250px] overflow-hidden whitespace-normal">
           <TechTags technologies={normalizeProjectTechnologies(row).slice(0, 3)} className="scale-75 origin-left" />
           {normalizeProjectTechnologies(row).length > 3 && <span className="text-[10px] text-gray-500 ml-1">+{normalizeProjectTechnologies(row).length - 3}</span>}
        </div>
      )
    },
    {
      header: 'Links',
      accessorKey: 'links',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {(row.liveLink || row.live) && <a href={row.liveLink || row.live} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5"/></a>}
          {(row.githubLink || row.github) && <a href={row.githubLink || row.github} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg></a>}
        </div>
      )
    },
    {
      header: 'Updated',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-gray-500 font-mono">
          {row.createdAt?.toDate ? new Date(row.createdAt.toDate()).toLocaleDateString() : 'Just now'}
        </span>
      )
    },
    {
      header: '',
      accessorKey: 'actions',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openDrawerForEdit(row)} className="p-2 text-gray-400 hover:text-white bg-transparent hover:bg-white/5 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleDelete(row.id, e)} className="p-2 text-gray-400 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [openDrawerForEdit, handleDelete]);

  const gridRenderItem = (project) => (
    <div key={project.id} className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden group hover:border-cms-primary/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(20,241,149,0.05)] flex flex-col justify-between">
      <div>
        <div className="h-48 bg-black/40 relative border-b border-white/5 overflow-hidden">
          {project.image ? (
            <img src={project.image} alt={project.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
              <EyeOff className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
             {project.liveLink || project.live || project.githubLink || project.github 
               ? <EnterpriseStatusBadge status="Live" type="success" className="shadow-lg backdrop-blur-md bg-black/50" />
               : <EnterpriseStatusBadge status="Draft" type="warning" className="shadow-lg backdrop-blur-md bg-black/50" />
             }
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{project.title}</h3>
          <TechTags technologies={normalizeProjectTechnologies(project)} className="mb-4 scale-90 origin-left" />
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
        </div>
      </div>
      <div className="p-5 pt-0 mt-auto">
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            {(project.liveLink || project.live) && <a href={project.liveLink || project.live} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"><ExternalLink className="w-4 h-4"/></a>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => openDrawerForEdit(project)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"><Pencil className="w-4 h-4"/></button>
            <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"><Trash2 className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Projects Library</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your portfolio projects, source code, and live demos.</p>
        </div>
        <button 
          onClick={openDrawerForNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-cms-primary text-black font-bold rounded-lg hover:bg-[#12d684] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      {/* Enterprise Toolbar */}
      <EnterpriseToolbar 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={<EnterpriseSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search projects by title, description, or tech..." />}
        filters={
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-1">
            {['all', 'published', 'draft'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors capitalize ${filterStatus === status ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                {status}
              </button>
            ))}
          </div>
        }
      />

      {/* Enterprise Data Table / Grid */}
      <EnterpriseDataTable 
        data={filteredProjects}
        columns={columns}
        isLoading={loading}
        viewMode={viewMode}
        gridRenderItem={gridRenderItem}
        emptyStateTitle="No projects found"
        emptyStateDescription={searchQuery ? "No projects match your search criteria." : "You haven't added any projects to your portfolio yet."}
        emptyActionLabel="Create First Project"
        onEmptyAction={openDrawerForNew}
      />

      {/* Editor Drawer */}
      <EnterpriseDrawer 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer} 
        title={selectedProject ? 'Edit Project' : 'Create New Project'}
      >
        <AddProject
          key={selectedProject?.id ?? 'new-project'}
          onProjectSave={handleSaveProject}
          projectToEdit={selectedProject}
          isEditing={!!selectedProject}
          onCancelEdit={closeDrawer}
        />
      </EnterpriseDrawer>
      
    </div>
  );
};

export default ProjectsManager;
