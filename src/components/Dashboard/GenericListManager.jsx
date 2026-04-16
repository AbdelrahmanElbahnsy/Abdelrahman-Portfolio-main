import React, { useState, useEffect, useCallback, memo } from 'react';
import { addDocument, updateDocument, deleteDocument, subscribeToCollection } from '../../services/firestore';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GenericListManager = ({ title, collectionName, fields }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const defaultState = {};
    fields.forEach(f => { defaultState[f.name] = ''; });
    setFormData(defaultState);

    const unsubscribe = subscribeToCollection(collectionName, (data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName, fields]);

  const resetForm = useCallback(() => {
    const defaultState = {};
    fields.forEach(f => { defaultState[f.name] = ''; });
    setFormData(defaultState);
    setEditingId(null);
    setIsFormOpen(false);
  }, [fields]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleEdit = useCallback((item) => {
    const editableData = {};
    fields.forEach(f => { editableData[f.name] = item[f.name] || ''; });
    setFormData(editableData);
    setEditingId(item.id);
    setIsFormOpen(true);
  }, [fields]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateDocument(collectionName, editingId, formData);
        toast.success(`${title} Updated!`);
      } else {
        await addDocument(collectionName, formData);
        toast.success(`${title} Added!`);
      }
      resetForm();
    } catch (err) {
      toast.error(`Error saving ${title}: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editingId, collectionName, formData, title, resetForm]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm(`Delete this ${title} item forever?`)) {
      try {
        await deleteDocument(collectionName, id);
        toast.success('Item Deleted');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  }, [collectionName, title]);

  const toggleForm = useCallback(() => setIsFormOpen(p => !p), []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Manage {title}</h2>
        <button 
          onClick={toggleForm} 
          className="bg-[#14f195] text-[#0a0f1c] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors"
        >
          <Plus className="w-5 h-5"/> Add New
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{editingId ? 'Edit Item' : 'New Item'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                   <textarea rows="3" name={field.name} value={formData[field.name] || ''} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none" required={field.required !== false}/>
                ) : (
                   <input type={field.type || 'text'} name={field.name} value={formData[field.name] || ''} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none" required={field.required !== false}/>
                )}
              </div>
            ))}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:bg-[#1e293b] transition">Cancel</button>
              <button type="submit" disabled={isSaving} className="bg-[#14f195] text-[#0a0f1c] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition disabled:opacity-50">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : editingId ? 'Update' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center p-12 bg-[#131b2c] rounded-2xl border border-[#1e293b]">
          <p className="text-gray-400">No data found in {title}. Click Add New to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] group hover:border-[#14f195]/50 transition-colors flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{item[fields[0].name]}</h3>
                {fields.slice(1).map(field => (
                   <p key={field.name} className={`mb-1 ${field.name.includes('url') || field.name.includes('link') || field.name.includes('href') ? 'text-blue-400 text-sm truncate' : 'text-gray-400 text-sm line-clamp-3'}`}>
                      {item[field.name]}
                   </p>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#1e293b]">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(GenericListManager);
