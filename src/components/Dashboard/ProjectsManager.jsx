import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { normalizeProjectTechnologies, parseTechnologiesInput } from '../../utils/projectTechnologies';
import {
  Search, Grid, List as ListIcon, Plus, ExternalLink, GitBranch,
  Edit2, Trash2, X, UploadCloud, Loader2, Check, AlertTriangle,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// STATUS INFERENCE
//
// Rules (in order of priority):
//   1. If project.status is "published" or "draft" → use it explicitly.
//   2. Legacy projects without a status field: infer from links.
//      Any valid link field → published.  No link fields → draft.
//
// Field aliases supported:
//   GitHub: github, githubLink, githubUrl, repo, repository
//   Live:   live, liveLink, liveUrl, demo
//
// NEVER writes inferred status back to Firestore.
// ─────────────────────────────────────────────────────────────────────────────
const hasValidLink = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const inferProjectStatus = (project) => {
  if (project.status === 'published' || project.status === 'draft') return project.status;
  if (
    hasValidLink(project.github) || hasValidLink(project.githubLink) ||
    hasValidLink(project.githubUrl) || hasValidLink(project.repo) ||
    hasValidLink(project.repository) || hasValidLink(project.live) ||
    hasValidLink(project.liveLink) || hasValidLink(project.liveUrl) ||
    hasValidLink(project.demo)
  ) return 'published';
  return 'draft';
};

const getGithubLink = (p) =>
  p.github || p.githubLink || p.githubUrl || p.repo || p.repository || '';

const getLiveLink = (p) =>
  p.live || p.liveLink || p.liveUrl || p.demo || '';

const getProjectTags = (project) => normalizeProjectTechnologies(project);

// ─────────────────────────────────────────────────────────────────────────────
// LIST-VIEW THUMBNAIL PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────
const ThumbnailPlaceholder = ({ size = 'sm' }) => {
  if (size === 'sm') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c]">
        <FolderOpen className="w-5 h-5 text-gray-700 mb-0.5" />
        <span className="font-mono text-[7px] text-gray-700 uppercase tracking-widest leading-tight text-center">
          NO IMAGE
        </span>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c]">
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-4 gap-[3px] opacity-[0.07]">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-4 h-4 border border-gray-400 rounded-[1px]" />
          ))}
        </div>
        <span className="font-mono text-[10px] text-gray-700 uppercase tracking-[0.18em]">PROJECT</span>
        <span className="font-mono text-[9px] text-gray-800 uppercase tracking-[0.12em] -mt-1.5">PREVIEW</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isPublished = status === 'published';
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-widest rounded border text-[9px] px-2 py-0.5 whitespace-nowrap ${
      isPublished
        ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/20'
        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPublished ? 'bg-[#14f195]' : 'bg-amber-400'}`} />
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TECH CHIPS (display-only, used in list/grid)
// ─────────────────────────────────────────────────────────────────────────────
const TechChips = ({ tags, maxVisible = 4 }) => {
  const visible = tags.slice(0, maxVisible);
  const overflow = tags.length - maxVisible;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((t, i) => (
        <span
          key={i}
          className="text-[9px] font-mono text-gray-500 bg-[#131b2c] border border-[#1e293b] px-1.5 py-0.5 rounded leading-none uppercase tracking-wider"
        >
          {t}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[9px] font-mono text-gray-700 px-0.5 leading-none">+{overflow}</span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR DRAWER  — IDE-style panel
// ─────────────────────────────────────────────────────────────────────────────
const EditorDrawer = ({ isOpen, item, projectIndex, projectCount, onClose, onSave }) => {
  if (!isOpen) return null;

  const isEditing   = !!item;
  const initialData = item || {};
  const initialGithub = getGithubLink(initialData);
  const initialLive   = getLiveLink(initialData);

  // ── Form state ──────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [title,       setTitle]       = useState(initialData.title || '');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [description, setDescription] = useState(initialData.description || '');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [github,      setGithub]      = useState(initialGithub);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [live,        setLive]        = useState(initialLive);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [status,      setStatus]      = useState(initialData.derivedStatus || 'draft');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [techTags,    setTechTags]    = useState(isEditing ? getProjectTags(initialData) : []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [techInput,   setTechInput]   = useState('');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [imageFile,   setImageFile]   = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isSaving,    setIsSaving]    = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isSuccess,   setIsSuccess]   = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { uploadImage, uploadProgress, resetUploadState } = useImageUpload();

  const existingImage   = initialData.image || '';
  const previewImageSrc = imageFile ? URL.createObjectURL(imageFile) : existingImage;
  const projectNumber   = String(isEditing ? projectIndex + 1 : projectCount + 1).padStart(2, '0');

  // ── Dirty detection ──────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isDirty = useMemo(() => {
    if (!isEditing) {
      return !!(title || description || github || live || techTags.length > 0 || imageFile || status !== 'draft');
    }
    return (
      title !== (initialData.title || '') ||
      description !== (initialData.description || '') ||
      github !== initialGithub ||
      live   !== initialLive   ||
      status !== initialData.derivedStatus ||
      JSON.stringify(techTags) !== JSON.stringify(getProjectTags(initialData)) ||
      imageFile !== null
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, github, live, status, techTags, imageFile]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddTech = () => {
    if (!techInput.trim()) return;
    const newTags = parseTechnologiesInput(techInput);
    setTechTags(prev => [...new Set([...prev, ...newTags])]);
    setTechInput('');
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Project title is required.'); return; }
    setIsSaving(true);
    try {
      let imageUrl = existingImage;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        github: github.trim(),
        live: live.trim(),
        status,
        technologies: techTags.join(', '), // comma-separated — backward compatible
        image: imageUrl,
      };

      await onSave(isEditing ? initialData.id : null, payload);
      setIsSuccess(true);
      toast.success(isEditing ? 'Project updated.' : 'Project created.');
      setTimeout(() => { onClose(); resetUploadState(); }, 900);
    } catch {
      toast.error('Failed to save project.');
      setIsSaving(false);
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const iCls = [
    'w-full h-11 bg-[#060c18] border border-[#1b2d47] rounded px-3',
    'text-[13px] text-white placeholder:text-[#253550]',
    'focus:border-[#14f195]/55 focus:ring-0 outline-none transition-colors',
  ].join(' ');

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">

      {/* ── Backdrop: translucent so project list stays visible ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(3, 8, 20, 0.60)' }}
        onClick={() => !isSaving && onClose()}
      />

      {/* ── Panel ── */}
      <div
        className="relative w-full sm:max-w-[548px] h-full flex flex-col overflow-hidden"
        style={{
          background: '#0c1322',
          borderLeft: '1px solid #182840',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.55)',
          animation: 'drawerSlideIn 180ms cubic-bezier(0.25,1,0.5,1) both',
        }}
      >

        {/* ════════════ HEADER ════════════ */}
        <div
          className="shrink-0 px-6 pt-5 pb-4 flex items-start gap-4 justify-between"
          style={{ borderBottom: '1px solid #182840', background: '#09101d' }}
        >
          {/* Left: hierarchy */}
          <div className="min-w-0 flex-1">
            {/* Row 1: mode badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm"
                style={{
                  color: '#14f195',
                  background: 'rgba(20,241,149,0.07)',
                  border: '1px solid rgba(20,241,149,0.15)',
                }}
              >
                <span className="w-1 h-1 rounded-full bg-[#14f195]" />
                {isEditing ? 'EDIT PROJECT' : 'NEW PROJECT'}
              </span>
            </div>

            {/* Row 2: meta */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: '#253550' }}>
                PROJECT {projectNumber}
              </span>
              <span style={{ color: '#182840' }}>·</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: '#253550' }}>
                CONFIGURATION
              </span>
            </div>

            {/* Row 3: live title — dominant */}
            <h2
              className="text-white font-bold leading-tight truncate"
              style={{ fontSize: '16px', letterSpacing: '-0.01em' }}
            >
              {title || (isEditing ? (initialData.title || 'Untitled') : 'Untitled Project')}
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={() => !isSaving && onClose()}
            disabled={isSaving}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors disabled:opacity-30"
            style={{ background: '#111d30', border: '1px solid #1b2d47', color: '#3d5470' }}
            onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#2d4060'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#3d5470'; e.currentTarget.style.borderColor='#1b2d47'; }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ════════════ BODY ════════════ */}
        <div className="flex-1 overflow-y-auto project-editor-scrollbar">
          <div className="px-6 py-5 space-y-5">

            {/* ── 01  IDENTITY ── */}
            <section>
              <DSL n="01" label="IDENTITY" />
              <div className="space-y-2">
                <div>
                  <DFL>Project Title <span style={{ color: '#14f195' }}>*</span></DFL>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Enterprise Cloud Architecture"
                    className={iCls}
                  />
                </div>
                <div>
                  <DFL>Description</DFL>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Architecture, technical challenges, outcomes…"
                    className="w-full bg-[#060c18] border border-[#1b2d47] rounded px-3 py-2.5 text-[13px] text-white placeholder:text-[#253550] focus:border-[#14f195]/55 outline-none transition-colors leading-relaxed resize-none"
                    style={{ minHeight: '108px' }}
                  />
                </div>
              </div>
            </section>

            {/* ── 02  MEDIA ── */}
            <section>
              <DSL n="02" label="MEDIA" />
              <div
                className="relative overflow-hidden rounded cursor-pointer group"
                style={{ height: '192px', background: '#060c18', border: '1px dashed #1b2d47' }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {previewImageSrc ? (
                  <div className="absolute inset-0">
                    <img
                      src={previewImageSrc}
                      alt="Preview"
                      className="w-full h-full object-cover transition-opacity duration-200"
                      style={{ opacity: 0.85 }}
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
                      style={{ background: 'rgba(6,12,24,0.72)' }}
                    >
                      <span
                        className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm"
                        style={{
                          color: '#14f195',
                          border: '1px solid rgba(20,241,149,0.3)',
                          background: 'rgba(20,241,149,0.06)',
                        }}
                      >
                        <UploadCloud className="w-3 h-3" />
                        Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty — engineering-style placeholder */
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
                    {/* dot-grid motif */}
                    <div className="grid grid-cols-5 gap-[5px] opacity-[0.09]">
                      {[...Array(15)].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                      ))}
                    </div>
                    <div className="text-center">
                      <div
                        className="text-[11px] font-semibold mb-0.5 group-hover:text-[#5070a0] transition-colors"
                        style={{ color: '#2d4060' }}
                      >
                        + PROJECT IMAGE
                      </div>
                      <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#1b2d47' }}>
                        Upload thumbnail · PNG / JPG · max 2MB
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload progress overlay */}
                {uploadProgress > 0 && (
                  <div
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                    style={{ background: 'rgba(6,12,24,0.92)' }}
                  >
                    <span className="font-mono font-black text-xl" style={{ color: '#14f195' }}>
                      {uploadProgress}%
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest mt-1" style={{ color: '#3d5470' }}>
                      Uploading
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* ── 03  STACK ── */}
            <section>
              <DSL n="03" label="STACK" />
              <div
                className="rounded transition-colors"
                style={{ background: '#060c18', border: '1px solid #1b2d47' }}
              >
                {/* Active chips */}
                {techTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 pt-2.5 pb-2">
                    {techTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider rounded-sm"
                        style={{ padding: '2px 8px', background: '#0f1e33', border: '1px solid #1b3050', color: '#7090b0' }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTechTags(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ color: '#304060', marginLeft: '2px', lineHeight: 1 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#d05050')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#304060')}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div
                  className={`flex items-center gap-2 px-3 ${techTags.length > 0 ? 'border-t py-2' : 'py-2'}`}
                  style={{ borderColor: '#182840' }}
                >
                  <span className="font-mono text-[11px]" style={{ color: '#253550' }}>+</span>
                  <input
                    type="text"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTech(); }
                    }}
                    placeholder={techTags.length === 0
                      ? 'Add technology… (Enter or comma)'
                      : 'Add another…'
                    }
                    className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#253550]"
                  />
                  {techInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="font-mono text-[10px] font-bold uppercase tracking-widest transition-colors"
                      style={{ color: '#14f195' }}
                    >
                      Add ↵
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ── 04  LINKS ── */}
            <section>
              <DSL n="04" label="LINKS" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <DFL>
                    <GitBranch className="w-3 h-3 inline mr-1 opacity-40 -mt-px" />
                    GitHub Repository
                  </DFL>
                  <input
                    type="url"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    placeholder="https://github.com/…"
                    className={iCls}
                  />
                </div>
                <div>
                  <DFL>
                    <ExternalLink className="w-3 h-3 inline mr-1 opacity-40 -mt-px" />
                    Live Demo
                  </DFL>
                  <input
                    type="url"
                    value={live}
                    onChange={e => setLive(e.target.value)}
                    placeholder="https://…"
                    className={iCls}
                  />
                </div>
              </div>
            </section>

            {/* ── 05  VISIBILITY ── */}
            <section>
              <DSL n="05" label="VISIBILITY" />
              <div
                className="flex p-0.5 rounded"
                style={{ background: '#060c18', border: '1px solid #1b2d47' }}
              >
                {[
                  {
                    value: 'draft',
                    label: 'Draft',
                    color: '#d97706',
                    activeBg: 'rgba(217,119,6,0.08)',
                    activeBorder: 'rgba(217,119,6,0.22)',
                  },
                  {
                    value: 'published',
                    label: 'Published',
                    color: '#14f195',
                    activeBg: 'rgba(20,241,149,0.07)',
                    activeBorder: 'rgba(20,241,149,0.2)',
                  },
                ].map(({ value, label, color, activeBg, activeBorder }) => {
                  const on = status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                      style={on
                        ? { color, background: activeBg, border: `1px solid ${activeBorder}` }
                        : { color: '#2d4060', background: 'transparent', border: '1px solid transparent' }
                      }
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: on ? color : '#1b2d47' }}
                      />
                      ● {label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── LIVE PREVIEW ── */}
            <section style={{ paddingBottom: '6px' }}>
              <DSL label="PREVIEW" />
              <div
                className="flex gap-3 rounded p-3"
                style={{ background: '#070e1c', border: '1px solid #152030' }}
              >
                {/* Thumbnail */}
                <div
                  className="shrink-0 rounded overflow-hidden"
                  style={{ width: '60px', height: '60px', background: '#060c18', border: '1px solid #1b2d47' }}
                >
                  {previewImageSrc
                    ? <img src={previewImageSrc} alt="" className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-4 h-4" style={{ color: '#1b2d47' }} />
                      </div>
                    )
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-white font-semibold text-[12px] truncate leading-snug">
                      {title || 'Untitled Project'}
                    </h4>
                    {/* Inline status dot */}
                    <span
                      className="shrink-0 text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
                      style={status === 'published'
                        ? { color: '#14f195', background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.18)' }
                        : { color: '#d97706', background: 'rgba(217,119,6,0.08)',  border: '1px solid rgba(217,119,6,0.18)' }
                      }
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-[10px] line-clamp-2 leading-relaxed mb-1.5" style={{ color: '#3d5470' }}>
                    {description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {techTags.slice(0, 4).map((t, i) => (
                      <span
                        key={i}
                        className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm"
                        style={{ color: '#3d5470', background: '#0f1e33', border: '1px solid #1b3050' }}
                      >
                        {t}
                      </span>
                    ))}
                    {techTags.length > 4 && (
                      <span className="text-[8px] font-mono" style={{ color: '#1b2d47' }}>+{techTags.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* ════════════ FOOTER ════════════ */}
        <div
          className="shrink-0 flex items-center justify-between px-6"
          style={{ height: '64px', borderTop: '1px solid #182840', background: '#09101d' }}
        >
          {/* Save state indicator */}
          <span
            className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest"
            style={{ color: isDirty ? '#d97706' : '#253550' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: isDirty ? '#d97706' : '#253550' }}
            />
            {isDirty ? 'Unsaved changes' : 'Saved'}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 px-4 rounded text-[12px] font-medium transition-colors disabled:opacity-30"
              style={{ color: '#3d5470' }}
              onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='#111d30'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#3d5470'; e.currentTarget.style.background='transparent'; }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="h-9 px-5 rounded text-[12px] font-bold flex items-center gap-1.5 transition-all"
              style={
                isSuccess
                  ? { color: '#14f195', background: 'rgba(20,241,149,0.07)', border: '1px solid rgba(20,241,149,0.25)' }
                  : isDirty && !isSaving
                    ? { color: '#09101d', background: '#14f195', border: '1px solid #14f195', boxShadow: '0 0 12px rgba(20,241,149,0.2)' }
                    : { color: '#253550', background: '#0a1322', border: '1px solid #1b2d47', cursor: 'not-allowed', opacity: 0.5 }
              }
            >
              {isSaving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : isSuccess
                  ? <><Check className="w-3.5 h-3.5" /> Saved</>
                  : 'Save Changes'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe — injected once */}
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

// ── Drawer helpers ─────────────────────────────────────────────────────────────
// DSL = Drawer Section Label, DFL = Drawer Field Label
const DSL = ({ n, label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    {n && <span className="font-mono text-[8px] font-bold" style={{ color: 'rgba(20,241,149,0.6)' }}>{n}</span>}
    <span className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: '#253550' }}>{label}</span>
    <span className="flex-1 h-px" style={{ background: '#182840' }} />
  </div>
);

const DFL = ({ children }) => (
  <label className="block text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: '#304060' }}>
    {children}
  </label>
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DIALOG
// ─────────────────────────────────────────────────────────────────────────────
const DeleteDialog = ({ item, onCancel, onConfirm }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030814]/80 animate-in fade-in">
      <div className="bg-[#0f1829] border border-[#1a2440] rounded-2xl w-full max-w-[340px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
        <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <span className="font-mono text-[9px] text-red-500/70 uppercase tracking-[0.2em] mb-2 block">
          DELETE PROJECT?
        </span>
        <p className="text-gray-400 text-[13px] leading-relaxed mb-1">Permanently delete:</p>
        <p className="text-white font-bold text-sm mb-1 truncate px-4">{item.title}</p>
        <p className="text-gray-700 text-[11px] mb-5">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-gray-400 font-bold text-sm hover:text-white hover:bg-[#1a2440] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProjectsManager() {
  const { data: rawProjects, loading, fetchAll, create, update, remove } =
    useFirestoreCrud('projects', { orderByField: 'createdAt', orderDirection: 'desc' });

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [searchQuery,   setSearchQuery]   = useState('');
  const [filterStatus,  setFilterStatus]  = useState('ALL');
  const [viewMode,      setViewMode]      = useState('LIST');
  const [editorState,   setEditorState]   = useState({ isOpen: false, item: null });
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  // ── Enrich raw data ────────────────────────────────────────────────────────
  const projects = useMemo(() => {
    if (!rawProjects) return [];
    return rawProjects.map(p => ({
      ...p,
      derivedStatus: inferProjectStatus(p),
      tags: getProjectTags(p),
      _githubUrl: getGithubLink(p),
      _liveUrl:   getLiveLink(p),
    }));
  }, [rawProjects]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const published = projects.filter(p => p.derivedStatus === 'published').length;
    const draft     = projects.length - published;
    const techCounts = {};
    projects.forEach(p => p.tags.forEach(t => { techCounts[t] = (techCounts[t] || 0) + 1; }));
    const topTech = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t.toUpperCase());
    return { total: projects.length, published, draft, topTech };
  }, [projects]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filterStatus === 'PUBLISHED' && p.derivedStatus !== 'published') return false;
      if (filterStatus === 'DRAFT'     && p.derivedStatus !== 'draft')     return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title?.toLowerCase().includes(q) &&
          !p.description?.toLowerCase().includes(q) &&
          !p.tags.some(t => t.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [projects, filterStatus, searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (id, payload) => {
    if (id) await update(id, payload);
    else    await create(payload);
    await fetchAll();
  }, [update, create, fetchAll]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      await fetchAll();
      toast.success('Project deleted.');
    } catch {
      toast.error('Failed to delete project.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEditor  = useCallback((item = null) => setEditorState({ isOpen: true, item }), []);
  const closeEditor = useCallback(() => setEditorState({ isOpen: false, item: null }), []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && (!rawProjects || rawProjects.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[55vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#14f195]" />
          <span className="text-gray-700 font-mono text-[10px] uppercase tracking-widest">Loading…</span>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1280px] mx-auto pb-16 animate-in fade-in duration-300">

      {/* ══ PAGE HEADER ══ */}
      <div className="mb-7">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <span className="text-[#14f195] font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 block">
              PROJECTS / PORTFOLIO
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
              Project Library
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your engineering projects, source code, technologies, and live demos.
            </p>
          </div>
          <button
            onClick={() => openEditor(null)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#14f195] text-[#090e1a] text-sm font-bold rounded-lg hover:bg-[#10d482] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.1)] shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-[#0b1120] border border-[#1a2440] rounded-xl px-5 py-3.5">
          <Stat value={stats.total} label="Projects" color="text-[#14f195]" />
          <Divider />
          <Stat value={stats.draft} label="Draft" color="text-amber-400" />
          <Divider />
          <Stat value={stats.published} label="Published" color="text-[#14f195]" />
          {stats.topTech.length > 0 && (
            <>
              <Divider className="hidden md:block" />
              <span className="text-gray-700 font-mono text-[10px] uppercase tracking-widest hidden md:block">
                {stats.topTech.join(' • ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ══ TOOLBAR ══ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-[340px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-700" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full h-10 pl-10 pr-9 bg-[#0b1120] border border-[#1a2440] rounded-lg text-sm text-white placeholder:text-gray-700 focus:border-[#14f195]/40 focus:outline-none transition-colors"
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

        <div className="flex items-center justify-between sm:justify-end gap-2.5 ml-auto">
          {/* Status filter */}
          <div className="flex bg-[#0b1120] border border-[#1a2440] rounded-lg p-0.5 gap-0.5">
            {[
              { key: 'ALL',       label: 'All'       },
              { key: 'PUBLISHED', label: 'Published' },
              { key: 'DRAFT',     label: 'Draft'     },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  filterStatus === key
                    ? key === 'PUBLISHED' ? 'bg-[#1a2440] text-[#14f195]'
                    : key === 'DRAFT'     ? 'bg-[#1a2440] text-amber-400'
                    :                       'bg-[#1a2440] text-white'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* View switcher */}
          <div className="flex bg-[#0b1120] border border-[#1a2440] rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('LIST')}
              title="List view"
              className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-[#1a2440] text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              title="Grid view"
              className={`p-2 rounded-md transition-colors ${viewMode === 'GRID' ? 'bg-[#1a2440] text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      {filteredProjects.length === 0 ? (
        /* Empty state */
        <div className="py-16 flex flex-col items-center justify-center bg-[#0b1120] border border-dashed border-[#1a2440] rounded-2xl text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-[#1a2440] flex items-center justify-center mb-4">
            <FolderOpen className="w-6 h-6 text-gray-700" />
          </div>
          {searchQuery || filterStatus !== 'ALL' ? (
            <>
              <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wider">No Projects Found</h3>
              <p className="text-gray-600 text-sm max-w-xs mb-4 leading-relaxed">
                No projects match your search or filters.
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
              <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wider">Project Library is Empty</h3>
              <p className="text-gray-600 text-sm max-w-xs mb-5 leading-relaxed">
                Start building your portfolio by adding your first engineering project.
              </p>
              <button
                onClick={() => openEditor(null)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#14f195] text-[#090e1a] rounded-lg font-bold text-sm hover:bg-[#10d482] transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Project
              </button>
            </>
          )}
        </div>

      ) : viewMode === 'LIST' ? (
        /* ── LIST VIEW ── */
        <div>
          {/* Column headers */}
          <div
            className="hidden lg:grid px-5 pb-2 mb-0.5"
            style={{ gridTemplateColumns: '1fr 100px 190px 64px 80px 68px' }}
          >
            {['PROJECT', 'STATUS', 'TECH STACK', 'LINKS', 'UPDATED', 'ACTIONS'].map(col => (
              <span key={col} className="text-[9px] font-mono text-gray-700 uppercase tracking-[0.14em]">{col}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {filteredProjects.map((project) => {
              const ghUrl   = project._githubUrl;
              const liveUrl = project._liveUrl;
              return (
                <div
                  key={project.id}
                  className="group relative bg-[#0b1120] border border-[#1a2440] hover:border-[#14f195]/20 rounded-xl overflow-hidden transition-colors duration-150 hover:bg-[#0d1628]"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-[#14f195] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div
                    className="flex flex-col lg:grid lg:items-center gap-3 lg:gap-0 p-4 pl-5"
                    style={{ gridTemplateColumns: '1fr 100px 190px 64px 80px 68px' }}
                  >
                    {/* PROJECT */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg border border-[#1a2440] overflow-hidden shrink-0 bg-[#0a0f1c]">
                        {project.image
                          ? <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                          : <ThumbnailPlaceholder size="sm" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-bold text-white leading-snug truncate mb-1">{project.title}</h3>
                        <div className="flex items-center gap-2 mb-1.5 lg:hidden">
                          <StatusBadge status={project.derivedStatus} />
                        </div>
                        <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{project.description || '—'}</p>
                      </div>
                    </div>
                    {/* STATUS */}
                    <div className="hidden lg:flex">
                      <StatusBadge status={project.derivedStatus} />
                    </div>
                    {/* TECH STACK */}
                    <div><TechChips tags={project.tags} maxVisible={3} /></div>
                    {/* LINKS */}
                    <div className="flex items-center gap-2.5">
                      {ghUrl && (
                        <a href={ghUrl} target="_blank" rel="noreferrer"
                          className="text-gray-600 hover:text-white transition-colors"
                          title="GitHub" onClick={e => e.stopPropagation()}>
                          <GitBranch className="w-4 h-4" />
                        </a>
                      )}
                      {liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noreferrer"
                          className="text-gray-600 hover:text-[#14f195] transition-colors"
                          title="Live Demo" onClick={e => e.stopPropagation()}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {/* UPDATED */}
                    <div className="hidden lg:block">
                      <span className="font-mono text-[10px] text-gray-700">
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
                        onClick={() => openEditor(project)}
                        title="Edit"
                        className="p-2 text-gray-600 hover:text-[#14f195] hover:bg-[#14f195]/8 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(project)}
                        title="Delete"
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const ghUrl   = project._githubUrl;
            const liveUrl = project._liveUrl;
            return (
              <div
                key={project.id}
                className="group bg-[#0b1120] border border-[#1a2440] hover:border-[#14f195]/25 rounded-2xl overflow-hidden flex flex-col transition-colors duration-150"
              >
                <div className="relative border-b border-[#1a2440] overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {project.image
                    ? <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    : <ThumbnailPlaceholder size="lg" />
                  }
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={project.derivedStatus} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-[13px] font-bold text-white mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-[12px] text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="mb-3"><TechChips tags={project.tags} maxVisible={4} /></div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#1a2440]">
                    <div className="flex items-center gap-2.5">
                      {ghUrl && (
                        <a href={ghUrl} target="_blank" rel="noreferrer"
                          className="text-gray-600 hover:text-white transition-colors" title="GitHub">
                          <GitBranch className="w-4 h-4" />
                        </a>
                      )}
                      {liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noreferrer"
                          className="text-gray-600 hover:text-[#14f195] transition-colors" title="Live Demo">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEditor(project)}
                        title="Edit"
                        className="p-1.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(project)}
                        title="Delete"
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ OVERLAYS ══ */}
      <EditorDrawer
        isOpen={editorState.isOpen}
        item={editorState.item}
        projectIndex={editorState.item ? projects.findIndex(p => p.id === editorState.item.id) : -1}
        projectCount={projects.length}
        onClose={closeEditor}
        onSave={handleSave}
      />

      <DeleteDialog
        item={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// ── Page-level stat helpers ───────────────────────────────────────────────────
const Stat = ({ value, label, color }) => (
  <div className="flex items-baseline gap-2">
    <span className={`text-2xl font-black leading-none ${color}`}>{value}</span>
    <span className="text-gray-600 font-mono text-[10px] uppercase tracking-widest">{label}</span>
  </div>
);
const Divider = ({ className = '' }) => (
  <div className={`w-px h-5 bg-[#1a2440] ${className}`} />
);
