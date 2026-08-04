import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import toast from 'react-hot-toast';
import { normalizeProjectTechnologies, parseTechnologiesInput } from '../../utils/projectTechnologies';

import { EnterpriseInput, EnterpriseTextarea, EnterpriseFormGroup } from './UI/Enterprise/Form/EnterpriseForm';
import EnterpriseUploader from './UI/Enterprise/Form/EnterpriseUploader';

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  technologies: '',
  github: '',
  live: '',
};

const buildInitialFormData = (projectToEdit) => {
  if (!projectToEdit) return INITIAL_FORM_DATA;
  return {
    title: projectToEdit.title || '',
    description: projectToEdit.description || '',
    technologies: normalizeProjectTechnologies(projectToEdit).join(', '),
    github: projectToEdit.github || projectToEdit.githubUrl || '',
    live: projectToEdit.live || projectToEdit.liveUrl || '',
  };
};

const AddProject = ({
  onProjectSave,
  projectToEdit = null,
  isEditing = false,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState(() => buildInitialFormData(projectToEdit));
  const [imageFile, setImageFile] = useState(null);
  const [techInput, setTechInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadImage, uploadProgress, resetUploadState } = useImageUpload();

  const technologies = parseTechnologiesInput(formData.technologies);
  const existingImage = projectToEdit?.image || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const commitTechnologyInput = useCallback(() => {
    const combinedValue = [formData.technologies, techInput]
      .filter((value) => typeof value === 'string' && value.trim().length > 0)
      .join(',');

    const normalizedValue = parseTechnologiesInput(combinedValue).join(', ');

    setTechInput('');
    setFormData((prev) => ({ ...prev, technologies: normalizedValue }));
  }, [formData.technologies, techInput]);

  const handleTechnologyKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTechnologyInput();
    }
  };

  const handleTechnologyBlur = () => {
    if (techInput.trim()) {
      commitTechnologyInput();
    }
  };

  const handleRemoveTechnology = (technologyToRemove) => {
    const nextTechnologies = technologies.filter((item) => item !== technologyToRemove);
    setFormData((prev) => ({ ...prev, technologies: nextTechnologies.join(', ') }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File is too large! Maximum allowed is 2MB.');
        e.target.value = '';
        setImageFile(null);
        return;
      }
      setImageFile(file);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(buildInitialFormData(projectToEdit));
    setImageFile(null);
    setTechInput('');
    resetUploadState();
  }, [projectToEdit, resetUploadState]);

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const normalizedTitle = formData.title.trim();
      const normalizedDescription = formData.description.trim();
      const normalizedGithub = formData.github.trim();
      const normalizedLive = formData.live.trim();
      const normalizedTechnologies = parseTechnologiesInput(
        [formData.technologies, techInput].filter(Boolean).join(',')
      );

      if (!normalizedTitle || !normalizedDescription || normalizedTechnologies.length === 0) {
        toast.error('Please complete all required fields (Title, Description, Technologies).');
        setIsSubmitting(false);
        return;
      }

      let imageUrl = existingImage;

      if (imageFile) {
        toast.loading('Uploading project image...', { id: 'upload-toast' });
        imageUrl = await uploadImage(imageFile);
        toast.success('Image uploaded successfully!', { id: 'upload-toast' });
      }

      const projectData = {
        title: normalizedTitle,
        description: normalizedDescription,
        technologies: normalizedTechnologies,
        github: normalizedGithub,
        live: normalizedLive,
        image: imageUrl,
      };

      await onProjectSave(projectData);
      resetForm();
      toast.dismiss('upload-toast');
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: 'upload-toast' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col h-full animate-in fade-in">
      
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1c]/80 backdrop-blur-md rounded-xl">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-cms-primary shadow-[0_0_15px_rgba(20,241,149,0.5)] rounded-full" />
          <p className="text-sm font-bold uppercase tracking-widest text-white">
            Saving Project {uploadProgress > 0 ? `${uploadProgress}%` : ''}
          </p>
        </div>
      )}

      <div className="space-y-6 flex-1 pb-6">
        <EnterpriseFormGroup>
          <EnterpriseInput
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Enterprise E-Commerce"
            required
            disabled={isSubmitting}
          />
          <EnterpriseUploader
            file={imageFile}
            existingImageUrl={existingImage}
            onFileChange={handleFileChange}
            progress={uploadProgress}
            disabled={isSubmitting}
            hint={isEditing ? "Leave unchanged to keep current image." : ""}
          />
        </EnterpriseFormGroup>

        <EnterpriseTextarea
          label="Project Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed explanation of the project's goals and technical challenges..."
          rows={4}
          required
          disabled={isSubmitting}
        />

        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-bold text-gray-300">Technologies</label>
          <div className="rounded-lg border border-white/10 bg-black/40 p-3 focus-within:border-cms-primary transition-colors">
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-400"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
                    className="text-cyan-600 hover:text-cyan-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechnologyKeyDown}
                onBlur={handleTechnologyBlur}
                className="min-w-[150px] flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-gray-600"
                placeholder="Type and press Enter..."
                disabled={isSubmitting}
              />
            </div>
          </div>
          <span className="mt-1.5 text-xs text-gray-500">Press Enter or Comma to add tags.</span>
        </div>

        <EnterpriseFormGroup>
          <EnterpriseInput
            label="GitHub Repository URL"
            name="github"
            type="url"
            value={formData.github}
            onChange={handleChange}
            placeholder="https://github.com/username/repo"
            disabled={isSubmitting}
          />
          <EnterpriseInput
            label="Live Demo URL"
            name="live"
            type="url"
            value={formData.live}
            onChange={handleChange}
            placeholder="https://project.com"
            disabled={isSubmitting}
          />
        </EnterpriseFormGroup>
      </div>

      <div className="sticky bottom-0 bg-[#0a0f1c] pt-4 pb-2 border-t border-white/10 flex justify-end gap-3 mt-auto">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-cms-primary text-black font-bold rounded-lg hover:bg-[#12d684] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Save Changes' : 'Create Project'}
        </button>
      </div>

    </form>
  );
};

export default AddProject;
