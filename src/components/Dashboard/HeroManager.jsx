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
        <div className="bg-[#0a0f1c] rounded-xl border border-[#1e293b] shadow-2xl overflow-hidden flex flex-col w-full h-[400px] xl:h-[450px]">
          
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
          <div className="flex-grow flex items-center p-6 sm:p-8 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-[#14f195]/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex w-full h-full gap-4 xl:gap-8 items-center z-10">
              
              {/* Left Column: Typography */}
              <div className="flex-1 flex flex-col justify-center max-w-[65%]">
                {formData.badge && (
                  <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14f195]/10 border border-[#14f195]/30 text-[#14f195] text-[9px] font-medium italic mb-3">
                    <span>✨</span> {formData.badge}
                  </div>
                )}
                
                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-[1.05] mb-2 tracking-tight">
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
                  <p className="text-gray-400 text-[10px] sm:text-[11px] leading-relaxed line-clamp-4 max-w-[95%] mb-5 xl:mb-6">
                    {formData.description}
                  </p>
                )}
                
                {formData.cvUrl && (
                  <div className="mt-auto">
                    <div className="px-5 py-2.5 bg-[#14f195] text-[#0a0f1c] rounded-full text-[10px] font-bold inline-flex items-center gap-2 shadow-[0_0_15px_rgba(20,241,149,0.3)]">
                      <FileText className="w-3 h-3" /> Download CV
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column: Hero Image Area */}
              {previewImage && (
                <div className="flex-1 max-w-[35%] h-full flex items-center justify-center relative">
                  <div className="w-full h-full max-h-[220px] xl:max-h-[260px] rounded-[16px] overflow-hidden border border-[#1e293b]/50 shadow-lg bg-gradient-to-b from-[#131b2c]/80 to-[#0a0f1c]/80 flex justify-center items-end p-2 relative group">
                    <img 
                      src={previewImage} 
                      alt="Hero Layout Portrait" 
                      className="w-full h-full object-contain object-bottom drop-shadow-xl" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Compact Disclaimer */}
        <p className="text-[10px] text-gray-500 mt-3 text-center">
          Preview reflects current unsaved form values.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* PAGE HEADER (Properly Z-Indexed and Opaque) */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] sticky top-0 z-[60] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
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
              <span className="text-gray-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Live Content</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20">
                Unsaved Changes
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-blue-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'success' && (
              <span className="text-[#14f195] flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved Successfully</span>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-[#1e293b]">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || isSaving || isUploading}
              className="px-4 py-2 rounded-lg font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5 flex items-center gap-2 text-sm"
            >
              <Undo2 className="w-4 h-4" /> Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isDirty || isSaving || isUploading}
              className="bg-[#14f195] text-[#0a0f1c] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500 shadow-lg shadow-[#14f195]/10 text-sm"
            >
              {isSaving || isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* LEFT COLUMN: Main Editor (60%) */}
          <div className="space-y-6">
            
            {/* IDENTITY & POSITIONING */}
            <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <User className="w-4 h-4 text-gray-400" /> Identity & Positioning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Professional Title / Badge</label>
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
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Roles / Headlines</label>
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
                    <CheckCircle2 className="w-3 h-3 text-gray-500" /> Values must be comma-separated. Creates the live typing effect.
                  </p>
                </div>
              </div>
            </div>

            {/* HERO DESCRIPTION */}
            <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <div className="flex justify-between items-end mb-4 border-b border-[#1e293b] pb-3">
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
            <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Hero Media
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Current Image Display */}
                <div className="w-full md:w-1/3 bg-[#0a0f1c] rounded-xl border border-[#1e293b] overflow-hidden flex flex-col justify-center min-h-[220px]">
                  {(imageFiles['portrait'] || formData['portrait']) ? (
                    <img 
                      src={imageFiles['portrait'] ? URL.createObjectURL(imageFiles['portrait']) : formData['portrait']} 
                      alt="Hero Media Preview" 
                      className="w-full h-full max-h-[260px] object-contain object-bottom p-2"
                    />
                  ) : (
                    <div className="text-center text-gray-600 p-6 text-xs">No media available</div>
                  )}
                </div>
                
                {/* Upload Controls */}
                <div className="w-full md:w-2/3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Upload New Image</label>
                  <ImageUploader
                    imageFile={imageFiles['portrait']}
                    onFileChange={(e) => handleFileChange('portrait', e)}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                  />
                  <p className="text-[10px] text-gray-500 mt-3 border-l-2 border-gray-700 pl-2">
                    Upload a high-quality portrait or graphic. Transparent PNGs are recommended. Changes apply only after saving.
                  </p>
                </div>
              </div>
            </div>

            {/* RESUME / CV */}
            <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <FileSignature className="w-4 h-4 text-gray-400" /> Resume / CV Document
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Resume URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="cvUrl"
                      value={formData.cvUrl || ''}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="flex-grow p-2.5 text-sm bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(formData.cvUrl)}
                      disabled={!formData.cvUrl}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <a 
                      href={formData.cvUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 flex items-center gap-2 rounded-lg font-bold text-sm transition-colors ${formData.cvUrl ? 'bg-[#14f195]/10 text-[#14f195] border border-[#14f195]/30 hover:bg-[#14f195]/20' : 'bg-white/5 text-gray-600 border border-white/5 pointer-events-none'}`}
                    >
                      <ExternalLink className="w-4 h-4" /> Open
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Or Upload Document (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('cvUrl', e)}
                    className="w-full p-2 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-white/5 file:text-white hover:file:bg-white/10 transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* PUBLIC CTA (READ-ONLY) */}
            <div className="bg-[#131b2c] p-6 rounded-2xl border border-[#1e293b] shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <Briefcase className="w-4 h-4 text-gray-400" /> Public Call To Action
              </h3>
              <div className="bg-[#0a0f1c] border border-blue-900/30 rounded-xl p-4 flex gap-4 items-start">
                <div className="mt-1 p-2 bg-blue-500/10 rounded-full text-blue-400">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Download CV</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    The public Hero section features a fixed "Download CV" action button. 
                    It is automatically wired to use the <strong className="text-white">Resume URL</strong> configured above. 
                    Changes to the Resume URL directly control where this button points.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Preview (40%) */}
          <div className="sticky top-24 space-y-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14f195] animate-pulse"></span>
              Live Desktop Preview
            </h3>
            <LivePreview />
            <div className="bg-[#131b2c] border border-[#1e293b] rounded-xl p-4 flex gap-3 text-xs text-gray-400">
              <LayoutTemplate className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <p>This is a scaled representation of the public Hero section. Dynamic animations and background effects are simplified in the CMS for editing performance.</p>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
};

export default memo(HeroManager);
