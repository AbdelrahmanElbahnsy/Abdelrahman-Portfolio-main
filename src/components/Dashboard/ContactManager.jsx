import React, { useState, useEffect } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { Mail, Phone, MapPin, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactManager = () => {
  const { data, loading, setDocData, subscribe } = useFirestoreSingleDoc('contact', 'main');
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    location: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // Sync data to form state when loaded or updated (only if not currently editing)
  useEffect(() => {
    if (data && !isDirty) {
      setFormData({
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || ''
      });
    }
  }, [data, isDirty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setIsSuccess(false);
  };

  const handleSave = async () => {
    // Basic Frontend Validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    // We do not aggressively validate phone, allowing international formats like +20, +1, etc.
    if (!formData.location) {
      toast.error('Location is required.');
      return;
    }

    setIsSaving(true);
    try {
      await setDocData(formData);
      setIsDirty(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to update contact info');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#14f195]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* PAGE HEADER */}
      <div className="mb-10">
        <span className="text-[#14f195] font-mono text-sm uppercase tracking-widest font-bold mb-2 block">
          CONTACT / PUBLIC PROFILE
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
              Contact Information
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Manage the contact details displayed across your public portfolio.
            </p>
          </div>
          
          <div className="flex items-center shrink-0">
            {isDirty ? (
              <div className="flex items-center text-amber-500 font-mono text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                UNSAVED CHANGES
              </div>
            ) : (
              <div className="flex items-center text-gray-400 font-mono text-xs uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                ALL CHANGES SAVED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTACT EDITOR */}
        <div className="lg:col-span-7 bg-[#131b2c] border border-[#1e293b] rounded-[20px] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">01 / CONTACT DETAILS</span>
              <div className="h-px bg-[#1e293b] flex-grow"></div>
            </div>

            <div className="space-y-6">
              
              {/* EMAIL */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  className="w-full px-4 h-[52px] bg-[#0a0f1c] border border-[#1e293b] rounded-xl focus:border-[#14f195] text-white outline-none transition-colors"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Phone
                </label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 h-[52px] bg-[#0a0f1c] border border-[#1e293b] rounded-xl focus:border-[#14f195] text-white outline-none transition-colors"
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Location
                </label>
                <input 
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-4 h-[52px] bg-[#0a0f1c] border border-[#1e293b] rounded-xl focus:border-[#14f195] text-white outline-none transition-colors"
                />
              </div>

            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#1e293b] flex justify-end">
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                isSuccess 
                  ? 'bg-transparent border border-[#14f195] text-[#14f195]' 
                  : isDirty && !isSaving
                    ? 'bg-[#14f195] text-[#0a0f1c] hover:bg-[#10d482] shadow-[0_0_20px_rgba(20,241,149,0.15)]'
                    : 'bg-[#1e293b] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  Changes Saved
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8 bg-[#0d1321] border border-[#1e293b] rounded-[20px] p-6 md:p-8 overflow-hidden">
            {/* Ambient Background Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#14f195] opacity-[0.03] blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">LIVE PREVIEW</span>
              <div className="h-px bg-[#1e293b] flex-grow"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-[#14f195] font-mono text-sm uppercase tracking-widest mb-3">GET IN TOUCH</h3>
              <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Let's connect.</h2>

              <div className="space-y-6">
                
                {/* Email Preview */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-[#131b2c] border border-[#1e293b] flex items-center justify-center shrink-0 group-hover:border-[#14f195]/50 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-[#14f195] transition-colors" />
                  </div>
                  <div className="pt-1 overflow-hidden w-full">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Email</div>
                    <div className={`text-base truncate transition-opacity duration-200 ${formData.email ? 'text-white' : 'text-gray-600 italic'}`}>
                      {formData.email || 'hello@example.com'}
                    </div>
                  </div>
                </div>

                {/* Phone Preview */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-[#131b2c] border border-[#1e293b] flex items-center justify-center shrink-0 group-hover:border-[#14f195]/50 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 group-hover:text-[#14f195] transition-colors" />
                  </div>
                  <div className="pt-1 overflow-hidden w-full">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Phone</div>
                    <div className={`text-base truncate transition-opacity duration-200 ${formData.phone ? 'text-white' : 'text-gray-600 italic'}`}>
                      {formData.phone || '+1 (555) 000-0000'}
                    </div>
                  </div>
                </div>

                {/* Location Preview */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-[#131b2c] border border-[#1e293b] flex items-center justify-center shrink-0 group-hover:border-[#14f195]/50 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#14f195] transition-colors" />
                  </div>
                  <div className="pt-1 overflow-hidden w-full">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Location</div>
                    <div className={`text-base truncate transition-opacity duration-200 ${formData.location ? 'text-white' : 'text-gray-600 italic'}`}>
                      {formData.location || 'City, Country'}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactManager;
