import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { normalizeProjectTechnologies, parseTechnologiesInput } from '../../utils/projectTechnologies';
import { 
  Search, Grid, List as ListIcon, Plus, ExternalLink, GitBranch, 
  Edit2, Trash2, X, UploadCloud, Loader2, Check, AlertTriangle,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------------
// HELPER: INFER STATUS
// Backward-compatible: only reads status, never auto-writes to Firestore.
// For legacy documents without a formal status field, we infer it in-memory.
// -----------------------------------------------------------------------------
const inferProjectStatus = (project) => {
  if (project.status === 'published' || project.status === 'draft') return project.status;
  // Fallback for legacy items without a formal status field
  if (project.live || project.github || project.liveLink || project.githubLink) return 'published';
  return 'draft';
};

const getProjectTags = (project) => {
  return normalizeProjectTechnologies(project);
};

// -----------------------------------------------------------------------------
// SUB-COMPONENT: PROJECT THUMBNAIL PLACEHOLDER
// -----------------------------------------------------------------------------
const ProjectThumbnail = ({ src, alt, className = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }
  return null;
};

const ThumbnailPlaceholder = ({ size = 'sm' }) => {
  if (size === 'sm') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c] border-[#1e293b]">
        <div className="w-8 h-8 mb-1 opacity-20 flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-gray-500" />
        </div>
        <span className="font-mono text-[8px] text-gray-600 uppercase tracking-widest leading-tight text-center">
          PROJECT<br />PREVIEW
        </span>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c]">
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-3 gap-px opacity-10 mb-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-4 h-4 border border-gray-600" />
          ))}
        </div>
        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.2em]">PROJECT</span>
        <span className="font-mono text-[9px] text-gray-700 uppercase tracking-[0.15em]">PREVIEW</span>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// SUB-COMPONENT: STATUS BADGE
// -----------------------------------------------------------------------------
const StatusBadge = ({ status, size = 'sm' }) => {
  const isPublished = status === 'published';
  const baseClasses = 'inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-widest rounded border';
  
  if (size === 'sm') {
    return (
      <span className={`${baseClasses} text-[9px] px-2 py-0.5 ${
        isPublished
          ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/20'
          : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPublished ? 'bg-[#14f195]' : 'bg-amber-400'}`} />
        {status}
      </span>
    );
  }
  
  return (
    <span className={`${baseClasses} text-[10px] px-2.5 py-1 ${
      isPublished
        ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/20'
        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPublished ? 'bg-[#14f195]' : 'bg-amber-400'}`} />
      {status}
    </span>
  );
};

// -----------------------------------------------------------------------------
// SUB-COMPONENT: TECH CHIPS
// -----------------------------------------------------------------------------
const TechChips = ({ tags, maxVisible = 4 }) => {
  const visible = tags.slice(0, maxVisible);
  const overflow = tags.length - maxVisible;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((t, i) => (
        <span
          key={i}
          className="text-[10px] font-mono text-gray-400 bg-[#0a0f1c] border border-[#1e293b] px-1.5 py-0.5 rounded leading-none"
        >
          {t.toUpperCase()}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] font-mono text-gray-600 px-1 leading-none">
          +{overflow}
        </span>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function ProjectsManager() {
  const { data: rawProjects, loading, fetchAll, create, update, remove } = useFirestoreCrud('projects', {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // View & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('LIST');

  // Modals / Drawer State
  const [editorState, setEditorState] = useState({ isOpen: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });

  // ---------------------------------------------------------------------------
  // DATA PROCESSING
  // ---------------------------------------------------------------------------
  const projects = useMemo(() => {
    if (!rawProjects) return [];
    return rawProjects.map(p => ({
      ...p,
      derivedStatus: inferProjectStatus(p),
      tags: getProjectTags(p)
    }));
  }, [rawProjects]);

  const stats = useMemo(() => {
    const published = projects.filter(p => p.derivedStatus === 'published').length;
    const draft = projects.length - published;
    
    const techCounts = {};
    projects.forEach(p => {
      p.tags.forEach(t => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });
    const topTech = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0].toUpperCase());

    return { total: projects.length, published, draft, topTech };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filterStatus === 'PUBLISHED' && p.derivedStatus !== 'published') return false;
      if (filterStatus === 'DRAFT' && p.derivedStatus !== 'draft') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesTech = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTech) return false;
      }
      return true;
    });
  }, [projects, filterStatus, searchQuery]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const executeDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await remove(deleteDialog.item.id);
      await fetchAll();
      toast.success('Project deleted successfully.');
    } catch {
      toast.error('Failed to delete project.');
    } finally {
      setDeleteDialog({ isOpen: false, item: null });
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER: EDITOR DRAWER
  // ---------------------------------------------------------------------------
  const EditorDrawer = () => {
    if (!editorState.isOpen) return null;
    
    const isEditing = !!editorState.item;
    const initialData = editorState.item || {};
    const projectNumber = isEditing
      ? String(projects.findIndex(p => p.id === initialData.id) + 1).padStart(2, '0')
      : String(projects.length + 1).padStart(2, '0');
    
    // Form State — hooks must be at top level of this component function
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [title, setTitle] = useState(initialData.title || '');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [description, setDescription] = useState(initialData.description || '');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [github, setGithub] = useState(initialData.github || initialData.githubLink || '');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [live, setLive] = useState(initialData.live || initialData.liveLink || '');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [status, setStatus] = useState(initialData.derivedStatus || 'draft');
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [techTags, setTechTags] = useState(isEditing ? getProjectTags(initialData) : []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [techInput, setTechInput] = useState('');
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [imageFile, setImageFile] = useState(null);
    const existingImage = initialData.image || '';

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSaving, setIsSaving] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSuccess, setIsSuccess] = useState(false);
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { uploadImage, uploadProgress, resetUploadState } = useImageUpload();

    // Dirty state detection
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isDirty = useMemo(() => {
      if (!isEditing) {
        return title || description || github || live || techTags.length > 0 || imageFile || status !== 'draft';
      }
      return (
        title !== (initialData.title || '') ||
        description !== (initialData.description || '') ||
        github !== (initialData.github || initialData.githubLink || '') ||
        live !== (initialData.live || initialData.liveLink || '') ||
        status !== initialData.derivedStatus ||
        JSON.stringify(techTags) !== JSON.stringify(getProjectTags(initialData)) ||
        imageFile !== null
      );
    }, [isEditing, initialData, title, description, github, live, status, techTags, imageFile]);

    const handleAddTech = () => {
      if (!techInput.trim()) return;
      const newTags = parseTechnologiesInput(techInput);
      const unique = [...new Set([...techTags, ...newTags])];
      setTechTags(unique);
      setTechInput('');
    };

    const handleSave = async () => {
      if (!title.trim()) {
        toast.error('Project title is required.');
        return;
      }
      setIsSaving(true);
      try {
        let imageUrl = existingImage;
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }

        const payload = {
          title: title.trim(),
          description: description.trim(),
          github: github.trim(),
          live: live.trim(),
          status: status,
          // Keep Firestore format backward compatible — comma-separated string
          technologies: techTags.join(', '),
          image: imageUrl
        };

        if (isEditing) {
          await update(initialData.id, payload);
        } else {
          await create(payload);
        }

        await fetchAll();
        setIsSuccess(true);
        toast.success(isEditing ? 'Project updated successfully.' : 'Project created successfully.');
        setTimeout(() => {
          setEditorState({ isOpen: false, item: null });
          resetUploadState();
        }, 1200);
      } catch {
        toast.error('Failed to save project.');
        setIsSaving(false);
      }
    };

    const previewImageSrc = imageFile ? URL.createObjectURL(imageFile) : existingImage;

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop — subtle dark overlay only, no blur */}
        <div 
          className="absolute inset-0 bg-[#030814]/72 animate-in fade-in duration-200"
          onClick={() => !isSaving && setEditorState({ isOpen: false, item: null })}
        />
        
        {/* Drawer — full-screen on mobile, 600px on desktop */}
        <div className="relative w-full sm:max-w-[600px] h-full bg-[#0a0f1c] border-l border-[#1e293b] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* ── HEADER ── */}
          <div className="px-8 pt-7 pb-6 border-b border-[#1e293b] bg-[#0d1424] flex items-start justify-between shrink-0">
            <div className="flex flex-col gap-0.5">
              {/* Level 1: Mode label */}
              <span className="text-[#14f195] font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                {isEditing ? 'EDIT PROJECT' : 'NEW PROJECT'}
              </span>
              {/* Level 2: Project number */}
              <span className="text-gray-600 font-mono text-xs uppercase tracking-[0.15em]">
                PROJECT {projectNumber}
              </span>
              {/* Level 3: Project title */}
              <h2 className="text-xl font-black text-white tracking-tight mt-1 truncate max-w-[430px]">
                {title || (isEditing ? (initialData.title || 'Untitled') : 'Untitled Project')}
              </h2>
            </div>
            <button 
              onClick={() => !isSaving && setEditorState({ isOpen: false, item: null })}
              className="w-8 h-8 mt-1 rounded-lg bg-[#1e293b] text-gray-500 hover:text-white hover:bg-[#263550] flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="flex-1 overflow-y-auto p-8 space-y-9 project-editor-scrollbar">
            
            {/* 01 / IDENTITY */}
            <section>
              <h3 className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                01 / IDENTITY
                <span className="flex-1 h-px bg-[#1e293b]" />
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Project Title <span className="text-[#14f195]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full h-[46px] bg-[#131b2c] border border-[#1e293b] rounded-lg px-4 text-white text-sm focus:border-[#14f195]/60 focus:ring-1 focus:ring-[#14f195]/20 outline-none transition-all"
                    placeholder="e.g. Enterprise Cloud Architecture"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    className="w-full min-h-[110px] bg-[#131b2c] border border-[#1e293b] rounded-lg p-4 text-white text-sm focus:border-[#14f195]/60 focus:ring-1 focus:ring-[#14f195]/20 outline-none transition-all resize-y"
                    placeholder="Explain the technical challenges, architecture, and outcomes..."
                  />
                </div>
              </div>
            </section>

            {/* 02 / PROJECT MEDIA */}
            <section>
              <h3 className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                02 / PROJECT MEDIA
                <span className="flex-1 h-px bg-[#1e293b]" />
              </h3>
              <div className="relative overflow-hidden bg-[#131b2c] border border-dashed border-[#1e293b] hover:border-[#14f195]/40 transition-all rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer"
                style={{ aspectRatio: '16/7' }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImageFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {previewImageSrc ? (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={previewImageSrc}
                      alt="Preview" 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <UploadCloud className="w-7 h-7 text-white mb-1.5" />
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="z-0 flex flex-col items-center py-6">
                    <UploadCloud className="w-7 h-7 text-gray-600 mb-2 group-hover:text-[#14f195] transition-colors" />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors">Upload Thumbnail</span>
                    <span className="text-xs text-gray-700 mt-1 font-mono">PNG, JPG — max 2MB</span>
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-20">
                    <span className="text-[#14f195] font-mono font-black text-2xl">{uploadProgress}%</span>
                    <span className="text-gray-400 text-xs font-mono mt-1 uppercase tracking-widest">Uploading</span>
                  </div>
                )}
              </div>
            </section>

            {/* 03 / TECHNOLOGY STACK */}
            <section>
              <h3 className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                03 / TECHNOLOGY STACK
                <span className="flex-1 h-px bg-[#1e293b]" />
              </h3>
              <div className="bg-[#131b2c] border border-[#1e293b] rounded-xl p-4 focus-within:border-[#14f195]/40 transition-all">
                {techTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {techTags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e293b] border border-white/5 rounded text-[10px] font-mono text-gray-300 uppercase tracking-wider">
                        {tag}
                        <button 
                          onClick={() => setTechTags(techTags.filter((_, idx) => idx !== i))}
                          className="text-gray-600 hover:text-red-400 transition-colors ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className={`flex items-center gap-2 ${techTags.length > 0 ? 'border-t border-[#1e293b] pt-3' : ''}`}>
                  <input 
                    type="text"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder={techTags.length === 0 ? 'Type a technology and press Enter, e.g. Terraform, Kubernetes...' : 'Add another...'}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-700"
                  />
                  {techInput.trim() && (
                    <button 
                      onClick={handleAddTech}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#14f195] hover:text-[#10d482] transition-colors px-2 py-1 shrink-0"
                    >
                      Add
                    </button>
                  )}
                </div>
                {techTags.length === 0 && !techInput && (
                  <p className="text-[10px] font-mono text-gray-700 mt-2">Press Enter or comma to add a tag</p>
                )}
              </div>
            </section>

            {/* 04 / LINKS */}
            <section>
              <h3 className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                04 / LINKS
                <span className="flex-1 h-px bg-[#1e293b]" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3" /> GitHub / Repo
                  </label>
                  <input 
                    type="url" 
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    className="w-full h-[46px] bg-[#131b2c] border border-[#1e293b] rounded-lg px-4 text-white text-sm focus:border-[#14f195]/60 focus:ring-1 focus:ring-[#14f195]/20 outline-none transition-all"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Live Demo
                  </label>
                  <input 
                    type="url" 
                    value={live}
                    onChange={e => setLive(e.target.value)}
                    className="w-full h-[46px] bg-[#131b2c] border border-[#1e293b] rounded-lg px-4 text-white text-sm focus:border-[#14f195]/60 focus:ring-1 focus:ring-[#14f195]/20 outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            {/* 05 / STATUS */}
            <section>
              <h3 className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                05 / STATUS
                <span className="flex-1 h-px bg-[#1e293b]" />
              </h3>
              <div className="flex bg-[#131b2c] border border-[#1e293b] rounded-xl p-1">
                <button 
                  onClick={() => setStatus('draft')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    status === 'draft' 
                      ? 'bg-[#1e293b] text-amber-400 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-300'
                  }`}
                >
                  <span className={`inline-flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'draft' ? 'bg-amber-400' : 'bg-gray-600'}`} />
                    Draft
                  </span>
                </button>
                <button 
                  onClick={() => setStatus('published')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    status === 'published' 
                      ? 'bg-[#1e293b] text-[#14f195] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-[#14f195]' : 'bg-gray-600'}`} />
                    Published
                  </span>
                </button>
              </div>
            </section>

            {/* LIVE PREVIEW */}
            <section className="pb-8">
              <h3 className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                LIVE PREVIEW
                <span className="flex-1 h-px bg-[#1e293b]" />
              </h3>
              <div className="bg-[#131b2c] rounded-xl border border-[#1e293b] p-4 flex gap-4">
                <div className="w-20 h-20 bg-[#0a0f1c] rounded-lg shrink-0 overflow-hidden border border-[#1e293b]">
                  {previewImageSrc ? (
                    <img src={previewImageSrc} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ThumbnailPlaceholder size="sm" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <h4 className="text-white font-bold text-sm truncate">{title || 'Untitled Project'}</h4>
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-2 leading-relaxed">{description || 'No description provided.'}</p>
                  <div className="flex flex-wrap gap-1">
                    {techTags.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[9px] font-mono text-gray-500 bg-[#1e293b] px-1.5 py-0.5 rounded uppercase">{t}</span>
                    ))}
                    {techTags.length > 3 && <span className="text-[9px] text-gray-600 font-mono">+{techTags.length - 3}</span>}
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="px-8 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex items-center justify-between shrink-0">
            <div className="flex items-center">
              {isDirty ? (
                <span className="flex items-center gap-2 text-amber-400 font-mono text-[10px] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved Changes
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-600 font-mono text-[10px] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                  All Changes Saved
                </span>
              )}
            </div>
            
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                isSuccess 
                  ? 'bg-transparent border border-[#14f195] text-[#14f195]' 
                  : isDirty && !isSaving
                    ? 'bg-[#14f195] text-[#0a0f1c] hover:bg-[#10d482] shadow-[0_0_20px_rgba(20,241,149,0.15)]'
                    : 'bg-[#131b2c] border border-[#1e293b] text-gray-600 cursor-not-allowed'
              }`}
            >
              {isSaving 
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : isSuccess 
                  ? <><Check className="w-4 h-4" /> Saved</>
                  : 'Save Changes'
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER: DELETE DIALOG
  // ---------------------------------------------------------------------------
  const DeleteDialog = () => {
    if (!deleteDialog.isOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030814]/80 animate-in fade-in">
        <div className="bg-[#131b2c] border border-[#1e293b] rounded-2xl w-full max-w-sm shadow-2xl p-7 text-center animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-mono text-[10px] text-red-500/80 uppercase tracking-widest mb-3 block">
            DELETE PROJECT?
          </span>
          <p className="text-gray-300 text-sm leading-relaxed mb-1">
            Are you sure you want to permanently delete:
          </p>
          <p className="text-white font-bold text-base mb-1">
            {deleteDialog.item?.title}
          </p>
          <p className="text-gray-600 text-xs mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setDeleteDialog({ isOpen: false, item: null })} 
              className="flex-1 px-5 py-2.5 rounded-lg text-gray-400 font-bold text-sm hover:text-white hover:bg-[#1e293b] transition-colors border border-transparent hover:border-[#1e293b]"
            >
              Cancel
            </button>
            <button 
              onClick={executeDelete} 
              className="flex-1 px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER MAIN
  // ---------------------------------------------------------------------------
  if (loading && (!rawProjects || rawProjects.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#14f195]" />
          <span className="text-gray-600 font-mono text-xs uppercase tracking-widest">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
          <div>
            <span className="text-[#14f195] font-mono text-[11px] uppercase tracking-[0.2em] font-bold mb-2 block">
              PROJECTS / PORTFOLIO
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-3">
              Project Library
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Manage your engineering projects, source code, technologies, and live demos.
            </p>
          </div>
          <button 
            onClick={() => setEditorState({ isOpen: true, item: null })}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-[#14f195] text-[#0a0f1c] text-sm font-bold rounded-lg hover:bg-[#10d482] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.12)] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>

        {/* ── DYNAMIC STATUS BAR ── */}
        <div className="bg-[#0d1424] border border-[#1e293b] rounded-xl px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black text-[#14f195] leading-none">{stats.total}</span>
            <span className="text-gray-500 font-mono text-[11px] uppercase tracking-widest">Projects</span>
          </div>
          <div className="w-px h-5 bg-[#1e293b] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-amber-400 leading-none">{stats.draft}</span>
            <span className="text-gray-600 font-mono text-[11px] uppercase tracking-widest">Draft</span>
          </div>
          <div className="w-px h-5 bg-[#1e293b] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#14f195] leading-none">{stats.published}</span>
            <span className="text-gray-600 font-mono text-[11px] uppercase tracking-widest">Published</span>
          </div>
          {stats.topTech.length > 0 && (
            <>
              <div className="w-px h-5 bg-[#1e293b] hidden md:block" />
              <div className="text-gray-700 font-mono text-[10px] uppercase tracking-widest hidden md:block truncate">
                {stats.topTech.join(' • ')}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        
        {/* Search */}
        <div className="relative flex-1 max-w-full sm:max-w-[360px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-10 pl-10 pr-4 bg-[#0d1424] border border-[#1e293b] rounded-lg text-sm text-white placeholder:text-gray-700 focus:border-[#14f195]/40 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Status Filter */}
          <div className="flex bg-[#0d1424] border border-[#1e293b] rounded-lg p-1 gap-px">
            {['ALL', 'PUBLISHED', 'DRAFT'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  filterStatus === s 
                    ? s === 'PUBLISHED' 
                      ? 'bg-[#1e293b] text-[#14f195]' 
                      : s === 'DRAFT'
                        ? 'bg-[#1e293b] text-amber-400'
                        : 'bg-[#1e293b] text-white'
                    : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* View Switcher */}
          <div className="flex bg-[#0d1424] border border-[#1e293b] rounded-lg p-1 gap-px">
            <button 
              onClick={() => setViewMode('LIST')} 
              title="List view"
              className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:text-gray-300'}`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('GRID')} 
              title="Grid view"
              className={`p-2 rounded-md transition-colors ${viewMode === 'GRID' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:text-gray-300'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {filteredProjects.length === 0 ? (
        // ── EMPTY STATE ──
        <div className="py-20 flex flex-col items-center justify-center bg-[#0d1424] border border-dashed border-[#1e293b] rounded-2xl text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#131b2c] border border-[#1e293b] flex items-center justify-center mb-5">
            <FolderOpen className="w-7 h-7 text-gray-700" />
          </div>
          {searchQuery || filterStatus !== 'ALL' ? (
            <>
              <h3 className="text-base font-black text-white mb-2 uppercase tracking-wider">No Projects Found</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-5 leading-relaxed">
                No projects match your current search or filters.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterStatus('ALL'); }} 
                className="text-[#14f195] font-bold text-sm font-mono uppercase tracking-widest hover:text-[#10d482] transition-colors"
              >
                ← Clear Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-black text-white mb-2 uppercase tracking-wider">Project Library is Empty</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
                Start building your portfolio by adding your first engineering project.
              </p>
              <button 
                onClick={() => setEditorState({ isOpen: true, item: null })} 
                className="flex items-center gap-2 px-5 py-2.5 bg-[#14f195] text-[#0a0f1c] rounded-lg font-bold text-sm hover:bg-[#10d482] transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Project
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'LIST' ? (
        // ── LIST VIEW ──
        <div>
          {/* Column Headers */}
          <div className="hidden lg:grid px-4 pb-2 mb-1"
            style={{ gridTemplateColumns: '1fr 100px 200px 72px 90px 72px' }}
          >
            {['PROJECT', 'STATUS', 'TECH STACK', 'LINKS', 'UPDATED', 'ACTIONS'].map(col => (
              <span key={col} className="text-[9px] font-mono text-gray-700 uppercase tracking-[0.15em]">{col}</span>
            ))}
          </div>

          {/* Project Rows */}
          <div className="space-y-1.5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-[#0d1424] border border-[#1e293b] hover:border-[#14f195]/25 rounded-xl overflow-hidden transition-all duration-200 hover:bg-[#101829]"
              >
                {/* Left accent line on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#14f195] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl" />

                {/* Row content */}
                <div className="flex flex-col lg:grid lg:items-center gap-4 lg:gap-0 p-4 pl-5"
                  style={{ gridTemplateColumns: '1fr 100px 200px 72px 90px 72px' }}
                >
                  {/* PROJECT */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg border border-[#1e293b] overflow-hidden shrink-0 bg-[#0a0f1c]">
                      {project.image 
                        ? <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                        : <ThumbnailPlaceholder size="sm" />
                      }
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white leading-snug truncate mb-0.5">{project.title}</h3>
                      <p className="text-xs text-gray-600 truncate leading-snug">{project.description}</p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex lg:block">
                    <StatusBadge status={project.derivedStatus} size="sm" />
                  </div>

                  {/* TECH STACK */}
                  <div>
                    <TechChips tags={project.tags} maxVisible={3} />
                  </div>

                  {/* LINKS */}
                  <div className="flex items-center gap-2.5">
                    {(project.github || project.githubLink) && (
                      <a 
                        href={project.github || project.githubLink} 
                        target="_blank" rel="noreferrer" 
                        className="text-gray-600 hover:text-white transition-colors" 
                        title="GitHub"
                        onClick={e => e.stopPropagation()}
                      >
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                    {(project.live || project.liveLink) && (
                      <a 
                        href={project.live || project.liveLink} 
                        target="_blank" rel="noreferrer" 
                        className="text-gray-600 hover:text-[#14f195] transition-colors" 
                        title="Live Demo"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* UPDATED */}
                  <div className="hidden lg:block">
                    <span className="font-mono text-[10px] text-gray-700 leading-snug">
                      {project.updatedAt?.toDate 
                        ? new Date(project.updatedAt.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                        : project.createdAt?.toDate 
                          ? new Date(project.createdAt.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                          : '—'
                      }
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-0.5 justify-end lg:justify-start">
                    <button 
                      onClick={() => setEditorState({ isOpen: true, item: project })} 
                      className="p-2 text-gray-600 hover:text-[#14f195] hover:bg-[#14f195]/8 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeleteDialog({ isOpen: true, item: project })} 
                      className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── GRID VIEW ──
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-[#0d1424] border border-[#1e293b] hover:border-[#14f195]/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            >
              {/* 16:9 thumbnail */}
              <div className="relative border-b border-[#1e293b] overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {project.image 
                  ? <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  : <ThumbnailPlaceholder size="lg" />
                }
                {/* Status badge overlay */}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={project.derivedStatus} size="md" />
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1 leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1">
                  {project.description || 'No description provided.'}
                </p>
                <div className="mb-4">
                  <TechChips tags={project.tags} maxVisible={4} />
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1e293b] mt-auto">
                  <div className="flex items-center gap-3">
                    {(project.github || project.githubLink) && (
                      <a 
                        href={project.github || project.githubLink} 
                        target="_blank" rel="noreferrer" 
                        className="text-gray-600 hover:text-white transition-colors" 
                        title="GitHub"
                      >
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                    {(project.live || project.liveLink) && (
                      <a 
                        href={project.live || project.liveLink} 
                        target="_blank" rel="noreferrer" 
                        className="text-gray-600 hover:text-[#14f195] transition-colors" 
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => setEditorState({ isOpen: true, item: project })} 
                      className="p-1.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeleteDialog({ isOpen: true, item: project })} 
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditorDrawer />
      <DeleteDialog />

    </div>
  );
}
