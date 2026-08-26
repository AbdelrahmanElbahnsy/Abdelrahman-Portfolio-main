import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { validateSchema } from '../../cms/validators/schemaValidator';
import { heroSchema } from '../../cms/schemas';
import ImageUploader from '../../cms/components/ImageUploader';
import { 
  Loader2, Save, Undo2, ExternalLink, User, FileText, Image as ImageIcon, 
  LayoutTemplate, Briefcase, FileSignature, CheckCircle2, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const HeroManager = () => {
  const { data, loading, setDocData, subscribe } = useFirestoreSingleDoc('hero', 'main');
  const { uploadImage, isUploading, uploadProgress, resetUploadState } = useImageUpload();

  const [formData, setFormData] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving', 'success'

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
      setSaveStatus('saved');
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
      setSaveStatus(dirty ? 'unsaved' : 'saved');
      
      return updated;
    });
  }, [data, imageFiles]);

  const handleFileChange = useCallback((fieldName, e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFiles(prev => {
        const updated = { ...prev, [fieldName]: e.target.files[0] };
        setIsDirty(true);
        setSaveStatus('unsaved');
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
      setSaveStatus('saved');
      resetUploadState();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
    setSaveStatus('saving');
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
      setSaveStatus('success');
      toast.success(`Hero Section Updated`);
      
      setTimeout(() => {
        setSaveStatus('saved');
      }, 3000);
    } catch (err) {
      toast.error(`Error saving Hero: ${err.message}`);
      setSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !data) {
    return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>;
  }

  // Proper Desktop-Oriented Live Preview Component
  const LivePreview = () => {
    const previewImage = imageFiles['portrait'] 
      ? URL.createObjectURL(imageFiles['portrait']) 
      : formData.portrait;

    return (
      <div className="w-full flex flex-col">
        {/* Browser Frame */}
        <div className="bg-[#0a0f1c] rounded-xl border border-[#1e293b] shadow-2xl overflow-hidden flex flex-col w-full h-[450px] xl:h-[500px]">
          
          {/* Browser Top Strip */}
          <div className="h-8 bg-[#131b2c] border-b border-[#1e293b] flex items-center px-4 gap-2 relative">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#eab308] opacity-50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] opacity-50"></div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-[9px] text-gray-500 font-medium uppercase tracking-widest hidden sm:block">
              Portfolio Preview
            </div>
          </div>

          {/* Hero Viewport */}
          <div className="flex-grow flex items-center px-6 sm:px-8 py-4 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-[#14f195]/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex w-full h-full gap-4 xl:gap-6 items-center z-10">
              
              {/* Left Column: Typography (55-60%) */}
              <div className="w-[55%] xl:w-[60%] flex flex-col justify-center h-full pt-4 pb-4">
                {formData.badge && (
                  <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14f195]/10 border border-[#14f195]/30 text-[#14f195] text-[9px] font-medium italic mb-3">
                    <span>✨</span> {formData.badge}
                  </div>
                )}
                
                <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-black text-white leading-[1.1] mb-2 tracking-tight">
                  <span className="bg-gradient-to-r from-[#14f195] to-[#10d482] text-transparent bg-clip-text">
                    {formData.firstName} {formData.lastName}
                  </span>
                </h1>
                
                {formData.roles && (
                  <h2 className="text-[11px] sm:text-xs font-bold text-[#14f195] mb-3 xl:mb-4">
                    {formData.roles.split(',')[0]?.trim()} <span className="animate-pulse">|</span>
                  </h2>
                )}
                
                {formData.description && (
                  <p className="text-gray-400 text-[10px] sm:text-[11px] leading-relaxed line-clamp-4 pr-2 mb-5 xl:mb-6">
                    {formData.description}
                  </p>
                )}
                
                {formData.cvUrl && (
                  <div className="mt-auto self-start">
                    <div className="px-5 py-2.5 bg-[#14f195] text-[#0a0f1c] rounded-full text-[10px] font-bold inline-flex items-center gap-2 shadow-[0_0_15px_rgba(20,241,149,0.25)]">
                      <FileText className="w-3 h-3" /> Download CV
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column: Hero Image Area (40-45%) */}
              {previewImage && (
                <div className="w-[45%] xl:w-[40%] h-full flex items-center justify-center relative py-4">
                  <div className="w-full h-full max-h-[300px] xl:max-h-[350px] rounded-2xl overflow-hidden border border-[#1e293b]/50 shadow-2xl bg-gradient-to-b from-[#131b2c]/80 to-[#0a0f1c]/80 flex justify-center items-end p-0">
                    <img 
                      src={previewImage} 
                      alt="Hero Layout Portrait" 
                      className="w-full h-full object-contain object-bottom drop-shadow-2xl" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Compact Disclaimer */}
        <p className="text-[10px] text-gray-500 mt-2 text-center font-medium">
          Preview reflects current unsaved form values.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* PAGE HEADER (Natural Scroll, No overlapping issue) */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] rounded-t-xl mb-6 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative z-10 mt-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutTemplate className="w-6 h-6 text-[#14f195]" /> Hero Section
          </h1>
          <p className="text-gray-400 mt-1 text-xs">
            Manage the primary identity and positioning of your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {saveStatus === 'saved' && (
              <span className="text-gray-500 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Live Content</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]">
                Unsaved Changes
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-blue-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'success' && (
              <span className="text-[#14f195] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Saved Successfully</span>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-[#1e293b]">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || isSaving || isUploading}
              className="px-4 py-2 rounded-lg font-bold text-white bg-[#1e293b] hover:bg-[#273549] border border-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-[#1e293b] flex items-center gap-2 text-sm shadow-sm"
            >
              <Undo2 className="w-4 h-4" /> Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isDirty || isSaving || isUploading}
              className="bg-[#14f195] text-[#0a0f1c] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500 shadow-[0_4px_12px_rgba(20,241,149,0.15)] text-sm"
            >
              {isSaving || isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 xl:gap-8 items-start">
          
          {/* LEFT COLUMN: Main Editor (60%) */}
          <div className="space-y-4 xl:space-y-5">
            
            {/* IDENTITY & POSITIONING */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <User className="w-4 h-4 text-gray-400" /> Identity & Positioning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Professional Title / Badge</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Roles / Headlines</label>
                  <input
                    type="text"
                    name="roles"
                    value={formData.roles || ''}
                    onChange={handleChange}
                    placeholder="Software Engineer, Tech Lead"
                    className="w-full p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5 flex gap-1 items-center">
                    <CheckCircle2 className="w-3 h-3 text-gray-500" /> Values must be comma-separated.
                  </p>
                </div>
              </div>
            </div>

            {/* HERO DESCRIPTION */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <div className="flex justify-between items-end mb-3 border-b border-[#1e293b] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Hero Description
                </h3>
                <span className={`text-[10px] font-medium ${formData.description?.length > 300 ? 'text-orange-400' : 'text-gray-500'}`}>
                  {formData.description?.length || 0} characters
                </span>
              </div>
              <textarea
                name="description"
                rows="4"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors resize-y min-h-[100px]"
                required
              />
            </div>

            {/* HERO MEDIA */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Hero Media
              </h3>
              
              <div className="flex flex-col xl:flex-row gap-5 xl:gap-6 items-start">
                {/* Current Image Display */}
                <div className="w-full xl:w-[45%] bg-[#0a0f1c] rounded-xl border border-[#1e293b] overflow-hidden flex flex-col justify-center h-[240px]">
                  {(imageFiles['portrait'] || formData['portrait']) ? (
                    <img 
                      src={imageFiles['portrait'] ? URL.createObjectURL(imageFiles['portrait']) : formData['portrait']} 
                      alt="Hero Media Preview" 
                      className="w-full h-full object-contain p-2 drop-shadow-md"
                    />
                  ) : (
                    <div className="text-center text-gray-600 p-6 text-xs flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                      No media available
                    </div>
                  )}
                </div>
                
                {/* Upload Controls */}
                <div className="w-full xl:w-[55%]">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Upload New Image</label>
                  <ImageUploader
                    imageFile={imageFiles['portrait']}
                    existingImage={formData['portrait']}
                    onFileChange={(e) => handleFileChange('portrait', e)}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                  />
                  <p className="text-[10px] text-gray-500 mt-3 border-l-2 border-gray-700 pl-3 leading-relaxed">
                    Upload a high-quality portrait or graphic. Transparent PNGs are recommended. Changes apply only after saving.
                  </p>
                </div>
              </div>
            </div>

            {/* RESUME / CV */}
            <div className="bg-[#131b2c] p-5 xl:p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <FileSignature className="w-4 h-4 text-gray-400" /> Resume / CV Document
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Resume URL</label>
                    <span className="text-[9px] text-[#14f195] font-medium px-2 py-0.5 bg-[#14f195]/10 rounded-full">This URL powers the public Download CV button.</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="cvUrl"
                      value={formData.cvUrl || ''}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="flex-grow p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors font-mono text-ellipsis overflow-hidden whitespace-nowrap min-w-0"
                    />
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(formData.cvUrl)}
                      disabled={!formData.cvUrl}
                      className="px-3.5 py-2.5 bg-[#1e293b] border border-[#1e293b] rounded-lg hover:bg-[#273549] transition-colors disabled:opacity-30 disabled:hover:bg-[#1e293b] flex-shrink-0"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-gray-300" />
                    </button>
                    <a 
                      href={formData.cvUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 flex items-center gap-2 rounded-lg font-bold text-sm transition-colors flex-shrink-0 ${formData.cvUrl ? 'bg-[#14f195]/10 text-[#14f195] border border-[#14f195]/30 hover:bg-[#14f195]/20' : 'bg-white/5 text-gray-600 border border-white/5 pointer-events-none'}`}
                    >
                      <ExternalLink className="w-4 h-4" /> Open
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e293b] border-dashed">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alternative: Upload Document (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('cvUrl', e)}
                    className="w-full p-2 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-[#1e293b] file:text-white hover:file:bg-[#273549] transition-colors cursor-pointer"
                  />
                  <p className="text-[10px] text-gray-500 mt-2">
                    Uploading a file here automatically replaces the URL above after saving.
                  </p>
                </div>
              </div>
            </div>

            {/* PUBLIC CTA (READ-ONLY) */}
            <div className="bg-[#131b2c] p-4 xl:p-5 rounded-2xl border border-[#1e293b] shadow-sm flex gap-4 items-center">
              <div className="p-2.5 bg-blue-500/10 rounded-full text-blue-400 flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Public CTA</h4>
                <p className="text-sm text-white mt-0.5">
                  <strong>Download CV</strong> — Uses the Resume URL configured above.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Preview (40%) */}
          <div className="sticky top-6 pt-0 space-y-3">
            <LivePreview />
          </div>

        </form>
      </div>

    </div>
  );
};

export default memo(HeroManager);
