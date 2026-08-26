import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { validateSchema } from '../../cms/validators/schemaValidator';
import ImageUploader from '../../cms/components/ImageUploader';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const SingleDocManager = ({ title, collection, docId, fields }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFiles, setImageFiles] = useState({});

  const { data, loading, setDocData, subscribe } = useFirestoreSingleDoc(collection, docId);
  const { uploadImage, isUploading, uploadProgress, resetUploadState } = useImageUpload();

  useEffect(() => {
    const defaultState = {};
    fields.forEach(f => { defaultState[f.name] = ''; });
    
    // If we have data from Firestore, overlay it onto the default state
    if (data) {
      fields.forEach(f => {
        if (data[f.name] !== undefined) {
          defaultState[f.name] = data[f.name];
        }
      });
    }
    
    setFormData(defaultState);

    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [collection, docId, fields, subscribe, data]);

  const handleFileChange = useCallback((fieldName, e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFiles(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const validation = validateSchema(formData, { fields });
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setIsSaving(true);
    try {
      const payloadToSave = { ...formData };

      // Process all image fields
      for (const field of fields) {
        if ((field.type === 'image' || field.type === 'file') && imageFiles[field.name]) {
          const uploadedUrl = await uploadImage(imageFiles[field.name]);
          if (uploadedUrl) {
            payloadToSave[field.name] = uploadedUrl;
          }
        }
      }

      await setDocData(payloadToSave);
      setImageFiles({});
      resetUploadState();
      toast.success(`${title} Updated`);
    } catch (err) {
      toast.error(`Error saving ${title}: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, imageFiles, fields, title, setDocData, uploadImage, resetUploadState]);

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
                  required={field.required !== false && !imageFiles[field.name] && !formData[field.name]}
                />
              ) : field.type === 'image' || field.type === 'file' ? (
                <ImageUploader
                  imageFile={imageFiles[field.name]}
                  existingImage={formData[field.name]}
                  onFileChange={(e) => handleFileChange(field.name, e)}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required={field.required !== false && !imageFiles[field.name] && !formData[field.name]}
                />
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-[#1e293b] flex justify-end">
            <button type="submit" disabled={isSaving || isUploading} className="bg-[#14f195] text-[#0a0f1c] px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50">
              {isSaving || isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5" /> Save {title}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(SingleDocManager);
