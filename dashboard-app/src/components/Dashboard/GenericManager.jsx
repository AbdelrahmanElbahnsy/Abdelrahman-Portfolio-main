import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../../services/firestore';
import { uploadImage } from '../../services/storage';
import { Plus, Edit2, Trash2, X, Loader2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const GenericManager = ({ title, collectionName, hasImage = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchItems(); }, [collectionName]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getDocuments(collectionName);
      setItems(data);
    } catch (err) {
      toast.error(`Failed to load ${title}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setImageFile(null);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name || '', description: item.description || '' });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let imageUrl = formData.image || '';
      if (hasImage && imageFile) {
        toast('Uploading file...', { icon: '⏳' });
        imageUrl = await uploadImage(imageFile, collectionName);
      }

      const finalData = { ...formData };
      if (hasImage) finalData.image = imageUrl || formData.image || '';
      
      if (editingId) {
        await updateDocument(collectionName, editingId, finalData);
        toast.success(`${title} updated!`);
      } else {
        await addDocument(collectionName, finalData);
        toast.success(`${title} added!`);
      }
      resetForm();
      fetchItems();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Delete this ${title} item?`)) {
      try {
        await deleteDocument(collectionName, id);
        toast.success('Deleted');
        fetchItems();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Manage {title}</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsFormOpen(true)} className="bg-[#14f195] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus className="w-5 h-5"/> Add New
        </motion.button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingId ? 'Edit' : 'New'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name / Title</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none" placeholder="e.g. React.js, Senior Developer"/>
              </div>

              {hasImage && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Icon / Image</label>
                  <label className="w-full flex items-center justify-center p-3 bg-[#0a0f1c] border border-[#1e293b] border-dashed rounded-lg cursor-pointer hover:border-[#14f195] transition-colors text-white">
                    <UploadCloud className="w-5 h-5 mr-2 text-gray-400"/>
                    <span className="text-sm truncate">{imageFile ? imageFile.name : 'Choose file...'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])}/>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description / Details</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none" placeholder="Details..."/>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:bg-[#1e293b] transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-[#14f195] text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center p-12 bg-[#131b2c] rounded-2xl border border-[#1e293b]">
          <p className="text-gray-400">No items yet. Click Add New to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] group hover:border-[#14f195]/50 transition-colors flex flex-col justify-between">
              <div>
                {hasImage && item.image && <img src={item.image} alt="Icon" className="w-12 h-12 object-contain mb-4 bg-white/5 rounded-lg p-2" />}
                <h3 className="font-bold text-lg text-white mb-2">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-[#1e293b]">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default GenericManager;
