import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { normalizeProjectTechnologies } from '../../utils/projectTechnologies';

const ProjectList = ({ projects, onDelete, isDeletingId }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-[#131b2c] border border-[#1e293b] rounded-xl">
        <p className="text-gray-400">No projects found. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-[#131b2c] border border-[#1e293b] rounded-xl overflow-hidden hover:border-[#14f195]/50 transition-colors flex flex-col p-5">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-bold text-white line-clamp-1">{project.title}</h4>
          </div>
          
          <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-grow">{project.description}</p>
          
          <div className="mb-4 flex flex-wrap gap-2">
            {normalizeProjectTechnologies(project).map((technology) => (
              <span
                key={`${project.id}-${technology}`}
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-300"
              >
                {technology}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#1e293b]">
            <button 
              onClick={() => onDelete(project.id)}
              disabled={isDeletingId === project.id}
              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'New'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
