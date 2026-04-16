import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { uploadImage } from '../../services/storage';
import toast from 'react-hot-toast';
import { normalizeProjectTechnologies, parseTechnologiesInput } from '../../utils/projectTechnologies';

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  technologies: '',
  github: '',
  live: '',
};

const buildInitialFormData = (projectToEdit) => {
  if (!projectToEdit) {
    return INITIAL_FORM_DATA;
  }

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const technologies = parseTechnologiesInput(formData.technologies);
  const existingImage = projectToEdit?.image || '';
  const imagePreview = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return existingImage;
  }, [existingImage, imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const commitTechnologyInput = () => {
    const combinedValue = [formData.technologies, techInput]
      .filter((value) => typeof value === 'string' && value.trim().length > 0)
      .join(',');

    const normalizedValue = parseTechnologiesInput(combinedValue).join(', ');

    setTechInput('');
    setFormData((prev) => ({ ...prev, technologies: normalizedValue }));
  };

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

  const resetForm = () => {
    setFormData(buildInitialFormData(projectToEdit));
    setImageFile(null);
    setTechInput('');
    setUploadProgress(0);

    const fileInput = document.getElementById('project-image-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const normalizedTitle = formData.title.trim();
      const normalizedDescription = formData.description.trim();
      const normalizedGithub = formData.github.trim();
      const normalizedLive = formData.live.trim();
      const normalizedTechnologies = parseTechnologiesInput(
        [formData.technologies, techInput].filter(Boolean).join(',')
      );

      if (!normalizedTitle || !normalizedDescription || normalizedTechnologies.length === 0) {
        toast.error('Please complete all required fields before saving.');
        return;
      }

      let imageUrl = existingImage;

      if (imageFile) {
        toast.loading('Uploading project image...', { id: 'upload-toast' });

        imageUrl = await uploadImage(imageFile, (progress) => {
          setUploadProgress(progress);
        });

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
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mb-8 overflow-hidden rounded-xl border border-[#1e293b] bg-[#131b2c] p-6 shadow-xl"
    >
      {isUploading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#14f195]" />
          <p className="text-sm font-bold uppercase tracking-widest text-white">
            Processing {uploadProgress > 0 ? `${uploadProgress}%` : ''}
          </p>
        </div>
      )}

      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
        {isEditing ? 'Edit Project' : 'Add New Project'}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Title</label>
          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white transition-colors focus:border-[#14f195] focus:outline-none"
            placeholder="Project Name"
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Project Image (Max 2MB)</label>
          <div className="space-y-3">
            {imagePreview ? (
              <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0a0f1c]">
                <img
                  src={imagePreview}
                  alt={formData.title || 'Project preview'}
                  className="h-36 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="group relative flex h-[46px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#1e293b] bg-[#0a0f1c] transition-colors hover:border-[#14f195]">
              {imageFile ? (
                <span className="flex items-center gap-2 truncate px-4 text-sm font-medium text-[#14f195]">
                  <ImageIcon className="h-4 w-4 shrink-0" /> {imageFile.name}
                </span>
              ) : existingImage ? (
                <span className="flex items-center gap-2 truncate px-4 text-sm font-medium text-cyan-300">
                  <ImageIcon className="h-4 w-4 shrink-0" /> Current image selected
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <UploadCloud className="h-5 w-5" /> Choose an Image
                </span>
              )}

              <input
                id="project-image-input"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-[#1e293b]">
                  <div
                    className="h-full bg-[#14f195] transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          {isEditing ? (
            <p className="mt-2 text-xs text-gray-500">
              Leave the image unchanged to keep the current one, or upload a new file to replace it.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm text-gray-400">Description</label>
        <textarea
          required
          rows="3"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white transition-colors focus:border-[#14f195] focus:outline-none"
          placeholder="Project description..."
          disabled={isUploading}
        />
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm text-gray-400">Technologies</label>
        <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1c] p-3 transition-colors focus-within:border-[#14f195]">
          <div className="flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <span
                key={technology}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_-12px_rgba(20,241,149,0.6)]"
              >
                {technology}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(technology)}
                  className="text-cyan-200 transition-colors hover:text-white"
                  aria-label={`Remove ${technology}`}
                  disabled={isUploading}
                >
                  x
                </button>
              </span>
            ))}

            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechnologyKeyDown}
              onBlur={handleTechnologyBlur}
              className="min-w-[180px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              placeholder="AWS, Docker, Kubernetes, Terraform"
              disabled={isUploading}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Add technologies with commas or press Enter. Duplicate and empty values are ignored.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-400">GitHub URL</label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white transition-colors focus:border-[#14f195] focus:outline-none"
            placeholder="https://github.com/..."
            disabled={isUploading}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Live URL</label>
          <input
            type="url"
            name="live"
            value={formData.live}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white transition-colors focus:border-[#14f195] focus:outline-none"
            placeholder="https://..."
            disabled={isUploading}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-[#1e293b] pt-6">
        {isEditing ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-lg border border-[#1e293b] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Cancel Edit
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isUploading}
          className="flex items-center gap-2 rounded-lg bg-[#14f195] px-6 py-2.5 font-bold text-[#0a0f1c] transition-colors hover:bg-[#10d482] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Processing...
            </>
          ) : (
            <>
              {isEditing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {isEditing ? 'Update Project' : 'Add Project'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddProject;
