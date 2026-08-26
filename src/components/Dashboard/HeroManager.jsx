import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { validateSchema } from '../../cms/validators/schemaValidator';
import { heroSchema } from '../../cms/schemas';
import ImageUploader from '../../cms/components/ImageUploader';
import { Loader2, Save, Undo2, ExternalLink, User, FileText, Image as ImageIcon, LayoutTemplate, Briefcase, FileSignature, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const HeroManager = () => {
  const { data, loading, setDocData, subscribe } = useFirestoreSingleDoc('hero', 'main');
  const { uploadImage, isUploading, uploadProgress, resetUploadState } = useImageUpload();

  const [formData, setFormData] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // Sync with Firestore data when loaded or saved
  useEffect(() => {
    if (data && !isDirty) {
      const defaultState = {};
      heroSchema.fields.forEach(f => {
        defaultState[f.name] = data[f.name] !== undefined ? data[f.name] : '';
      });
      setFormData(defaultState);
    }
  }, [data, isDirty]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Determine if dirty
      let dirty = false;
      if (data) {
        for (const field of heroSchema.fields) {
          if (updated[field.name] !== (data[field.name] || '')) {
            dirty = true;
            break;
          }
        }
      }
      if (Object.keys(imageFiles).length > 0) dirty = true;
      setIsDirty(dirty);
      
      return updated;
    });
  }, [data, imageFiles]);

  const handleFileChange = useCallback((fieldName, e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFiles(prev => {
        const updated = { ...prev, [fieldName]: e.target.files[0] };
        setIsDirty(true);
        return updated;
      });
    }
  }, []);

  const handleDiscard = () => {
    if (data) {
      const defaultState = {};
      heroSchema.fields.forEach(f => {
        defaultState[f.name] = data[f.name] !== undefined ? data[f.name] : '';
      });
      setFormData(defaultState);
      setImageFiles({});
      setIsDirty(false);
      resetUploadState();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const validation = validateSchema(formData, { fields: heroSchema.fields });
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setIsSaving(true);
    try {
      const payloadToSave = { ...formData };

      for (const field of heroSchema.fields) {
        if ((field.type === 'image' || field.type === 'file') && imageFiles[field.name]) {
          const uploadedUrl = await uploadImage(imageFiles[field.name]);
          if (uploadedUrl) {
            payloadToSave[field.name] = uploadedUrl;
          }
        }
      }

      await setDocData(payloadToSave);
      setImageFiles({});
      setIsDirty(false);
      resetUploadState();
      toast.success(`Hero Section Updated`);
    } catch (err) {
      toast.error(`Error saving Hero: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !data) {
    return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>;
  }

  // Preview component
  const LivePreview = () => (
    <div className="bg-[#0a0f1c] rounded-2xl overflow-hidden border border-[#1e293b] shadow-2xl relative min-h-[300px] flex flex-col justify-center p-6">
      <div className="flex flex-col items-start gap-4">
        {formData.badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14f195]/10 border border-[#14f195]/30 text-[#14f195] text-xs font-medium italic">
            <span>✨</span> {formData.badge}
          </div>
        )}
        <h1 className="text-3xl font-black text-white leading-tight">
          <span className="bg-gradient-to-r from-[#14f195] to-[#10d482] text-transparent bg-clip-text">
            {formData.firstName} {formData.lastName}
          </span>
        </h1>
        {formData.roles && (
          <h2 className="text-lg font-bold text-[#14f195]">
            {formData.roles.split(',')[0]?.trim()} <span className="animate-pulse">|</span>
          </h2>
        )}
        {formData.description && (
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm line-clamp-3">
            {formData.description}
          </p>
        )}
        {(formData.cta1 || formData.cta2) && (
          <div className="flex gap-3 mt-2">
            {formData.cta1 && (
              <div className="px-4 py-2 bg-[#14f195] text-[#0a0f1c] rounded-full text-xs font-bold">
                {formData.cta1}
              </div>
            )}
            {formData.cta2 && (
              <div className="px-4 py-2 bg-transparent border border-white/20 text-white rounded-full text-xs font-bold">
                {formData.cta2}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mini Portrait absolute positioned in preview */}
      {formData.portrait && (
        <div className="absolute right-4 bottom-4 w-24 h-32 rounded-xl overflow-hidden border border-[#1e293b] shadow-xl opacity-80 mix-blend-luminosity">
          <img src={formData.portrait} alt="Portrait" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6 pt-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-[#14f195]" /> Hero Section
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl text-sm">
            Manage the main content displayed in the portfolio hero area.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-2 h-2 rounded-full bg-[#14f195] text-[#14f195] shadow-[0_0_8px_currentColor]"></span>
              Live Content
            </span>
            {isDirty && (
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                Unsaved Changes
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* LEFT COLUMN: Main Editor */}
        <div className="space-y-6">
          
          {/* BASIC INFORMATION */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <User className="w-5 h-5 text-gray-400" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Professional Title (Badge)</label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Roles / Headlines</label>
                <input
                  type="text"
                  name="roles"
                  value={formData.roles || ''}
                  onChange={handleChange}
                  placeholder="Software Engineer, Tech Lead, UI Designer"
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-2">Comma separated. Creates the typing effect on the hero.</p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <FileText className="w-5 h-5 text-gray-400" /> Description
            </h3>
            <textarea
              name="description"
              rows="4"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full p-4 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors resize-y min-h-[120px]"
              required
            />
            <div className="flex justify-end mt-2">
              <span className="text-[10px] text-gray-500 font-medium">
                {formData.description?.length || 0} characters
              </span>
            </div>
          </div>

          {/* HERO MEDIA */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <ImageIcon className="w-5 h-5 text-gray-400" /> Hero Media
            </h3>
            <ImageUploader
              imageFile={imageFiles['portrait']}
              existingImage={formData['portrait']}
              onFileChange={(e) => handleFileChange('portrait', e)}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
            <p className="text-[11px] text-gray-500 mt-4 text-center">
              Image will only be replaced when you explicitly upload a new one and save.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Settings & Preview */}
        <div className="space-y-6">
          
          {/* LIVE PREVIEW */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              Live Preview
            </h3>
            <LivePreview />
            <p className="text-[10px] text-gray-500 mt-3 text-center">
              Visual replica of the public Hero block based on current form state.
            </p>
          </div>

          {/* AVAILABILITY STATUS */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <CheckCircle2 className="w-5 h-5 text-gray-400" /> Availability
            </h3>
            <input
              type="text"
              name="availabilityStatus"
              value={formData.availabilityStatus || ''}
              onChange={handleChange}
              placeholder="e.g. Available for Opportunities"
              className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
            />
          </div>

          {/* CALL TO ACTION */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <Briefcase className="w-5 h-5 text-gray-400" /> Call To Action
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button 1</label>
                <input
                  type="text"
                  name="cta1"
                  value={formData.cta1 || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button 2</label>
                <input
                  type="text"
                  name="cta2"
                  value={formData.cta2 || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* RESUME DOCUMENT */}
          <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <FileSignature className="w-5 h-5 text-gray-400" /> Resume / CV
            </h3>
            
            <div className="mb-4">
              {formData.cvUrl ? (
                <a href={formData.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-sm font-medium text-white transition-colors w-full justify-between">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#14f195]" /> Current Resume</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-500 text-center italic">
                  No resume configured
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload New Resume (PDF)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange('cvUrl', e)}
                className="w-full p-2 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-white hover:file:bg-white/10 transition-colors"
              />
            </div>
          </div>
          
        </div>
      </form>

      {/* STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 p-4 bg-[#0a0f1c]/80 backdrop-blur-md border-t border-white/10 flex justify-end gap-4 z-40">
        {isDirty && (
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving || isUploading}
            className="px-6 py-2.5 rounded-lg font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Undo2 className="w-4 h-4" /> Discard
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isDirty || isSaving || isUploading}
          className="bg-[#14f195] text-[#0a0f1c] px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400"
        >
          {isSaving || isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5" /> Save Hero Changes</>}
        </button>
      </div>

    </div>
  );
};

export default memo(HeroManager);
