import React, { useState, useEffect } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { normalizeProjectTechnologies, parseTechnologiesInput } from '../../utils/projectTechnologies';

const EditProject = ({ project, onUpdate, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', image: '', technologies: '', github: '', live: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        image: project.image || '',
        technologies: normalizeProjectTechnologies(project).join(', '),
        github: project.github || '',
        live: project.live || ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(project.id, {
      ...formData,
      technologies: parseTechnologiesInput(formData.technologies),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#131b2c] border border-[#14f195] rounded-xl p-6 mb-8 shadow-lg shadow-[#14f195]/10">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-xl font-bold flex items-center gap-2">Edit Project</h3>
         <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] focus:outline-none text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Image URL</label>
          <input required type="url" name="image" value={formData.image} onChange={handleChange} className="w-full p-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] focus:outline-none text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea required rows="3" name="description" value={formData.description} onChange={handleChange} className="w-full p-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] focus:outline-none text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Technologies</label>
          <input
            type="text"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            className="w-full p-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] focus:outline-none text-white"
            placeholder="AWS, Docker, Kubernetes, Terraform"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
          <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full p-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] focus:outline-none text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Live URL</label>
          <input type="url" name="live" value={formData.live} onChange={handleChange} className="w-full p-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] focus:outline-none text-white" />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="bg-transparent border border-[#1e293b] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors">Cancel</button>
        <button type="submit" disabled={isLoading} className="bg-[#14f195] hover:bg-[#10d482] text-[#0a0f1c] px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" />Update Project</>}
        </button>
      </div>
    </form>
  );
};

export default EditProject;
