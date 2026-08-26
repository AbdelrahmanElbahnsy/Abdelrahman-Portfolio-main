import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { validateSchema } from '../../../cms/validators/schemaValidator';
import { journeySchema } from '../../../cms/schemas';
import toast from 'react-hot-toast';

const ExperienceEditor = ({ isOpen, onClose, experience, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        // Editing existing
        setFormData({ ...experience });
      } else {
        // New experience
        const defaultData = {};
        journeySchema.fields.forEach(f => {
          defaultData[f.name] = '';
        });
        setFormData(defaultData);
      }
    }
  }, [isOpen, experience]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  // Close when clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-[560px] bg-[#131b2c] border-l border-[#1e293b] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e293b] bg-[#131b2c] sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {experience ? 'Edit Experience' : 'New Experience'}
            </h2>
            {experience && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mt-1 block">
                Experience {String(experience.order).padStart(2, '0')}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <form id="experience-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Standard inputs derived from schema */}
            {journeySchema.fields.map(field => {
              // Ignore non-editable fields or fields better handled implicitly
              return (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-[#14f195] ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                      required={field.required}
                    />
                  ) : (
                    <input 
                      type="text"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors"
                      required={field.required}
                      placeholder={field.name === 'technologies' ? 'e.g., Routing, Switching, TCP/IP, CCNA' : ''}
                    />
                  )}
                  {field.name === 'technologies' && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Separate technologies with commas. They will be displayed as individual tags.
                    </p>
                  )}
                </div>
              );
            })}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1e293b] bg-[#131b2c] sticky bottom-0 z-10 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-400 hover:bg-[#1e293b] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="experience-form"
            disabled={isSaving} 
            className="bg-[#14f195] text-[#0a0f1c] px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,241,149,0.2)]"
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
  );
};

export default ExperienceEditor;
