import React, { useState, useEffect, useCallback } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { Mail, Phone, MapPin, Loader2, Check, Edit2, Trash2, ArrowUp, ArrowDown, Plus, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const generateId = () => Math.random().toString(36).substring(2, 11);

// Deep equal helper
const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const EMAIL_LABELS = ['Personal', 'Work', 'Business', 'Other'];
const PHONE_LABELS = ['Mobile', 'WhatsApp', 'Work', 'Personal', 'Other'];
const LOCATION_LABELS = ['Home', 'Office', 'Current Location', 'Other'];

const ContactManager = () => {
  const { data, loading, setDocData, subscribe } = useFirestoreSingleDoc('contact', 'main');
  
  const [localData, setLocalData] = useState({ emails: [], phones: [], locations: [] });
  const [originalData, setOriginalData] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modals state
  const [editorState, setEditorState] = useState({ isOpen: false, type: null, mode: 'add', item: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // Migration & Synchronization
  useEffect(() => {
    if (data && !isSaving && !editorState.isOpen && !deleteModal.isOpen) {
      
      const migrated = {
        emails: Array.isArray(data.emails) ? [...data.emails] : [],
        phones: Array.isArray(data.phones) ? [...data.phones] : [],
        locations: Array.isArray(data.locations) ? [...data.locations] : []
      };

      // Legacy migration logic
      if (migrated.emails.length === 0 && data.email) {
        migrated.emails.push({ id: generateId(), value: data.email, label: 'Personal', isPrimary: true });
      }
      if (migrated.phones.length === 0 && data.phone) {
        migrated.phones.push({ id: generateId(), value: data.phone, label: 'Mobile', isPrimary: true });
      }
      if (migrated.locations.length === 0 && data.location) {
        migrated.locations.push({ id: generateId(), value: data.location, label: 'Home', isPrimary: true });
      }

      setOriginalData(JSON.parse(JSON.stringify(migrated)));
      
      // Only set local data if it's currently clean (not dirty) to avoid wiping unsaved changes on unrelated background updates
      setLocalData(current => {
        if (!originalData || isEqual(current, originalData)) {
          return JSON.parse(JSON.stringify(migrated));
        }
        return current;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isDirty = originalData && !isEqual(localData, originalData);

  // === HANDLERS ===
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Normalize Primary Constraints (ensure exactly 1 or 0 primary)
      const ensurePrimary = (arr) => {
        if (arr.length === 0) return arr;
        const hasPrimary = arr.some(item => item.isPrimary);
        if (!hasPrimary) {
          return [{ ...arr[0], isPrimary: true }, ...arr.slice(1)];
        }
        return arr;
      };

      const finalEmails = ensurePrimary(localData.emails);
      const finalPhones = ensurePrimary(localData.phones);
      const finalLocations = ensurePrimary(localData.locations);

      // 2. Derive Legacy fields
      const legacyEmail = finalEmails.find(e => e.isPrimary)?.value || finalEmails[0]?.value || '';
      const legacyPhone = finalPhones.find(p => p.isPrimary)?.value || finalPhones[0]?.value || '';
      const legacyLocation = finalLocations.find(l => l.isPrimary)?.value || finalLocations[0]?.value || '';

      const payload = {
        emails: finalEmails,
        phones: finalPhones,
        locations: finalLocations,
        email: legacyEmail,
        phone: legacyPhone,
        location: legacyLocation
      };

      await setDocData(payload);
      
      setOriginalData(JSON.parse(JSON.stringify({ emails: finalEmails, phones: finalPhones, locations: finalLocations })));
      setLocalData(JSON.parse(JSON.stringify({ emails: finalEmails, phones: finalPhones, locations: finalLocations })));
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to update contact info');
    } finally {
      setIsSaving(false);
    }
  };

  const moveItem = (type, index, direction) => {
    const list = [...localData[type]];
    if (direction === 'up' && index > 0) {
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
    } else if (direction === 'down' && index < list.length - 1) {
      [list[index], list[index + 1]] = [list[index + 1], list[index]];
    }
    setLocalData({ ...localData, [type]: list });
  };

  const confirmDelete = (type, id) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const executeDelete = () => {
    const { type, id } = deleteModal;
    let list = [...localData[type]];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const isDeletingPrimary = list[index].isPrimary;
    list.splice(index, 1);
    
    // Auto promote first remaining item to primary if we deleted the primary
    if (isDeletingPrimary && list.length > 0) {
      list[0].isPrimary = true;
    }
    
    setLocalData({ ...localData, [type]: list });
    setDeleteModal({ isOpen: false, type: null, id: null });
  };

  // === EDITOR MODAL COMPONENT ===
  const EditorModal = () => {
    if (!editorState.isOpen) return null;
    const { type, mode, item } = editorState;
    
    const [form, setForm] = useState(item || { 
      id: generateId(), 
      value: '', 
      label: type === 'emails' ? 'Personal' : type === 'phones' ? 'Mobile' : 'Home',
      isPrimary: localData[type].length === 0 // Auto set primary if it's the first item
    });

    const isEmail = type === 'emails';
    const isPhone = type === 'phones';
    const title = `${mode === 'add' ? 'NEW' : 'EDIT'} ${isEmail ? 'EMAIL' : isPhone ? 'PHONE' : 'LOCATION'}`;
    const options = isEmail ? EMAIL_LABELS : isPhone ? PHONE_LABELS : LOCATION_LABELS;

    const handleFormSubmit = () => {
      if (!form.value.trim()) {
        toast.error(`${isEmail ? 'Email' : isPhone ? 'Phone' : 'Location'} is required.`);
        return;
      }
      if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value)) {
        toast.error('Please enter a valid email address.');
        return;
      }

      let list = [...localData[type]];
      
      // Handle primary exclusivity
      if (form.isPrimary) {
        list = list.map(i => ({ ...i, isPrimary: false }));
      } else if (list.length === 0 || (mode === 'edit' && list.length === 1)) {
        form.isPrimary = true; // Force primary if it's the only item
      } else if (mode === 'edit' && item.isPrimary && !form.isPrimary) {
        // User is demoting the primary item. Try to promote another one.
        const otherIndex = list.findIndex(i => i.id !== item.id);
        if (otherIndex !== -1) {
          list[otherIndex].isPrimary = true;
        } else {
          form.isPrimary = true; // Prevent demoting if no other items
        }
      }

      if (mode === 'add') {
        list.push(form);
      } else {
        const idx = list.findIndex(i => i.id === form.id);
        if (idx !== -1) list[idx] = form;
      }

      setLocalData({ ...localData, [type]: list });
      setEditorState({ isOpen: false, type: null, mode: 'add', item: null });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030814]/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#131b2c] border border-[#1e293b] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          <div className="px-6 py-5 border-b border-[#1e293b] flex justify-between items-center">
            <h3 className="text-[#14f195] font-mono text-sm uppercase tracking-widest font-bold">
              {title}
            </h3>
            <button onClick={() => setEditorState({ isOpen: false })} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isEmail ? 'Email Address' : isPhone ? 'Phone Number' : 'Location / Address'}
              </label>
              <input 
                type={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={isEmail ? 'hello@example.com' : isPhone ? '+1 (555) 000-0000' : 'City, Country'}
                className="w-full px-4 h-[48px] bg-[#0a0f1c] border border-[#1e293b] rounded-xl focus:border-[#14f195] text-white outline-none transition-colors"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Label
              </label>
              <select 
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full px-4 h-[48px] bg-[#0a0f1c] border border-[#1e293b] rounded-xl focus:border-[#14f195] text-white outline-none transition-colors appearance-none cursor-pointer"
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer group mt-2">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${form.isPrimary ? 'bg-[#14f195]' : 'bg-[#1e293b]'}`}></div>
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.isPrimary ? 'left-5' : 'left-1'}`}></div>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                Set as Primary
              </span>
            </label>
          </div>
          
          <div className="px-6 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex justify-end gap-3">
            <button 
              onClick={() => setEditorState({ isOpen: false })}
              className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleFormSubmit}
              className="px-5 py-2.5 bg-[#14f195] text-[#0a0f1c] rounded-lg font-bold hover:bg-[#10d482] transition-colors"
            >
              Save {isEmail ? 'Email' : isPhone ? 'Phone' : 'Location'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // === DELETE CONFIRMATION MODAL ===
  const DeleteModal = () => {
    if (!deleteModal.isOpen) return null;
    const { type, id } = deleteModal;
    const item = localData[type].find(i => i.id === id);
    if (!item) return null;
    
    const isEmail = type === 'emails';
    const isPhone = type === 'phones';
    const typeLabel = isEmail ? 'Email' : isPhone ? 'Phone' : 'Location';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030814]/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#131b2c] border border-[#1e293b] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Delete {typeLabel}?</h2>
            <p className="text-gray-400 mb-4">
              Are you sure you want to remove <strong className="text-white">{item.value}</strong>? This action cannot be undone.
            </p>
            {item.isPrimary && localData[type].length > 1 && (
              <p className="text-amber-500 text-sm mb-4 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                This is your primary {typeLabel.toLowerCase()}. Another item will automatically be set as primary.
              </p>
            )}
          </div>
          <div className="px-6 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex justify-end gap-3">
            <button 
              onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })}
              className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={executeDelete}
              className="px-5 py-2.5 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              Delete {typeLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // === RENDERERS ===
  const renderCard = (type, item, index) => {
    const list = localData[type];
    const isEmail = type === 'emails';
    const isPhone = type === 'phones';
    const Icon = isEmail ? Mail : isPhone ? Phone : MapPin;

    return (
      <div key={item.id} className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between group hover:border-[#14f195]/30 transition-colors">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.isPrimary ? 'bg-[#14f195]/10 text-[#14f195]' : 'bg-[#1e293b] text-gray-400'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{item.label}</span>
              {item.isPrimary && (
                <span className="text-[9px] font-bold uppercase tracking-widest bg-[#14f195]/10 text-[#14f195] px-1.5 py-0.5 rounded border border-[#14f195]/20">Primary</span>
              )}
            </div>
            <div className="text-sm font-medium text-white truncate">{item.value}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col mr-2">
            <button 
              onClick={() => moveItem(type, index, 'up')} 
              disabled={index === 0}
              className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Move Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => moveItem(type, index, 'down')} 
              disabled={index === list.length - 1}
              className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Move Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <button 
            onClick={() => setEditorState({ isOpen: true, type, mode: 'edit', item })}
            className="p-2 text-gray-400 hover:text-[#14f195] transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => confirmDelete(type, item.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading || !originalData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#14f195]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="mb-10">
        <span className="text-[#14f195] font-mono text-sm uppercase tracking-widest font-bold mb-2 block">
          CONTACT / PUBLIC PROFILE
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
              Contact Management
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Manage every contact method displayed across your public portfolio.
            </p>
          </div>
          
          <div className="flex items-center shrink-0">
            {isDirty ? (
              <div className="flex items-center text-amber-500 font-mono text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                UNSAVED CHANGES
              </div>
            ) : (
              <div className="flex items-center text-gray-400 font-mono text-xs uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                ALL CHANGES SAVED
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: MANAGEMENT SECTIONS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* EMAILS SECTION */}
          <div className="bg-[#131b2c] border border-[#1e293b] rounded-[20px] p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">EMAIL ADDRESSES</h2>
              <p className="text-sm text-gray-400 mt-1">Manage the email addresses shown on your public profile.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {localData.emails.length === 0 ? (
                <div className="py-8 px-4 border border-dashed border-[#1e293b] rounded-xl text-center">
                  <Mail className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No email addresses yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Add your first email to make it available on your public profile.</p>
                </div>
              ) : (
                localData.emails.map((item, index) => renderCard('emails', item, index))
              )}
            </div>
            
            <button 
              onClick={() => setEditorState({ isOpen: true, type: 'emails', mode: 'add', item: null })}
              className="flex items-center gap-2 text-[#14f195] font-medium hover:text-[#10d482] transition-colors text-sm bg-[#14f195]/5 hover:bg-[#14f195]/10 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Email
            </button>
          </div>

          {/* PHONES SECTION */}
          <div className="bg-[#131b2c] border border-[#1e293b] rounded-[20px] p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">PHONE NUMBERS</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your professional phone numbers.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {localData.phones.length === 0 ? (
                <div className="py-8 px-4 border border-dashed border-[#1e293b] rounded-xl text-center">
                  <Phone className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No phone numbers yet.</p>
                </div>
              ) : (
                localData.phones.map((item, index) => renderCard('phones', item, index))
              )}
            </div>
            
            <button 
              onClick={() => setEditorState({ isOpen: true, type: 'phones', mode: 'add', item: null })}
              className="flex items-center gap-2 text-[#14f195] font-medium hover:text-[#10d482] transition-colors text-sm bg-[#14f195]/5 hover:bg-[#14f195]/10 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Phone
            </button>
          </div>

          {/* LOCATIONS SECTION */}
          <div className="bg-[#131b2c] border border-[#1e293b] rounded-[20px] p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">LOCATIONS</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your locations and addresses.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {localData.locations.length === 0 ? (
                <div className="py-8 px-4 border border-dashed border-[#1e293b] rounded-xl text-center">
                  <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No locations yet.</p>
                </div>
              ) : (
                localData.locations.map((item, index) => renderCard('locations', item, index))
              )}
            </div>
            
            <button 
              onClick={() => setEditorState({ isOpen: true, type: 'locations', mode: 'add', item: null })}
              className="flex items-center gap-2 text-[#14f195] font-medium hover:text-[#10d482] transition-colors text-sm bg-[#14f195]/5 hover:bg-[#14f195]/10 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Location
            </button>
          </div>

          {/* SAVE CONTROLS (Floating below left column for better flow or inside it) */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                isSuccess 
                  ? 'bg-transparent border border-[#14f195] text-[#14f195]' 
                  : isDirty && !isSaving
                    ? 'bg-[#14f195] text-[#0a0f1c] hover:bg-[#10d482] shadow-[0_0_20px_rgba(20,241,149,0.15)]'
                    : 'bg-[#1e293b] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  Changes Saved
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8 bg-[#0d1321] border border-[#1e293b] rounded-[20px] p-6 md:p-8 overflow-hidden">
            {/* Ambient Background Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#14f195] opacity-[0.03] blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">LIVE PREVIEW</span>
              <div className="h-px bg-[#1e293b] flex-grow"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-[#14f195] font-mono text-sm uppercase tracking-widest mb-3">GET IN TOUCH</h3>
              <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Let's connect.</h2>

              <div className="space-y-8">
                
                {/* PREVIEW: EMAILS */}
                {localData.emails.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </h4>
                    <div className="space-y-4">
                      {localData.emails.map(email => (
                        <div key={email.id} className="group">
                          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">{email.label}</div>
                          <div className={`text-base truncate transition-colors duration-200 ${email.isPrimary ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                            {email.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PREVIEW: PHONES */}
                {localData.phones.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> Phone
                    </h4>
                    <div className="space-y-4">
                      {localData.phones.map(phone => (
                        <div key={phone.id} className="group">
                          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">{phone.label}</div>
                          <div className={`text-base truncate transition-colors duration-200 ${phone.isPrimary ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                            {phone.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PREVIEW: LOCATIONS */}
                {localData.locations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </h4>
                    <div className="space-y-4">
                      {localData.locations.map(loc => (
                        <div key={loc.id} className="group">
                          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">{loc.label}</div>
                          <div className={`text-base truncate transition-colors duration-200 ${loc.isPrimary ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                            {loc.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {localData.emails.length === 0 && localData.phones.length === 0 && localData.locations.length === 0 && (
                  <div className="text-gray-500 italic text-sm">
                    No contact methods added yet.
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

      </div>

      <EditorModal />
      <DeleteModal />
      
    </div>
  );
};

export default ContactManager;
