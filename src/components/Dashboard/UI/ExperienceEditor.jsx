import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ExperienceCard from './ExperienceCard'; // We will use it for preview

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mb-5 mt-8 first:mt-0">
    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{number} / {title}</span>
    <div className="h-px bg-[#1e293b] flex-grow"></div>
  </div>
);

const InputField = ({ label, name, value, onChange, required, placeholder, helper, isMonospace, type = 'text', maxLength }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
      <span>{label} {required && <span className="text-[#14f195]">*</span>}</span>
      {maxLength && type === 'textarea' && (
        <span className="text-gray-600 font-normal">
          {(value || '').length} / {maxLength}
        </span>
      )}
    </label>
    {type === 'textarea' ? (
      <textarea 
        name={name}
        value={value || ''}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors min-h-[140px] resize-y"
        required={required}
        placeholder={placeholder}
      />
    ) : (
      <input 
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`w-full px-4 h-[48px] bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors ${isMonospace ? 'font-mono text-sm' : ''}`}
        required={required}
        placeholder={placeholder}
      />
    )}
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

const ExperienceEditor = ({ isOpen, onClose, experience, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        setFormData({ ...experience });
      } else {
        setFormData({
          title: '',
          description: '',
          order: '',
          technologies: ''
        });
      }
    }
  }, [isOpen, experience]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.order) {
      toast.error('Please fill all required fields');
      return;
    }

    onSave(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  // Safe parsing for live tech stack visual preview
  const techTags = formData.technologies 
    ? formData.technologies.split(',').map(t => t.trim()).filter(Boolean) 
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Overlay - very subtle dark, no heavy blur */}
      <div 
        className="absolute inset-0 bg-[#030814]/65 backdrop-blur-[1px] transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Centered Modal */}
      <div className="relative w-full max-w-[760px] max-h-[90vh] md:max-h-[85vh] bg-[#0d1321] border border-[#1e293b] rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] bg-[#0d1321] shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              {experience ? 'EDIT EXPERIENCE' : 'NEW EXPERIENCE'}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {experience ? (
                <>
                  <span className="text-[#14f195] font-mono font-normal">Phase {String(experience.order).padStart(2, '0')}</span>
                  <span className="text-gray-500">·</span>
                  <span className="truncate max-w-[300px]">{experience.title}</span>
                </>
              ) : (
                'Create a new phase in your engineering journey'
              )}
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close editor"
            title="Close editor"
            className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Left: Form */}
            <div className="flex-grow">
              <form id="experience-form" onSubmit={handleSubmit} className="space-y-2">
                
                <SectionHeader number="01" title="CORE INFORMATION" />
                <div className="space-y-5">
                  <InputField 
                    label="TITLE / ROLE" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="Networking foundations"
                  />
                  <InputField 
                    label="DESCRIPTION" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    type="textarea" 
                    maxLength={300}
                    placeholder="Routing, Switching, TCP/IP, and network design..."
                  />
                </div>

                <SectionHeader number="02" title="JOURNEY POSITION" />
                <div className="space-y-5 w-1/2">
                  <InputField 
                    label="ORDER / PHASE" 
                    name="order" 
                    value={formData.order} 
                    onChange={handleChange} 
                    required 
                    isMonospace
                    placeholder="01"
                    helper="Controls the position of this experience in the journey." 
                  />
                </div>

                <SectionHeader number="03" title="TECHNICAL STACK" />
                <div className="space-y-5">
                  <div className="w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      TECHNOLOGIES
                    </label>
                    <input 
                      type="text"
                      name="technologies"
                      value={formData.technologies || ''}
                      onChange={handleChange}
                      placeholder="Routing, Switching, TCP/IP, Network Design, CCNA"
                      className="w-full px-4 h-[48px] bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2 mb-4">Separate technologies with commas.</p>
                    
                    {techTags.length > 0 && (
                      <div className="mt-4">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 block">TECH STACK PREVIEW</span>
                        <div className="flex flex-wrap gap-2">
                          {techTags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 text-[11px] font-mono font-medium text-gray-300 bg-[#1e293b] border border-[#334155] rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </form>
            </div>

            {/* Right: Live Card Preview */}
            <div className="w-full lg:w-[320px] shrink-0">
               <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 block">CARD PREVIEW</span>
               <div className="pointer-events-none">
                 <ExperienceCard experience={formData} previewMode={true} />
               </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1e293b] bg-[#0d1321] shrink-0 flex items-center justify-end gap-3 rounded-b-[20px]">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg font-bold text-gray-400 hover:bg-[#1e293b] hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="experience-form"
            disabled={isSaving} 
            className="bg-[#14f195] text-[#0a0f1c] px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50 shadow-sm"
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
