import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { validateSchema } from '../../../cms/validators/schemaValidator';
import { journeySchema } from '../../../cms/schemas';
import toast from 'react-hot-toast';

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-6 mt-8 first:mt-2">
    <span className="text-[10px] font-mono text-[#14f195] uppercase tracking-widest">{number} / {title}</span>
    <div className="h-px bg-[#1e293b] flex-grow"></div>
  </div>
);

const InputField = ({ label, name, value, onChange, required, placeholder, helper, isMonospace, type = 'text' }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-[#14f195]">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea 
        name={name}
        value={value || ''}
        onChange={onChange}
        rows="4"
        className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors min-h-[120px] resize-y"
        required={required}
        placeholder={placeholder}
      />
    ) : (
      <input 
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`w-full px-4 h-12 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors ${isMonospace ? 'font-mono text-sm' : ''}`}
        required={required}
        placeholder={placeholder}
      />
    )}
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

const ExperienceEditor = ({ isOpen, onClose, experience, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        setFormData({ ...experience });
        setInitialData({ ...experience });
      } else {
        const defaultData = {};
        journeySchema.fields.forEach(f => {
          defaultData[f.name] = '';
        });
        setFormData(defaultData);
        setInitialData(defaultData);
      }
    }
  }, [isOpen, experience]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateSchema(formData, { fields: journeySchema.fields });
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    onSave(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Safe parsing for live preview
  const techTags = formData.technologies 
    ? formData.technologies.split(',').map(t => t.trim()).filter(Boolean) 
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay - subtle dark, no heavy blur */}
      <div 
        className="absolute inset-0 bg-[#030814]/65 backdrop-blur-[2px] transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-[560px] bg-[#0d1321] border-l border-[#1e293b] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] bg-[#0d1321] sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195]">
                {experience ? 'EDIT EXPERIENCE' : 'NEW EXPERIENCE'}
              </span>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-mono text-gray-500 font-light">
                {experience ? String(experience.order).padStart(2, '0') : 'NEW'}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight truncate max-w-[320px]">
                {formData.title || 'Untitled Experience'}
              </h2>
            </div>
            
            {experience && (
              <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">
                Phase {String(experience.order).padStart(2, '0')} / Editing
              </p>
            )}
          </div>
          <button 
            onClick={handleClose}
            aria-label="Close editor"
            title="Close editor"
            className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <form id="experience-form" onSubmit={handleSubmit} className="space-y-2 pb-8">
            
            <SectionHeader number="01" title="IDENTITY" />
            <div className="space-y-5">
              <InputField label="Title / Role" name="title" value={formData.title} onChange={handleChange} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Company" name="company" value={formData.company} onChange={handleChange} />
                <InputField label="Organization" name="organization" value={formData.organization} onChange={handleChange} />
              </div>
            </div>

            <SectionHeader number="02" title="JOURNEY" />
            <div className="space-y-5">
              <InputField label="Description" name="description" value={formData.description} onChange={handleChange} type="textarea" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Date" name="date" value={formData.date} onChange={handleChange} placeholder="e.g. 2021 - Present" />
                <InputField 
                  label="Order / Phase" 
                  name="order" 
                  value={formData.order} 
                  onChange={handleChange} 
                  required 
                  isMonospace
                  helper="Controls the experience position in the Journey timeline." 
                />
              </div>
            </div>

            <SectionHeader number="03" title="TECHNICAL PROFILE" />
            <div className="space-y-5">
              <InputField label="Badge" name="badge" value={formData.badge} onChange={handleChange} placeholder="e.g. Networking foundations" />
              
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Technologies
                </label>
                <input 
                  type="text"
                  name="technologies"
                  value={formData.technologies || ''}
                  onChange={handleChange}
                  placeholder="e.g., Routing, Switching, TCP/IP"
                  className="w-full px-4 h-12 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2 mb-4">Separate technologies with commas.</p>
                
                {techTags.length > 0 && (
                  <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-lg p-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 block">TECH STACK PREVIEW</span>
                    <div className="flex flex-wrap gap-2">
                      {techTags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 text-[11px] font-mono font-semibold text-[#14f195] bg-[#14f195]/10 border border-[#14f195]/20 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SectionHeader number="04" title="APPEARANCE" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Status" name="status" value={formData.status} onChange={handleChange} />
                <InputField label="Icon" name="icon" value={formData.icon} onChange={handleChange} isMonospace />
              </div>
              
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Color
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleChange}
                    className="flex-grow px-4 h-12 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors font-mono text-sm"
                    placeholder="e.g. #14f195 or text-blue-500"
                  />
                  {formData.color && formData.color.startsWith('#') && (
                    <div 
                      className="w-12 h-12 rounded-lg border border-[#1e293b] shrink-0" 
                      style={{ backgroundColor: formData.color }}
                      title="Color Preview"
                    />
                  )}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1e293b] bg-[#0d1321] sticky bottom-0 z-20 flex items-center justify-between">
          <div>
            {isDirty && (
              <span className="flex items-center gap-2 text-xs font-medium text-amber-500/80">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:bg-[#1e293b] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="experience-form"
              disabled={isSaving || !isDirty} 
              className="bg-[#14f195] text-[#0a0f1c] px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,241,149,0.15)] disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExperienceEditor;
