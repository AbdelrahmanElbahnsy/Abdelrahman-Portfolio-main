import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { Search, Grid, List as ListIcon, Plus, Edit2, Trash2, X, Loader2, Check, AlertTriangle, LayoutGrid, Server, Code, Settings, Cloud, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  'Cloud Platform': 'text-blue-400',
  'DevOps': 'text-green-400',
  'Containers': 'text-purple-400',
  'Networking': 'text-amber-400',
  'Automation': 'text-[#14f195]',
  'default': 'text-gray-400'
};

const CATEGORY_ICONS = {
  'Cloud Platform': Cloud,
  'DevOps': Settings,
  'Containers': LayoutGrid,
  'Networking': Server,
  'Automation': Code,
  'default': Database
};

const DeleteDialog = ({ item, onCancel, onConfirm }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030814]/80 animate-in fade-in">
      <div className="bg-[#0f1829] border border-[#1a2440] rounded-2xl w-full max-w-[340px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
        <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <span className="font-mono text-[9px] text-red-500/70 uppercase tracking-[0.2em] mb-2 block">
          DELETE SKILL?
        </span>
        <p className="text-gray-400 text-[13px] leading-relaxed mb-1">Permanently delete:</p>
        <p className="text-white font-bold text-sm mb-1 truncate px-4">{item.name}</p>
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

const EditorDrawer = ({ isOpen, item, skillCount, onClose, onSave }) => {
  if (!isOpen) return null;

  const isEditing = !!item;
  const initialData = item || {};

  const [name, setName] = useState(initialData.name || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [categoryIcon, setCategoryIcon] = useState(initialData.categoryIcon || '');
  const [percent, setPercent] = useState(initialData.percent ?? 0);
  const [isCircular, setIsCircular] = useState(initialData.isCircular || false);
  const [circularSub, setCircularSub] = useState(initialData.circularSub || '');
  const [order, setOrder] = useState(initialData.order ?? (skillCount + 1));
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isDirty = useMemo(() => {
    if (!isEditing) {
      return !!(name || category || categoryIcon || percent > 0 || isCircular || circularSub);
    }
    return (
      name !== (initialData.name || '') ||
      category !== (initialData.category || '') ||
      categoryIcon !== (initialData.categoryIcon || '') ||
      Number(percent) !== Number(initialData.percent || 0) ||
      isCircular !== (initialData.isCircular || false) ||
      circularSub !== (initialData.circularSub || '') ||
      Number(order) !== Number(initialData.order || 0)
    );
  }, [isEditing, name, category, categoryIcon, percent, isCircular, circularSub, order, initialData]);

  const handleSave = async () => {
    if (!name.trim() || !category.trim()) {
      toast.error('Name and Category are required.');
      return;
    }
    if (percent < 0 || percent > 100) {
      toast.error('Proficiency must be between 0 and 100.');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim(),
        categoryIcon: categoryIcon.trim(),
        percent: Number(percent),
        isCircular: Boolean(isCircular),
        circularSub: circularSub.trim(),
        order: Number(order)
      };

      await onSave(isEditing ? initialData.id : null, payload);
      setIsSuccess(true);
      toast.success(isEditing ? 'Skill updated.' : 'Skill created.');
      setTimeout(() => { onClose(); setIsSuccess(false); }, 900);
    } catch {
      toast.error('Failed to save skill.');
      setIsSaving(false);
    }
  };

  const iCls = "w-full h-11 bg-[#090e17] border border-[#1e2d42] rounded-lg px-3 text-[13px] text-white placeholder:text-[#4b6385] focus:border-[#14f195] focus:ring-1 focus:ring-[#14f195] outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-[#030712]/70" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full sm:w-[560px] md:w-[620px] h-full flex flex-col bg-[#050914] border-l border-[#1e2d42] shadow-2xl overflow-hidden" style={{ animation: 'drawerSlideIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1e2d42] bg-[#050914]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[#14f195] font-mono text-[10px] uppercase font-bold tracking-wider">
                  {isEditing ? '[ EDIT SKILL ]' : '[ NEW SKILL ]'}
                </span>
                <span className="text-[#4b6385] font-mono text-[10px] uppercase tracking-wider">
                  SKILL {String(isEditing ? initialData.order || '00' : skillCount + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-white font-semibold text-lg leading-tight truncate">
                {name || (isEditing ? (initialData.name || 'Untitled') : 'Untitled Skill')}
              </h2>
            </div>
            <button onClick={() => !isSaving && onClose()} disabled={isSaving} className="w-8 h-8 flex items-center justify-center rounded-md transition-all hover:bg-[#1e2d42] text-[#8b9bb4] hover:text-white disabled:opacity-30">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto project-editor-scrollbar">
          <div className="px-6 py-6 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] font-bold text-[#14f195]">01 /</span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8b9bb4]">IDENTITY</span>
                <span className="flex-1 h-[1px] bg-[#1e2d42]" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Skill Name <span className="text-[#14f195]">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VM & VNet" className={iCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Category <span className="text-[#14f195]">*</span></label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Cloud Platform" className={iCls} />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] font-bold text-[#14f195]">02 /</span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8b9bb4]">PROFICIENCY</span>
                <span className="flex-1 h-[1px] bg-[#1e2d42]" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Proficiency (%)</label>
                  <div className="flex items-center gap-4">
                    <input type="number" min="0" max="100" value={percent} onChange={e => setPercent(e.target.value)} className={`${iCls} w-24 text-center font-mono`} />
                    <div className="flex-1 h-2 bg-[#090e17] rounded-full border border-[#1e2d42] overflow-hidden">
                      <div className="h-full bg-[#14f195] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, percent || 0))}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] font-bold text-[#14f195]">03 /</span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8b9bb4]">PRESENTATION</span>
                <span className="flex-1 h-[1px] bg-[#1e2d42]" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Icon Name (React Icons / FontAwesome)</label>
                  <input type="text" value={categoryIcon} onChange={e => setCategoryIcon(e.target.value)} placeholder="e.g. SiMicrosoftazure or fas fa-server" className={iCls} />
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer text-white">
                    <input type="checkbox" checked={isCircular} onChange={(e) => setIsCircular(e.target.checked)} className="w-4 h-4 rounded border-[#1e2d42] bg-[#090e17] text-[#14f195]" />
                    <span className="text-[12px] font-semibold text-[#8b9bb4]">Show in Top Circular Section?</span>
                  </label>
                </div>
                {isCircular && (
                  <div className="mt-4">
                    <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Circular Subtitle</label>
                    <input type="text" value={circularSub} onChange={e => setCircularSub(e.target.value)} placeholder="Subtitle displayed below the circular skill" className={iCls} />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Display Order</label>
                  <input type="number" value={order} onChange={e => setOrder(e.target.value)} className={`${iCls} w-32`} />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] font-bold text-[#14f195]">04 /</span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8b9bb4]">LIVE PREVIEW</span>
                <span className="flex-1 h-[1px] bg-[#1e2d42]" />
              </div>
              
              <div className="w-full bg-[#080d19] border border-[#1e2d42] rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#4b6385]">{category || 'Category'}</span>
                    <h3 className="text-white font-bold text-[15px] mt-0.5">{name || 'Skill Name'}</h3>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-[#0b1320] border border-[#1e2d42] flex items-center justify-center text-[#14f195]">
                     <LayoutGrid className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8b9bb4]">PROFICIENCY</span>
                  <span className="text-[10px] font-mono font-bold text-[#14f195]">{percent || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0b1320] rounded-full overflow-hidden">
                  <div className="h-full bg-[#14f195] rounded-full" style={{ width: `${Math.min(100, Math.max(0, percent || 0))}%` }} />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-[#1e2d42] bg-[#050914]">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: isDirty ? '#f59e0b' : '#4b6385' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isDirty ? '#f59e0b' : '#4b6385' }} />
            {isDirty ? 'UNSAVED CHANGES' : 'ALL CHANGES SAVED'}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-md text-[12px] font-semibold text-[#8b9bb4] hover:text-white hover:bg-[#1e2d42] transition-colors disabled:opacity-30">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!isDirty || isSaving} className="px-4 py-2 rounded-md text-[12px] font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={isSuccess ? { color: '#050914', background: '#14f195' } : isDirty ? { color: '#050914', background: '#14f195', boxShadow: '0 0 15px rgba(20,241,149,0.3)' } : { color: '#8b9bb4', background: '#1e2d42' }}>
              {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving</> : isSuccess ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

export default function SkillsManager() {
  const { data: rawSkills, loading, fetchAll, create, update, remove } = useFirestoreCrud('skills', { orderByField: 'order', orderDirection: 'asc' });

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID');
  const [editorState, setEditorState] = useState({ isOpen: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = useMemo(() => {
    if (!rawSkills) return [];
    const cats = rawSkills.map(s => s.category).filter(Boolean);
    return [...new Set(cats)];
  }, [rawSkills]);

  const stats = useMemo(() => {
    if (!rawSkills) return { total: 0, byCat: {} };
    const byCat = {};
    rawSkills.forEach(s => {
      if (s.category) {
         byCat[s.category] = (byCat[s.category] || 0) + 1;
      }
    });
    return { total: rawSkills.length, byCat };
  }, [rawSkills]);

  const filteredSkills = useMemo(() => {
    if (!rawSkills) return [];
    return rawSkills.filter(s => {
      if (filterCategory !== 'ALL' && s.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.name?.toLowerCase().includes(q) && !s.category?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rawSkills, filterCategory, searchQuery]);

  const handleSave = useCallback(async (id, payload) => {
    if (id) await update(id, payload);
    else await create(payload);
    await fetchAll();
  }, [update, create, fetchAll]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      await fetchAll();
      toast.success('Skill deleted.');
    } catch {
      toast.error('Failed to delete skill.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEditor = useCallback((item = null) => setEditorState({ isOpen: true, item }), []);
  const closeEditor = useCallback(() => setEditorState({ isOpen: false, item: null }), []);

  if (loading && (!rawSkills || rawSkills.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[55vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#14f195]" />
          <span className="text-gray-700 font-mono text-[10px] uppercase tracking-widest">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto pb-16 animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <span className="text-[#14f195] font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 block">
              SKILLS / TECHNOLOGY
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
              Skills & Tools
            </h1>
            <p className="text-gray-600 text-sm">
              Manage the technologies, platforms, tools, and engineering capabilities displayed across your portfolio.
            </p>
          </div>
          <button onClick={() => openEditor(null)} className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#14f195] text-[#090e1a] text-sm font-bold rounded-lg hover:bg-[#10d482] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.1)] shrink-0">
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-[#0b1120] border border-[#1a2440] rounded-xl px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{stats.total}</span>
            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">SKILLS</span>
          </div>
          {Object.entries(stats.byCat).map(([cat, count], idx) => (
            <React.Fragment key={cat}>
              <div className="w-px h-4 bg-[#1a2440]" />
              <div className="flex items-center gap-2">
                <span className="text-[#14f195] font-bold">{count}</span>
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">{cat}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1 sm:max-w-[340px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-700" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search skills..." className="w-full h-10 pl-10 pr-9 bg-[#0b1120] border border-[#1a2440] rounded-lg text-sm text-white placeholder:text-gray-700 focus:border-[#14f195]/40 focus:outline-none transition-colors" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 ml-auto">
          <div className="flex flex-wrap bg-[#0b1120] border border-[#1a2440] rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setFilterCategory('ALL')} className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${filterCategory === 'ALL' ? 'bg-[#1e293b] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              ALL
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-[#1e293b] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-[#0b1120] border border-[#1a2440] rounded-lg p-0.5">
            <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:text-gray-300'}`}>
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-md transition-colors ${viewMode === 'GRID' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:text-gray-300'}`}>
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#0b1120] border border-[#1a2440] rounded-xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-[#1e293b]/50 flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-gray-500" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mb-1">NO SKILLS FOUND</span>
          <p className="text-gray-400 text-sm mb-4">Try another search or clear the filters.</p>
          <button onClick={() => {setSearchQuery(''); setFilterCategory('ALL');}} className="text-[#14f195] text-sm hover:underline">Clear Filters</button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => {
            const Icon = CATEGORY_ICONS[skill.category] || CATEGORY_ICONS['default'];
            const accentColor = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS['default'];
            return (
              <div key={skill.id} className="group relative flex flex-col bg-[#0b1120] border border-[#1a2440] rounded-xl p-5 hover:border-[#14f195]/30 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#14f195] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`font-mono text-[9px] uppercase tracking-widest mb-1 block ${accentColor}`}>
                      {skill.category || 'Uncategorized'}
                    </span>
                    <h3 className="text-white font-bold text-[15px] truncate max-w-[180px]">{skill.name}</h3>
                  </div>
                  <div className={`w-8 h-8 rounded-md bg-[#050914] border border-[#1a2440] flex items-center justify-center ${accentColor}`}>
                     <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8b9bb4]">PROFICIENCY</span>
                    <span className="text-[10px] font-mono font-bold text-white">{skill.percent || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#050914] rounded-full border border-[#1a2440] overflow-hidden mb-5">
                    <div className="h-full bg-gradient-to-r from-gray-700 to-white group-hover:to-[#14f195] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, skill.percent || 0))}%` }} />
                  </div>
                  <div className="pt-4 border-t border-[#1a2440] flex justify-between items-center">
                    <span className="text-[9px] font-mono text-gray-600">ORDER: {skill.order}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditor(skill)} className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-semibold">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <span className="text-[#1a2440]">|</span>
                      <button onClick={() => setDeleteTarget(skill)} className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5 text-[11px] font-semibold">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0b1120] border border-[#1a2440] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a2440] bg-[#050914]">
                <th className="py-3 px-5 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">SKILL</th>
                <th className="py-3 px-5 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">CATEGORY</th>
                <th className="py-3 px-5 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">PROFICIENCY</th>
                <th className="py-3 px-5 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill, i) => (
                <tr key={skill.id} className="border-b border-[#1a2440]/50 hover:bg-[#1a2440]/20 transition-colors group">
                  <td className="py-3 px-5">
                    <span className="text-sm font-bold text-white group-hover:text-[#14f195] transition-colors">{skill.name}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{skill.category}</span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3 w-32">
                      <span className="text-[11px] font-mono font-bold text-white w-8">{skill.percent}%</span>
                      <div className="flex-1 h-1.5 bg-[#050914] rounded-full overflow-hidden">
                        <div className="h-full bg-[#14f195] rounded-full" style={{ width: `${Math.min(100, Math.max(0, skill.percent || 0))}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditor(skill)} className="text-gray-500 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(skill)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditorDrawer isOpen={editorState.isOpen} item={editorState.item} skillCount={rawSkills?.length || 0} onClose={closeEditor} onSave={handleSave} />
      <DeleteDialog item={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
    </div>
  );
}
