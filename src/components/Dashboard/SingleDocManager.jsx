import React, { useState, useEffect, useCallback, memo } from 'react';
import { setSingleDocument, subscribeToDocument } from '../../services/firestore';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const SingleDocManager = ({ title, collection, docId, fields }) => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const defaultState = {};
    fields.forEach(f => { defaultState[f.name] = ''; });
    setFormData(defaultState);

    const unsubscribe = subscribeToDocument(collection, docId, (data) => {
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collection, docId, fields]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setSingleDocument(collection, docId, formData);
      toast.success(`${title} Updated`);
    } catch (err) {
      toast.error(`Error saving ${title}: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, collection, docId, title]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold">{title} Control</h2>
      
      <div className="bg-[#131b2c] p-8 rounded-3xl border border-[#1e293b] shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  rows="4"
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required={field.required !== false}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required={field.required !== false}
                />
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-[#1e293b] flex justify-end">
            <button type="submit" disabled={isSaving} className="bg-[#14f195] text-[#0a0f1c] px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5" /> Save {title}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(SingleDocManager);
