import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFirestoreCrud } from '../../cms/hooks/useFirestoreCrud';
import { Plus, Loader2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ExperienceCard from './UI/ExperienceCard';
import ExperienceEditor from './UI/ExperienceEditor';

const JourneyManager = () => {
  const { data: items, loading, create, update, remove, subscribe } = useFirestoreCrud('journey', {
    orderByField: 'order',
    orderDirection: 'asc'
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [activePhaseId, setActivePhaseId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update active phase to the latest item by default if none selected
  useEffect(() => {
    if (items && items.length > 0 && !activePhaseId) {
      setActivePhaseId(items[items.length - 1].id);
    }
  }, [items, activePhaseId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  const handleAddNew = () => {
    setEditingExperience(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setActivePhaseId(experience.id);
    setIsEditorOpen(true);
  };

  const handleDelete = async (experience) => {
    if (window.confirm(`Delete Experience?\n\nYou are about to permanently remove:\n"${experience.title}"\n\nThis action cannot be undone.`)) {
      try {
        await remove(experience.id);
        toast.success('Experience deleted successfully');
      } catch (err) {
        toast.error('Failed to delete experience');
      }
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const payload = { ...formData };
      
      // Auto-assign order if new and not provided
      if (!editingExperience && (!payload.order || payload.order === '')) {
        let maxOrder = 0;
        if (items && items.length > 0) {
          items.forEach(item => {
            const currentOrder = Number(item.order);
            if (!isNaN(currentOrder) && currentOrder > maxOrder) {
              maxOrder = currentOrder;
            }
          });
        }
        payload.order = String(maxOrder + 1).padStart(2, '0');
      } else if (payload.order) {
        // Ensure order is a string as defined in schema
        payload.order = String(payload.order);
      }

      if (editingExperience) {
        await update(editingExperience.id, payload);
        toast.success('Experience updated successfully');
      } else {
        await create(payload);
        toast.success('Experience added successfully');
      }
      setIsEditorOpen(false);
    } catch (err) {
      toast.error(`Error saving experience: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveUp = async (currentIndex) => {
    if (currentIndex <= 0) return;
    const currentItem = items[currentIndex];
    const prevItem = items[currentIndex - 1];

    try {
      const tempOrder = currentItem.order;
      await Promise.all([
        update(currentItem.id, { order: prevItem.order }),
        update(prevItem.id, { order: tempOrder })
      ]);
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const handleMoveDown = async (currentIndex) => {
    if (currentIndex >= items.length - 1) return;
    const currentItem = items[currentIndex];
    const nextItem = items[currentIndex + 1];

    try {
      const tempOrder = currentItem.order;
      await Promise.all([
        update(currentItem.id, { order: nextItem.order }),
        update(nextItem.id, { order: tempOrder })
      ]);
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  // Search Filter
  const filteredItems = (items || []).filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = (item.title || '').toLowerCase().includes(query);
    const descMatch = (item.description || '').toLowerCase().includes(query);
    const techMatch = (item.technologies || '').toLowerCase().includes(query);
    return titleMatch || descMatch || techMatch;
  });

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <span className="text-[#14f195] font-mono text-sm uppercase tracking-widest font-bold mb-2 block">
            Journey / Experience
          </span>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            Professional Journey
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-6">
            Manage the engineering experience, technical progression, and capabilities displayed across the public portfolio.
          </p>
          
          {!loading && items && items.length > 0 && (
            <div className="mt-8 bg-[#131b2c] border border-[#1e293b] rounded-[14px] p-5 md:p-6 w-full overflow-hidden">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 block">
                    JOURNEY PROGRESSION
                  </span>
                  <div className="text-xl font-bold text-white mt-1">
                    <span className="text-[#14f195] mr-1.5">{items.length}</span> 
                    PHASES
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  Click a phase to edit
                </span>
              </div>
              
              <div className="overflow-x-auto scrollbar-none pb-2 -mx-2 px-2">
                <div className="flex items-start min-w-max">
                  {items.map((item, idx) => {
                    const isActive = activePhaseId === item.id;
                    return (
                      <div key={item.id} className="flex items-center group">
                        <div 
                          onClick={() => handleEdit(item)}
                          className="flex flex-col items-center relative cursor-pointer"
                          title={item.title}
                        >
                          {/* Node */}
                          <div className={`w-3 h-3 rounded-full z-10 transition-all duration-200 group-hover:scale-125 ${isActive ? 'bg-[#14f195] shadow-[0_0_10px_rgba(20,241,149,0.3)]' : 'bg-[#1e293b] border-2 border-[#334155] group-hover:border-[#14f195]/50 group-hover:bg-[#14f195]/10'}`}></div>
                          
                          {/* Hover Edit Affordance */}
                          <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#14f195]">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                          
                          {/* Labels */}
                          <div className="absolute top-6 flex flex-col items-center w-36 md:w-44 text-center transition-colors duration-200">
                            <span className={`text-[10px] font-mono mb-1 ${isActive ? 'text-[#14f195]' : 'text-gray-500 group-hover:text-[#14f195]/70'}`}>
                              {String(item.order).padStart(2, '0')}
                            </span>
                            <span className={`text-[13px] font-medium truncate w-full px-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {item.title}
                            </span>
                          </div>
                        </div>
                        
                        {/* Connecting Line */}
                        {idx < items.length - 1 && (
                          <div className={`h-[2px] w-24 sm:w-28 md:w-36 lg:w-44 -mx-1 transition-colors duration-200 ${isActive ? 'bg-gradient-to-r from-[#14f195]/40 to-[#334155]' : (activePhaseId === items[idx + 1].id ? 'bg-gradient-to-r from-[#334155] to-[#14f195]/40' : 'bg-[#334155]')}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Spacer for absolute positioned labels */}
                <div className="h-16"></div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAddNew}
          className="shrink-0 bg-[#14f195] text-[#0a0f1c] px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#10d482] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.15)]"
        >
          <Plus className="w-5 h-5"/> 
          Add Experience
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-[#131b2c] p-2 rounded-xl border border-[#1e293b] max-w-md">
        <div className="flex-grow flex items-center px-3">
          <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white outline-none placeholder-gray-500 py-2"
          />
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#131b2c] rounded-2xl border border-[#1e293b] p-6 h-64 animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-6 w-12 bg-[#1e293b] rounded mb-6"></div>
                <div className="h-6 w-3/4 bg-[#1e293b] rounded mb-4"></div>
                <div className="h-4 w-full bg-[#1e293b] rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-[#1e293b] rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-[#1e293b] rounded"></div>
                <div className="h-6 w-16 bg-[#1e293b] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#131b2c] rounded-3xl border border-[#1e293b] text-center px-4">
          <FolderOpen className="w-16 h-16 text-gray-600 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">No experiences yet</h3>
          <p className="text-gray-400 mb-8 max-w-md">
            Build your professional journey by adding your first engineering experience.
          </p>
          <button 
            onClick={handleAddNew}
            className="bg-[#1e293b] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-5 h-5"/> Add Experience
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {filteredItems.map((item, index) => (
            <ExperienceCard 
              key={item.id}
              experience={item}
              isFirst={index === 0 && searchQuery === ''}
              isLast={index === filteredItems.length - 1 && searchQuery === ''}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      )}

      <ExperienceEditor 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        experience={editingExperience}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default memo(JourneyManager);
