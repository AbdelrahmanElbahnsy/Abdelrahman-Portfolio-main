import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import {
  Search, Plus, Edit2, Trash2, X, Loader2, ExternalLink,
  Grid, List as ListIcon, Award, AlertTriangle, FolderOpen,
  ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRMATION DIALOG
// ─────────────────────────────────────────────────────────────────────────────
const DeleteDialog = ({ certification, onCancel, onConfirm }) => {
  if (!certification) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030814]/80 animate-in fade-in">
      <div className="bg-[#0f1829] border border-[#1a2440] rounded-2xl w-full max-w-[380px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
        <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <span className="font-mono text-[9px] text-red-500/70 uppercase tracking-[0.2em] mb-2 block">
          DELETE CERTIFICATION
        </span>
        <p className="text-gray-400 text-[13px] leading-relaxed mb-1">Are you sure you want to remove:</p>
        <p className="text-white font-bold text-sm mb-1 px-4 break-words">&ldquo;{certification.title}&rdquo;</p>
        <p className="text-gray-700 text-[11px] mb-5">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-gray-400 font-bold text-sm hover:text-white hover:bg-[#1a2440] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            Delete Certification
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-5 mt-8 first:mt-0">
    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{number} / {title}</span>
    <div className="h-px bg-[#1e293b] flex-grow"></div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
const InputField = ({ label, name, value, onChange, required, placeholder, helper, isMonospace, type = 'text' }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
      <span>{label} {required && <span className="text-[#14f195]">*</span>}</span>
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      className={`w-full px-4 h-[48px] bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors ${isMonospace ? 'font-mono text-sm' : ''}`}
      required={required}
      placeholder={placeholder}
    />
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
const CertificationEditor = ({ isOpen, onClose, certification, onSave, isSaving, nextOrderNumber }) => {
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (certification) {
        const data = { ...certification };
        setFormData(data);
        setInitialData(data);
      } else {
        const empty = { title: '', issuer: '', link: '', icon: '', order: '', date: '' };
        setFormData(empty);
        setInitialData(empty);
      }
    }
  }, [isOpen, certification]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  // Dirty state: check if form differs from initial
  // IMPORTANT: This useMemo MUST be called before any early return
  // to maintain consistent hook call order across renders.
  const isDirty = useMemo(() => {
    const keys = ['title', 'issuer', 'link', 'icon', 'order', 'date'];
    return keys.some(k => (formData[k] || '') !== (initialData[k] || ''));
  }, [formData, initialData]);

  // Determine if date field has a real value to show
  const hasDate = certification && certification.date && String(certification.date).trim() !== '';

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      toast.error('Certificate title is required');
      return;
    }
    if (!formData.issuer || !formData.issuer.trim()) {
      toast.error('Issuing organization is required');
      return;
    }
    onSave(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#030814]/65 backdrop-blur-[1px] transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-[680px] max-h-[90vh] md:max-h-[85vh] bg-[#0d1321] border border-[#1e293b] rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] bg-[#0d1321] shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-1 block">
              {certification ? 'EDIT CERTIFICATION' : 'NEW CERTIFICATION'}
            </span>
            <span className="text-[11px] font-mono text-[#14f195]/60 mb-2 block">
              {certification
                ? `CERTIFICATION ${String(certification.order ?? '').toString().padStart(2, '0')}`
                : `CERTIFICATION ${String(nextOrderNumber ?? 0).toString().padStart(2, '0')}`
              }
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              {certification ? (
                <span className="truncate">{formData.title || certification.title}</span>
              ) : (
                formData.title?.trim() || 'Untitled Certification'
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close editor"
            title="Close editor"
            className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <form id="certification-form" onSubmit={handleSubmit} className="space-y-2">

            <SectionHeader number="01" title="IDENTITY" />
            <div className="space-y-5">
              <InputField
                label="CERTIFICATION TITLE"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. CCNA (Routing & Switching)"
              />
              <InputField
                label="ISSUER / INSTRUCTOR"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                required
                placeholder="e.g. Instructor: Name or Organization"
              />
            </div>

            <SectionHeader number="02" title="CREDENTIAL DETAILS" />
            <div className="space-y-5">
              <InputField
                label="CREDENTIAL URL"
                name="link"
                value={formData.link}
                onChange={handleChange}
                type="url"
                placeholder="https://drive.google.com/..."
                helper="Link to the certificate document or verification page."
              />
              <InputField
                label="ICON CLASS"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                isMonospace
                placeholder="e.g. fas fa-network-wired"
                helper="FontAwesome class or 'SiMicrosoftazure' for React Icons. Use the exact value from the original source."
              />
            </div>

            <SectionHeader number="03" title="DISPLAY" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="DISPLAY ORDER"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  type="number"
                  isMonospace
                  placeholder="0"
                  helper="Controls position in the public carousel."
                />
                {/* Only show Date field if editing an existing cert that already has a date value,
                    or when creating new (empty, user can optionally fill) */}
                {(hasDate || !certification) && (
                  <InputField
                    label="ISSUE DATE"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="e.g. 2024-01"
                    helper="Optional. Only fill if you have a real date."
                  />
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1e293b] bg-[#0d1321] shrink-0 flex items-center justify-end gap-3 rounded-b-[20px]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:bg-[#1e293b] hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="certification-form"
            disabled={isSaving || (certification && !isDirty)}
            className="bg-[#14f195] text-[#0a0f1c] px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : certification ? (
              'Save Changes'
            ) : (
              'Publish Certification'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATION CARD (Grid View)
// ─────────────────────────────────────────────────────────────────────────────
const CertificationCard = ({ certification, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const hasLink = certification.link && String(certification.link).trim().length > 0;
  const orderDisplay = certification.order !== undefined && certification.order !== null && certification.order !== ''
    ? String(certification.order).padStart(2, '0')
    : '—';

  return (
    <div className="bg-[#0f172a] rounded-[16px] border border-[#1e293b] p-6 shadow-sm hover:shadow-xl hover:border-[#334155] transition-all duration-300 flex flex-col h-full group relative overflow-hidden hover:-translate-y-0.5">

      {/* Order badge */}
      <div className="mb-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#14f195]/80">
          {orderDisplay} / CERT
        </span>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight leading-snug break-words">
            {certification.title || 'Untitled Certification'}
          </h3>
          <p className="text-sm text-gray-400 font-medium">
            {certification.issuer || 'Unknown issuer'}
          </p>
        </div>

        {/* Credential link button */}
        {hasLink && (
          <div className="mt-auto mb-4">
            <a
              href={certification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] font-bold text-[#14f195]/80 hover:text-[#14f195] uppercase tracking-wider transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View Credential
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Icon class indicator */}
        {certification.icon && (
          <div className="mb-2">
            <span className="text-[10px] font-mono text-gray-600 bg-[#1e293b]/50 px-2 py-1 rounded border border-[#1e293b]">
              {certification.icon}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 mt-auto border-t border-[#1e293b] flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move Up"
            title="Move Up"
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move Down"
            title="Move Down"
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(certification)}
            aria-label="Edit Certification"
            title="Edit Certification"
            className="p-2 text-blue-400/80 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(certification)}
            aria-label="Delete Certification"
            title="Delete Certification"
            className="p-2 text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATION ROW (List View)
// ─────────────────────────────────────────────────────────────────────────────
const CertificationRow = ({ certification, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const hasLink = certification.link && String(certification.link).trim().length > 0;
  const orderDisplay = certification.order !== undefined && certification.order !== null && certification.order !== ''
    ? String(certification.order).padStart(2, '0')
    : '—';

  return (
    <div className="group bg-[#0f172a] border border-[#1e293b] rounded-xl hover:border-[#14f195]/30 transition-all duration-200 relative overflow-hidden">
      {/* Green left accent on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#14f195] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl"></div>

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Order */}
        <span className="text-[11px] font-mono font-bold text-[#14f195]/60 w-8 shrink-0 text-center">
          {orderDisplay}
        </span>

        {/* Title & Issuer */}
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-bold text-white truncate mb-0.5">
            {certification.title || 'Untitled'}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            {certification.issuer || '—'}
          </p>
        </div>

        {/* Credential link */}
        <div className="hidden md:flex items-center w-[180px] shrink-0">
          {hasLink ? (
            <a
              href={certification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-blue-400/70 hover:text-blue-400 truncate flex items-center gap-1.5 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">View Credential</span>
            </a>
          ) : (
            <span className="text-[11px] text-gray-600 font-mono">No link</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMoveUp()}
            disabled={isFirst}
            aria-label="Move Up"
            title="Move Up"
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1e293b] rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveDown()}
            disabled={isLast}
            aria-label="Move Down"
            title="Move Down"
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1e293b] rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-[#1e293b] mx-1"></div>
          <button
            onClick={() => onEdit(certification)}
            aria-label="Edit"
            title="Edit"
            className="p-1.5 text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(certification)}
            aria-label="Delete"
            title="Delete"
            className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CertificationsManager = () => {
  const { data: items, loading, create, update, remove, subscribe } = useFirestoreCrud('certifications', {
    orderByField: 'order',
    orderDirection: 'asc'
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [deletingCert, setDeletingCert] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAddNew = useCallback(() => {
    setEditingCert(null);
    setIsEditorOpen(true);
  }, []);

  const handleEdit = useCallback((cert) => {
    setEditingCert(cert);
    setIsEditorOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((cert) => {
    setDeletingCert(cert);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingCert) return;
    try {
      await remove(deletingCert.id);
      toast.success('Certification deleted');
      setDeletingCert(null);
    } catch (err) {
      toast.error('Failed to delete certification');
    }
  }, [deletingCert, remove]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingCert(null);
  }, []);

  const handleSave = useCallback(async (formData) => {
    setIsSaving(true);
    try {
      // Build payload with only the fields we manage
      const payload = {
        title: formData.title || '',
        issuer: formData.issuer || '',
        link: formData.link || '',
        icon: formData.icon || '',
      };

      // Handle order
      if (formData.order !== '' && formData.order !== undefined && formData.order !== null) {
        payload.order = Number(formData.order);
      } else if (!editingCert) {
        // Auto-assign order for new certs
        let maxOrder = -1;
        if (items && items.length > 0) {
          items.forEach(item => {
            const currentOrder = Number(item.order);
            if (!isNaN(currentOrder) && currentOrder > maxOrder) {
              maxOrder = currentOrder;
            }
          });
        }
        payload.order = maxOrder + 1;
      }

      // Only include date if it has a real non-empty value
      if (formData.date && String(formData.date).trim() !== '') {
        payload.date = formData.date;
      }

      if (editingCert) {
        await update(editingCert.id, payload);
        toast.success('Certification updated');
      } else {
        await create(payload);
        toast.success('Certification added');
      }
      setIsEditorOpen(false);
      setEditingCert(null);
    } catch (err) {
      toast.error(`Error saving certification: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editingCert, items, update, create]);

  const handleMoveUp = useCallback(async (currentIndex) => {
    if (currentIndex <= 0 || !items) return;
    const currentItem = items[currentIndex];
    const prevItem = items[currentIndex - 1];
    try {
      // Swap ONLY the order field between the two items
      const currentOrder = currentItem.order;
      const prevOrder = prevItem.order;
      await Promise.all([
        update(currentItem.id, { order: prevOrder }),
        update(prevItem.id, { order: currentOrder })
      ]);
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
    }
  }, [items, update]);

  const handleMoveDown = useCallback(async (currentIndex) => {
    if (!items || currentIndex >= items.length - 1) return;
    const currentItem = items[currentIndex];
    const nextItem = items[currentIndex + 1];
    try {
      // Swap ONLY the order field between the two items
      const currentOrder = currentItem.order;
      const nextOrder = nextItem.order;
      await Promise.all([
        update(currentItem.id, { order: nextOrder }),
        update(nextItem.id, { order: currentOrder })
      ]);
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
    }
  }, [items, update]);

  // ─── Search filter ───────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(cert => {
      return (
        (cert.title || '').toLowerCase().includes(query) ||
        (cert.issuer || '').toLowerCase().includes(query) ||
        (cert.link || '').toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-12">

      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <span className="text-[#14f195] font-mono text-sm uppercase tracking-widest font-bold mb-2 block">
            Certifications / Credentials
          </span>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            Certification Library
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-6">
            Manage the professional certifications and credentials displayed across the public portfolio.
          </p>

          {/* Dynamic Summary */}
          {!loading && items && (
            <div className="mt-4 bg-[#131b2c] border border-[#1e293b] rounded-[14px] p-5 md:p-6 w-full max-w-lg overflow-hidden">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 block">
                    TOTAL CERTIFICATIONS
                  </span>
                  <div className="text-xl font-bold text-white mt-1">
                    <span className="text-[#14f195] mr-1.5">{items.length}</span>
                    {items.length === 1 ? 'CREDENTIAL' : 'CREDENTIALS'}
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="h-10 w-px bg-[#1e293b]"></div>
                )}
                {items.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 block">
                      WITH CREDENTIAL LINK
                    </span>
                    <div className="text-xl font-bold text-white mt-1">
                      <span className="text-[#14f195] mr-1.5">
                        {items.filter(c => c.link && String(c.link).trim().length > 0).length}
                      </span>
                      VERIFIED
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAddNew}
          className="shrink-0 bg-[#14f195] text-[#0a0f1c] px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#10d482] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.15)]"
        >
          <Plus className="w-5 h-5" />
          Add Certification
        </button>
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex-grow flex items-center bg-[#131b2c] px-4 rounded-xl border border-[#1e293b] max-w-md">
          <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search certifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white outline-none placeholder-gray-500 py-3 text-sm"
          />
          {isSearchActive && (
            <button
              onClick={() => setSearchQuery('')}
              className="ml-2 text-gray-500 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-[#131b2c] rounded-xl border border-[#1e293b] p-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#1e293b] text-[#14f195]' : 'text-gray-500 hover:text-gray-300'}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#1e293b] text-[#14f195]' : 'text-gray-500 hover:text-gray-300'}`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      {loading ? (
        /* Skeleton loaders */
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#131b2c] rounded-2xl border border-[#1e293b] p-6 h-56 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-4 w-16 bg-[#1e293b] rounded mb-6"></div>
                  <div className="h-5 w-3/4 bg-[#1e293b] rounded mb-3"></div>
                  <div className="h-4 w-1/2 bg-[#1e293b] rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-[#1e293b] rounded"></div>
                  <div className="h-6 w-16 bg-[#1e293b] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#131b2c] rounded-xl border border-[#1e293b] p-5 h-16 animate-pulse flex items-center gap-4">
                <div className="h-4 w-8 bg-[#1e293b] rounded"></div>
                <div className="h-4 w-48 bg-[#1e293b] rounded"></div>
                <div className="flex-grow"></div>
                <div className="h-4 w-24 bg-[#1e293b] rounded"></div>
              </div>
            ))}
          </div>
        )
      ) : filteredItems.length === 0 ? (
        /* Empty / No results state */
        <div className="flex flex-col items-center justify-center py-20 bg-[#131b2c] rounded-3xl border border-[#1e293b] text-center px-4">
          <FolderOpen className="w-16 h-16 text-gray-600 mb-6" />
          {isSearchActive ? (
            <>
              <h3 className="text-2xl font-bold text-white mb-2">No certifications found</h3>
              <p className="text-gray-400 mb-8 max-w-md">
                No certifications match your search criteria.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-[#1e293b] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white mb-2">Certification library is empty</h3>
              <p className="text-gray-400 mb-8 max-w-md">
                No certification records are currently available.
              </p>
              <button
                onClick={handleAddNew}
                className="bg-[#1e293b] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-5 h-5" /> Add Certification
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {filteredItems.map((cert, index) => (
            <CertificationCard
              key={cert.id}
              certification={cert}
              isFirst={index === 0 && !isSearchActive}
              isLast={index === filteredItems.length - 1 && !isSearchActive}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onMoveUp={() => handleMoveUp(items.indexOf(cert))}
              onMoveDown={() => handleMoveDown(items.indexOf(cert))}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {/* List header */}
          <div className="hidden md:flex items-center gap-4 px-5 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600">
            <span className="w-8 text-center">#</span>
            <span className="flex-grow">Certification</span>
            <span className="w-[180px]">Credential</span>
            <span className="w-[140px] text-right">Actions</span>
          </div>
          {filteredItems.map((cert, index) => (
            <CertificationRow
              key={cert.id}
              certification={cert}
              isFirst={index === 0 && !isSearchActive}
              isLast={index === filteredItems.length - 1 && !isSearchActive}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onMoveUp={() => handleMoveUp(items.indexOf(cert))}
              onMoveDown={() => handleMoveDown(items.indexOf(cert))}
            />
          ))}
        </div>
      )}

      {/* ═══ EDITOR MODAL ═══ */}
      <CertificationEditor
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setEditingCert(null); }}
        certification={editingCert}
        onSave={handleSave}
        isSaving={isSaving}
        nextOrderNumber={items ? items.length : 0}
      />

      {/* ═══ DELETE DIALOG ═══ */}
      <DeleteDialog
        certification={deletingCert}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default memo(CertificationsManager);
