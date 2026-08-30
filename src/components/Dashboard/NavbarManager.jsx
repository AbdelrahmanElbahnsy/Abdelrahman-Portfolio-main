import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown,
  LayoutGrid, List, X, Navigation as NavIcon, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import ConfirmDeleteDialog from '../../cms/components/ConfirmDeleteDialog';

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mt-8 mb-4 border-b border-[#1e293b] pb-2">
    <span className="text-[10px] font-mono font-bold text-[#14f195]/80 uppercase tracking-widest">{number} /</span>
    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">{title}</h3>
  </div>
);

const InputField = ({ label, name, value, onChange, required, placeholder, helper, isMonospace, type = 'text' }) => (
  <div className="w-full">
    <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">
      {label} {required && <span className="text-[#14f195]">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      className={`w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all ${isMonospace ? 'font-mono text-sm' : ''}`}
      required={required}
      placeholder={placeholder}
    />
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
const NavbarEditor = ({ isOpen, onClose, navItem, onSave, isSaving, nextOrderNumber }) => {
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (navItem) {
        const data = { ...navItem };
        setFormData(data);
        setInitialData(data);
      } else {
        const empty = { label: '', href: '', order: '' };
        setFormData(empty);
        setInitialData(empty);
      }
    }
  }, [isOpen, navItem]);

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
  // MUST BE ABOVE EARLY RETURN TO PREVENT HOOK ERRORS
  const isDirty = useMemo(() => {
    const keys = ['label', 'href', 'order'];
    return keys.some(k => (formData[k] || '') !== (initialData[k] || ''));
  }, [formData, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label || !formData.label.trim()) {
      toast.error('Label is required');
      return;
    }
    if (!formData.href || !formData.href.trim()) {
      toast.error('Destination path/URL is required');
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
              {navItem ? 'EDIT NAVIGATION LINK' : 'NEW NAVIGATION LINK'}
            </span>
            <span className="text-[11px] font-mono text-[#14f195]/60 mb-2 block">
              {navItem
                ? `NAVIGATION ${String(navItem.order ?? '').toString().padStart(2, '0')}`
                : `NAVIGATION ${String(nextOrderNumber ?? 0).toString().padStart(2, '0')}`
              }
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              {navItem ? (
                <span className="truncate">{formData.label || navItem.label}</span>
              ) : (
                formData.label?.trim() || 'Untitled Navigation Link'
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
          <form id="navbar-form" onSubmit={handleSubmit} className="space-y-2">

            <SectionHeader number="01" title="IDENTITY" />
            <div className="space-y-5">
              <InputField
                label="LINK LABEL"
                name="label"
                value={formData.label}
                onChange={handleChange}
                required
                placeholder="e.g. Home, Projects, Contact"
                helper="The display text shown in the navigation bar."
              />
            </div>

            <SectionHeader number="02" title="DESTINATION" />
            <div className="space-y-5">
              <InputField
                label="TARGET HREF"
                name="href"
                value={formData.href}
                onChange={handleChange}
                required
                isMonospace
                placeholder="e.g. #projects or /about"
                helper="The destination anchor ID or URL."
              />
            </div>

            <SectionHeader number="03" title="DISPLAY" />
            <div className="space-y-5">
              <InputField
                label="DISPLAY ORDER"
                name="order"
                value={formData.order}
                onChange={handleChange}
                type="number"
                isMonospace
                placeholder="0"
                helper="Controls the left-to-right (or top-to-bottom) ordering."
              />
            </div>
            
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] bg-[#0d1321] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="navbar-form"
            disabled={isSaving || (!isDirty && !!navItem)}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{navItem ? 'Save Changes' : 'Publish Link'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR CARD (Grid View)
// ─────────────────────────────────────────────────────────────────────────────
const NavbarCard = ({ navItem, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const orderDisplay = navItem.order !== undefined && navItem.order !== null && navItem.order !== ''
    ? String(navItem.order).padStart(2, '0')
    : '—';

  return (
    <div className="bg-[#0f172a] rounded-[16px] border border-[#1e293b] p-6 shadow-sm hover:shadow-xl hover:border-[#334155] transition-all duration-300 flex flex-col h-full group relative overflow-hidden hover:-translate-y-0.5">

      {/* Top Header: Order */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#14f195]/80">
          {orderDisplay} / NAV
        </span>
        <div className="w-8 h-8 rounded-full bg-[#1e293b]/50 border border-[#1e293b] flex items-center justify-center text-gray-400">
          <Link2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white tracking-tight leading-snug break-words">
            {navItem.label || 'Untitled Link'}
          </h3>
        </div>

        {/* Technical Target class indicator */}
        <div className="mb-4">
          <span className="text-[11px] font-mono text-gray-400 bg-[#1e293b]/50 px-2.5 py-1.5 rounded border border-[#1e293b] truncate inline-block max-w-full">
            Target: <span className="text-white">{navItem.href || '—'}</span>
          </span>
        </div>
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
            onClick={() => onEdit(navItem)}
            aria-label="Edit Link"
            title="Edit Link"
            className="p-2 text-blue-400/80 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(navItem)}
            aria-label="Delete Link"
            title="Delete Link"
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
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const NavbarManager = () => {
  const { data: items, loading, create, update, remove, subscribe } = useFirestoreCrud('navbarItems', {
    orderByField: 'order',
    orderDirection: 'asc'
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deletingItem, setDeletingItem] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setIsEditorOpen(true);
  }, []);

  const handleEdit = useCallback((navItem) => {
    setEditingItem(navItem);
    setIsEditorOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((navItem) => {
    setDeletingItem(navItem);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await remove(deletingItem.id);
      toast.success('Navigation link deleted');
      setDeletingItem(null);
    } catch (err) {
      toast.error('Failed to delete link');
    }
  }, [deletingItem, remove]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingItem(null);
  }, []);

  const handleSave = useCallback(async (formData) => {
    setIsSaving(true);
    try {
      // Build payload matching exact schema
      const payload = {
        label: formData.label || '',
        href: formData.href || '',
      };

      // Handle order
      if (formData.order !== '' && formData.order !== undefined && formData.order !== null) {
        payload.order = Number(formData.order);
      } else if (!editingItem) {
        // Auto-assign order for new socials
        let maxOrder = 0;
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

      if (editingItem) {
        await update(editingItem.id, payload);
        toast.success('Navigation link updated');
      } else {
        await create(payload);
        toast.success('Navigation link added');
      }
      setIsEditorOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(`Error saving link: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editingItem, items, update, create]);

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
    return items.filter(item => {
      return (
        (item.label || '').toLowerCase().includes(query) ||
        (item.href || '').toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  // ─── Metrics ─────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (!items) return { total: 0, active: 0, highestOrder: 0 };
    const active = items.filter(s => s.href && s.href.trim() !== '').length;
    let highestOrder = 0;
    items.forEach(item => {
      if (typeof item.order === 'number' && item.order > highestOrder) {
        highestOrder = item.order;
      }
    });
    return {
      total: items.length,
      active,
      highestOrder
    };
  }, [items]);

  // ─── Loading State ───────────────────────────────────────────────────────
  if (loading && !items) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14f195]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#14f195]/10 flex items-center justify-center border border-[#14f195]/20">
              <NavIcon className="w-4 h-4 text-[#14f195]" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#14f195]">
              NAVIGATION / SITE STRUCTURE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Navigation Management Center
          </h1>
          <p className="text-gray-400 max-w-xl leading-relaxed text-sm">
            Control the main site structure and layout menu items dynamically across the public portfolio.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleAddNew}
            className="w-full md:w-auto px-6 py-3 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,241,149,0.2)] hover:shadow-[0_0_30px_rgba(20,241,149,0.3)] hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add Navigation Link</span>
          </button>
        </div>
      </div>

      {/* ═══ SUMMARY BAR ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0d1321] border border-[#1e293b] rounded-2xl p-5">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-2">Total Links</span>
          <span className="text-2xl font-bold text-white">{metrics.total.toString().padStart(2, '0')}</span>
        </div>
        <div className="bg-[#0d1321] border border-[#1e293b] rounded-2xl p-5">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-2">Active Targets</span>
          <span className="text-2xl font-bold text-[#14f195]">{metrics.active.toString().padStart(2, '0')}</span>
        </div>
        <div className="bg-[#0d1321] border border-[#1e293b] rounded-2xl p-5">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-2">Highest Order</span>
          <span className="text-2xl font-bold text-blue-400">{metrics.highestOrder.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="bg-[#0d1321] border border-[#1e293b] rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-grow max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#14f195] transition-colors" />
          <input
            type="text"
            placeholder="Search navigation links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030814] border border-[#1e293b] rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 px-2">
          <div className="bg-[#030814] border border-[#1e293b] rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-[#1e293b] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-[#1e293b] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      {!items || items.length === 0 ? (
        <div className="border border-dashed border-[#1e293b] rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-[#0d1321]/50 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-4">
            <NavIcon className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Navigation Library Is Empty</h3>
          <p className="text-gray-400 mb-6 max-w-sm">No site navigation links are currently configured. Add your first link to structure your portfolio.</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-bold rounded-xl transition-colors border border-[#334155]"
          >
            + Add Navigation Link
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-[#1e293b] rounded-2xl p-12 text-center bg-[#0d1321]">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Navigation Links Found</h3>
          <p className="text-gray-400 mb-6">No links matched your search "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-bold rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((navItem, idx) => (
            <NavbarCard
              key={navItem.id}
              navItem={navItem}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0d1321] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0f172a]">
                  <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest w-16 text-center">Ord</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Label</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Target</th>
                  <th className="p-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filteredItems.map((navItem, idx) => (
                  <tr key={navItem.id} className="hover:bg-[#1e293b]/30 transition-colors group">
                    <td className="p-4 text-center">
                      <span className="text-xs font-mono text-gray-500">
                        {navItem.order !== undefined && navItem.order !== null && navItem.order !== '' 
                          ? String(navItem.order).padStart(2, '0') 
                          : '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white whitespace-nowrap">{navItem.label || 'Untitled'}</span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[200px] lg:max-w-[300px] truncate">
                        {navItem.href ? (
                          <span className="text-xs font-mono text-gray-400 truncate">
                            {navItem.href}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 italic">No Target</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1.5 text-gray-400 hover:text-white rounded disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === items.length - 1}
                          className="p-1.5 text-gray-400 hover:text-white rounded disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-[#1e293b] mx-1"></div>
                        <button
                          onClick={() => handleEdit(navItem)}
                          className="p-1.5 text-blue-400/80 hover:text-blue-400 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(navItem)}
                          className="p-1.5 text-red-400/80 hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ EDITOR MODAL ═══ */}
      <NavbarEditor
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setEditingItem(null); }}
        navItem={editingItem}
        onSave={handleSave}
        isSaving={isSaving}
        nextOrderNumber={items ? items.length + 1 : 1}
      />

      {/* ═══ DELETE DIALOG ═══ */}
      <ConfirmDeleteDialog
        isOpen={!!deletingItem}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Navigation Link"
        itemName={deletingItem?.label || 'this link'}
        warningMessage="This action cannot be undone. It will remove the navigation link from the portfolio layout."
      />
    </div>
  );
};

export default NavbarManager;
