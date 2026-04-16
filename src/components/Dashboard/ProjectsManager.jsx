import React, { useState, useEffect, useCallback, memo } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AddProject from './AddProject';
import toast from 'react-hot-toast';
import { Loader2, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';
import TechTags from '../ui/TechTags';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      const projectsData = snapshot.docs
        .map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }))
        .sort((a, b) => {
          const aSeconds = a?.createdAt?.seconds ?? 0;
          const bSeconds = b?.createdAt?.seconds ?? 0;
          return bSeconds - aSeconds;
        });

      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const resetEditingState = useCallback(() => {
    setSelectedProject(null);
    setIsEditing(false);
  }, []);

  const handleSaveProject = useCallback(async (projectData) => {
    try {
      if (isEditing && selectedProject?.id) {
        await updateDoc(doc(db, 'projects', selectedProject.id), {
          ...projectData,
          updatedAt: serverTimestamp(),
        });
        toast.success('Project updated successfully!');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp(),
        });
        toast.success('Project published successfully!');
      }

      await fetchProjects();
      resetEditingState();
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error('Could not save project to database.');
      throw err;
    }
  }, [fetchProjects, isEditing, resetEditingState, selectedProject]);

  const handleEditProject = useCallback((project) => {
    setSelectedProject(project);
    setIsEditing(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        await fetchProjects();
        if (selectedProject?.id === id) {
          resetEditingState();
        }
        toast.success('Project deleted');
      } catch (err) {
        toast.error(`Deletion failed: ${err.message}`);
      }
    }
  }, [fetchProjects, resetEditingState, selectedProject]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner / Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Projects</h2>
        <span className="bg-[#1e293b] text-gray-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-[#1e293b]/50">
           {projects.length} Total
        </span>
      </div>

      {/* Embedded AddProject Form Component */}
      <AddProject
        key={selectedProject?.id ?? 'new-project'}
        onProjectSave={handleSaveProject}
        projectToEdit={selectedProject}
        isEditing={isEditing}
        onCancelEdit={resetEditingState}
      />

      {/* Real-time Project List Renderer */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#1e293b] pb-4">
           Published Projects
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-12">
             <Loader2 className="w-10 h-10 animate-spin text-[#14f195]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-12 bg-[#131b2c] rounded-2xl border border-[#1e293b] shadow-xl">
            <p className="text-gray-400 font-medium tracking-wide">No projects yet. Add one above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-[#131b2c] rounded-2xl border border-[#1e293b] overflow-hidden group hover:border-[#14f195]/50 transition-all shadow-lg hover:shadow-xl hover:shadow-[#14f195]/5 flex flex-col justify-between">
                <div>
                  <div className="h-48 bg-[#0a0f1c] relative border-b border-[#1e293b] overflow-hidden">
                    {project.image ? (
                      <img src={project.image} alt={project.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-600 tracking-widest text-sm uppercase">No Image</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg line-clamp-1">{project.title}</h3>
                      <div className="flex gap-2 text-gray-400">
                        {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="hover:text-[#14f195] transition-colors bg-[#0a0f1c] p-1.5 rounded-md border border-[#1e293b]"><ExternalLink className="w-3.5 h-3.5"/></a>}
                        {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="hover:text-[#14f195] transition-colors bg-[#0a0f1c] p-1.5 rounded-md border border-[#1e293b]"><ExternalLink className="w-3.5 h-3.5"/></a>}
                      </div>
                    </div>
                    <TechTags technologies={normalizeProjectTechnologies(project)} className="mb-4" />
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{project.description}</p>
                  </div>
                </div>
                <div className="p-5 pt-0 mt-auto">
                  <div className="flex justify-between items-center pt-4 border-t border-[#1e293b]">
                    <span className="text-xs text-gray-500 font-medium bg-[#0a0f1c] px-3 py-1 rounded-md border border-[#1e293b]">
                       {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="p-2.5 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 rounded-lg transition-colors group-hover:opacity-100 opacity-80 border border-transparent hover:border-cyan-400/20"
                        title={`Edit ${project.title}`}
                        aria-label={`Edit ${project.title}`}
                      >
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2.5 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group-hover:opacity-100 opacity-80 border border-transparent hover:border-red-500/20"
                        title={`Delete ${project.title}`}
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ProjectsManager);
