import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { Search, Plus, Edit2, Trash2, X, Loader2, Check, AlertTriangle, LayoutGrid, Server, Code, Settings, Cloud, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  'Cloud Platform': 'text-blue-400',
  'DevOps & CI/CD': 'text-green-400',
  'Containers & Orchestration': 'text-purple-400',
  'Infrastructure as Code': 'text-cyan-400',
  'Networking': 'text-amber-400',
  'Programming & Scripting': 'text-yellow-400',
  'Operating Systems': 'text-orange-400',
  'Monitoring & Observability': 'text-pink-400',
  'default': 'text-gray-400'
};

const CATEGORY_ICONS = {
  'Cloud Platform': Cloud,
  'DevOps & CI/CD': Settings,
  'Containers & Orchestration': LayoutGrid,
  'Infrastructure as Code': Code,
  'Networking': Server,
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

const EditorDrawer = ({ isOpen, item, initialCategory, initialIsCircular, availableCategories, skillCount, onClose, onSave }) => {
  if (!isOpen) return null;

  const isEditing = !!item;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [percent, setPercent] = useState(0);
  const [isCircular, setIsCircular] = useState(false);
  const [circularSub, setCircularSub] = useState('');
  const [order, setOrder] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name || '');
        setCategory(item.category || '');
        setCategoryIcon(item.categoryIcon || '');
        setPercent(item.percent ?? 0);
        setIsCircular(item.isCircular || false);
        setCircularSub(item.circularSub || '');
        setOrder(item.order ?? 0);
        setShowNewCategory(false);
      } else {
        setName('');
        setCategory(initialCategory || '');
        setCategoryIcon('');
        setPercent(0);
        setIsCircular(initialIsCircular || false);
        setCircularSub('');
        setOrder(skillCount + 1);
        setShowNewCategory(!initialCategory);
      }
      setIsSaving(false);
      setIsSuccess(false);
    }
  }, [isOpen, item, initialCategory, initialIsCircular, skillCount]);

  const isDirty = useMemo(() => {
    if (!isEditing) {
      return !!(name || category || categoryIcon || percent > 0 || isCircular || circularSub);
    }
    return (
      name !== (item.name || '') ||
      category !== (item.category || '') ||
      categoryIcon !== (item.categoryIcon || '') ||
      Number(percent) !== Number(item.percent || 0) ||
      isCircular !== (item.isCircular || false) ||
      circularSub !== (item.circularSub || '') ||
      Number(order) !== Number(item.order || 0)
    );
  }, [isEditing, item, name, category, categoryIcon, percent, isCircular, circularSub, order]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Skill Name is required.');
      return;
    }
    if (!isCircular && !category.trim()) {
      toast.error('Category is required for standard skills.');
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

      await onSave(isEditing ? item.id : null, payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-[#030814]/70" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[780px] max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#050914] border border-[#1e2d42] rounded-2xl shadow-2xl overflow-hidden" style={{ animation: 'modalZoomIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1e2d42] bg-[#050914]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[#14f195] font-mono text-[10px] uppercase font-bold tracking-wider">
                  {isEditing ? '[ EDIT SKILL ]' : '[ NEW SKILL ]'}
                </span>
                <span className="text-[#4b6385] font-mono text-[10px] uppercase tracking-wider">
                  SKILL {String(isEditing ? item.order || '00' : skillCount + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-white font-semibold text-lg leading-tight truncate">
                {name || (isEditing ? (item.name || 'Untitled') : 'Untitled Skill')}
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
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Skill Name <span className="text-[#14f195]">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VM & VNet" className={iCls} />
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-2.5">Placement</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors cursor-pointer ${isCircular ? 'border-[#14f195] bg-[#14f195]/5' : 'border-[#1e2d42] bg-[#090e17] hover:border-gray-500'}`}>
                      <input type="radio" name="placement" checked={isCircular} onChange={() => setIsCircular(true)} className="hidden" />
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${isCircular ? 'border-[#14f195]' : 'border-gray-500'}`}>
                        {isCircular && <div className="w-1.5 h-1.5 rounded-full bg-[#14f195]" />}
                      </div>
                      <span className={`text-[12px] font-bold ${isCircular ? 'text-[#14f195]' : 'text-gray-400'}`}>TOP CIRCULAR</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors cursor-pointer ${!isCircular ? 'border-[#14f195] bg-[#14f195]/5' : 'border-[#1e2d42] bg-[#090e17] hover:border-gray-500'}`}>
                      <input type="radio" name="placement" checked={!isCircular} onChange={() => setIsCircular(false)} className="hidden" />
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${!isCircular ? 'border-[#14f195]' : 'border-gray-500'}`}>
                        {!isCircular && <div className="w-1.5 h-1.5 rounded-full bg-[#14f195]" />}
                      </div>
                      <span className={`text-[12px] font-bold ${!isCircular ? 'text-[#14f195]' : 'text-gray-400'}`}>CATEGORY</span>
                    </label>
                  </div>
                </div>

                {!isCircular ? (
                  <div>
                    <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Category <span className="text-[#14f195]">*</span></label>
                    {!showNewCategory ? (
                      <div className="flex gap-2">
                        <select value={category} onChange={e => {
                          if (e.target.value === 'ADD_NEW') {
                            setShowNewCategory(true);
                            setCategory('');
                          } else {
                            setCategory(e.target.value);
                          }
                        }} className={`${iCls} appearance-none cursor-pointer`}>
                          <option value="" disabled>Select a Category...</option>
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="ADD_NEW">+ Create New Category</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Cloud Platform" className={iCls} />
                        <button onClick={() => setShowNewCategory(false)} className="px-4 bg-[#1e2d42] text-white rounded-lg text-xs font-bold hover:bg-gray-600">Back</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b9bb4] mb-1.5">Circular Subtitle</label>
                    <input type="text" value={circularSub} onChange={e => setCircularSub(e.target.value)} placeholder="e.g. Azure Expert" className={iCls} />
                  </div>
                )}
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={percent} 
                      onChange={e => setPercent(e.target.value)} 
                      className="flex-1 h-2 bg-[#090e17] rounded-full appearance-none accent-[#14f195] cursor-pointer" 
                    />
                    <div className="flex items-center gap-3 w-28 shrink-0">
                      <input type="number" min="0" max="100" value={percent} onChange={e => setPercent(e.target.value)} className={`${iCls} text-center font-mono`} />
                      <span className="text-gray-400 font-bold">%</span>
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
              
              <div className="w-full max-w-[340px] bg-[#080d19] border border-[#1e2d42] rounded-xl p-5 mx-auto">
                {isCircular ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-[#14f195] flex items-center justify-center text-[#14f195] mb-3">
                      <span className="font-mono text-[10px]">{percent}%</span>
                    </div>
                    <h3 className="text-white font-bold text-[14px]">{name || 'Skill Name'}</h3>
                    <span className="text-[#8b9bb4] text-[11px]">{circularSub || 'Circular Subtitle'}</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
      <style>{`@keyframes modalZoomIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
};

export default function SkillsManager() {
  const { data: rawSkills, loading, fetchAll, create, update, remove } = useFirestoreCrud('skills', { orderByField: 'order', orderDirection: 'asc' });

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editorState, setEditorState] = useState({ isOpen: false, item: null, initialCategory: '', initialIsCircular: false });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const availableCategories = useMemo(() => {
    if (!rawSkills) return [];
    const cats = rawSkills.filter(s => !s.isCircular).map(s => s.category).filter(Boolean);
    return [...new Set(cats)];
  }, [rawSkills]);

  const stats = useMemo(() => {
    if (!rawSkills) return { total: 0, circularCount: 0, catCount: 0 };
    let circ = 0;
    const cats = new Set();
    rawSkills.forEach(s => {
      if (s.isCircular) circ++;
      else if (s.category) cats.add(s.category);
    });
    return { total: rawSkills.length, circularCount: circ, catCount: cats.size };
  }, [rawSkills]);

  const groupedSkills = useMemo(() => {
    if (!rawSkills) return { circular: [], categories: [] };

    // 1. Filter by search
    const filtered = rawSkills.filter(s => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.name?.toLowerCase().includes(q) && !s.category?.toLowerCase().includes(q) && !s.circularSub?.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // 2. Group
    const circular = [];
    const catMap = new Map();

    filtered.forEach(skill => {
      if (skill.isCircular) {
        circular.push(skill);
      } else {
        const cat = skill.category || 'Uncategorized';
        if (!catMap.has(cat)) {
          catMap.set(cat, []);
        }
        catMap.get(cat).push(skill);
      }
    });

    circular.sort((a, b) => (a.order || 0) - (b.order || 0));

    const categories = Array.from(catMap.entries()).map(([title, skills]) => {
      skills.sort((a, b) => (a.order || 0) - (b.order || 0));
      return { title, skills };
    });

    categories.sort((a, b) => {
      const minA = a.skills.length > 0 ? a.skills[0].order : 0;
      const minB = b.skills.length > 0 ? b.skills[0].order : 0;
      return minA - minB;
    });

    return { circular, categories };
  }, [rawSkills, searchQuery]);

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

  const openEditor = useCallback((item = null, initialCategory = '', initialIsCircular = false) => {
    setEditorState({ isOpen: true, item, initialCategory, initialIsCircular });
  }, []);

  const closeEditor = useCallback(() => setEditorState({ isOpen: false, item: null, initialCategory: '', initialIsCircular: false }), []);

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

  const SkillCard = ({ skill }) => {
    const Icon = CATEGORY_ICONS[skill.category] || CATEGORY_ICONS['default'];
    const accentColor = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS['default'];
    
    return (
      <div className="group relative flex flex-col bg-[#0b1120] border border-[#1a2440] rounded-xl p-5 hover:border-[#14f195]/40 transition-all hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#14f195] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />
        <div className="flex items-start justify-between mb-4">
          <div>
            {skill.isCircular ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] mb-1 block text-[#14f195]">
                CIRCULAR
              </span>
            ) : (
              <span className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-1 block ${accentColor}`}>
                {skill.category || 'Uncategorized'}
              </span>
            )}
            <h3 className="text-white font-bold text-[15px] truncate max-w-[180px]">{skill.name}</h3>
            {skill.isCircular && skill.circularSub && (
              <span className="text-gray-500 text-[11px] block mt-1">{skill.circularSub}</span>
            )}
          </div>
          <div className={`w-8 h-8 rounded-md bg-[#050914] border border-[#1a2440] flex items-center justify-center ${skill.isCircular ? 'text-[#14f195]' : accentColor}`}>
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
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 pb-20 animate-in fade-in duration-300">
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <span className="text-[#14f195] font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 block">
              SKILLS / ENGINEERING CAPABILITIES
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
              Skills Library
            </h1>
            <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
              Manage technical capabilities, proficiency levels, categories, and portfolio presentation.
            </p>
          </div>
          <button onClick={() => openEditor(null)} className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-[#14f195] text-[#090e1a] text-sm font-bold rounded-lg hover:bg-[#10d482] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.1)] shrink-0">
            <Plus className="w-4 h-4" /> Global Add
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-[#0b1120] border border-[#1a2440] rounded-xl px-5 py-3.5 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{stats.total}</span>
            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">TOTAL SKILLS</span>
          </div>
          <div className="w-px h-4 bg-[#1a2440]" />
          <div className="flex items-center gap-2">
            <span className="text-[#14f195] font-bold">{stats.catCount}</span>
            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">CATEGORIES</span>
          </div>
          <div className="w-px h-4 bg-[#1a2440]" />
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold">{stats.circularCount}</span>
            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">CIRCULAR</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search library..." className="w-full h-8 pl-9 pr-8 bg-[#050914] border border-[#1a2440] rounded-md text-[13px] text-white placeholder:text-gray-600 focus:border-[#14f195]/40 focus:outline-none transition-colors" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {groupedSkills.circular.length === 0 && groupedSkills.categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#0b1120] border border-[#1a2440] rounded-2xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-[#1e293b]/50 flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-gray-500" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mb-1">NO SKILLS FOUND</span>
          <p className="text-gray-400 text-sm mb-4">No skills match the current criteria.</p>
          <button onClick={() => setSearchQuery('')} className="text-[#14f195] text-sm font-semibold hover:underline">Clear Search</button>
        </div>
      ) : (
        <div className="space-y-16">
          {groupedSkills.circular.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1a2440]">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide">TOP CIRCULAR SKILLS</h2>
                  <span className="text-[#8b9bb4] text-[11px] font-mono">{groupedSkills.circular.length} SKILLS</span>
                </div>
                <button onClick={() => openEditor(null, '', true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a2440]/50 hover:bg-[#1a2440] text-gray-300 text-[11px] font-bold uppercase tracking-wider transition-colors">
                  <Plus className="w-3 h-3" /> Add Circular Skill
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedSkills.circular.map(skill => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </section>
          )}

          {groupedSkills.categories.map((cat, idx) => (
            <section key={cat.title}>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1a2440]">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="text-[#14f195] opacity-50 font-mono text-[13px]">
                      {String(idx + 1).padStart(2, '0')} /
                    </span>
                    {cat.title}
                  </h2>
                  <span className="text-[#8b9bb4] text-[11px] font-mono">{cat.skills.length} SKILLS</span>
                </div>
                <button onClick={() => openEditor(null, cat.title, false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a2440]/50 hover:bg-[#1a2440] text-gray-300 text-[11px] font-bold uppercase tracking-wider transition-colors">
                  <Plus className="w-3 h-3" /> Add to {cat.title}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cat.skills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <EditorDrawer 
        isOpen={editorState.isOpen} 
        item={editorState.item} 
        initialCategory={editorState.initialCategory} 
        initialIsCircular={editorState.initialIsCircular} 
        availableCategories={availableCategories}
        skillCount={rawSkills?.length || 0} 
        onClose={closeEditor} 
        onSave={handleSave} 
      />
      <DeleteDialog item={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
    </div>
  );
}
