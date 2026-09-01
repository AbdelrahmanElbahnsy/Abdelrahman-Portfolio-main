import React, { useState, useEffect } from 'react';
import { Palette, Undo, Check, Type, Globe, RefreshCcw } from 'lucide-react';
import { crudService } from '../../cms/services/crudService';
import toast from 'react-hot-toast';
import { useAppearance } from '../../context/AppearanceContext';

const COLOR_PRESETS = [
  { name: 'Gold (Default)', hex: '#c8a26e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Orange', hex: '#f97316' },
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  language: 'en',
  primaryColor: '#c8a26e',
  backgroundColor: '#0A1121',
  surfaceColor: 'rgba(16, 26, 46, 0.7)',
  textColor: '#ffffff',
};

const AppearanceManager = ({ currentUserRole }) => {
  const { activeSettings } = useAppearance();
  
  const [draftSettings, setDraftSettings] = useState(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize draft from global settings
  useEffect(() => {
    if (activeSettings) {
      setDraftSettings(prev => ({ ...prev, ...activeSettings }));
    }
  }, [activeSettings]);

  // Check for unsaved changes
  useEffect(() => {
    if (!activeSettings) return;
    const isChanged = 
      draftSettings.theme !== (activeSettings.theme || DEFAULT_SETTINGS.theme) ||
      draftSettings.language !== (activeSettings.language || DEFAULT_SETTINGS.language) ||
      draftSettings.primaryColor !== (activeSettings.primaryColor || DEFAULT_SETTINGS.primaryColor) ||
      draftSettings.backgroundColor !== (activeSettings.backgroundColor || DEFAULT_SETTINGS.backgroundColor) ||
      draftSettings.surfaceColor !== (activeSettings.surfaceColor || DEFAULT_SETTINGS.surfaceColor) ||
      draftSettings.textColor !== (activeSettings.textColor || DEFAULT_SETTINGS.textColor);
      
    setIsDirty(isChanged);
  }, [draftSettings, activeSettings]);

  const handleChange = (key, value) => {
    setDraftSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin' && currentUserRole !== 'editor') {
      toast.error('You do not have permission to modify portfolio appearance.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Strictly sanitize payload to ensure no unsupported/undefined fields are passed to Firestore
      const sanitizedPayload = {
        theme: draftSettings.theme || 'dark',
        language: draftSettings.language || 'en',
        primaryColor: draftSettings.primaryColor || '#c8a26e',
        backgroundColor: draftSettings.backgroundColor || '#0A1121',
        surfaceColor: draftSettings.surfaceColor || 'rgba(16, 26, 46, 0.7)',
        textColor: draftSettings.textColor || '#ffffff',
      };

      // settings/appearance
      await crudService.set('settings', 'appearance', sanitizedPayload);
      toast.success('Portfolio appearance updated successfully!');
      setIsDirty(false);
    } catch (err) {
      console.error('Firebase Save Error:', err);
      // Temporarily expose the exact Firebase error code/message to the UI
      toast.error(`Error [${err.code || 'UNKNOWN'}]: ${err.message || 'Failed to save settings'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the public portfolio to its default appearance? This will not delete any content.')) {
      setDraftSettings(DEFAULT_SETTINGS);
      setIsDirty(true);
    }
  };

  const isRtl = draftSettings.language === 'ar';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Portfolio Appearance</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            Control the global theme, colors, and localization of your <strong>Public Portfolio</strong>. 
            Changes here directly affect what your visitors see.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-gray-300 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 border border-[#334155]"
          >
            <Undo className="w-4 h-4" /> Reset
          </button>
          
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-6 py-2 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Controls Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 1. Portfolio Theme & Language */}
          <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#14f195]" /> General Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-widest">Base Theme</label>
                <div className="flex bg-[#030814]/50 border border-[#1e293b] rounded-lg p-1">
                  {['dark', 'light'].map(t => (
                    <button
                      key={t}
                      onClick={() => handleChange('theme', t)}
                      className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-colors ${draftSettings.theme === t ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-widest">Global Language</label>
                <div className="flex bg-[#030814]/50 border border-[#1e293b] rounded-lg p-1">
                  <button
                    onClick={() => handleChange('language', 'en')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${draftSettings.language === 'en' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    English (LTR)
                  </button>
                  <button
                    onClick={() => handleChange('language', 'ar')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${draftSettings.language === 'ar' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Arabic (RTL)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Color System */}
          <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#14f195]" /> Color System
            </h3>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-widest">Primary Accent Color</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.hex}
                      onClick={() => handleChange('primaryColor', preset.hex)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${draftSettings.primaryColor === preset.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                  
                  {/* Custom Hex Input */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-10 h-10 rounded-full border-2 border-[#1e293b] overflow-hidden relative">
                      <input 
                        type="color" 
                        value={draftSettings.primaryColor}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={draftSettings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-24 bg-[#030814]/50 border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#14f195]/50 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={draftSettings.backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                    <input type="text" value={draftSettings.backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Surface/Cards</label>
                  <div className="flex items-center gap-2">
                    {/* Note: rgba colors don't work well with <input type="color">, keeping as text input for advanced users */}
                    <input type="text" value={draftSettings.surfaceColor} onChange={(e) => handleChange('surfaceColor', e.target.value)} className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Primary Text</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={draftSettings.textColor} onChange={(e) => handleChange('textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                    <input type="text" value={draftSettings.textColor} onChange={(e) => handleChange('textColor', e.target.value)} className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-1 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1e293b]">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#14f195] animate-pulse" /> Live Preview
              </h3>
            </div>
            
            {/* The actual preview window - isolates CSS variables and dir */}
            <div 
              className={`portfolio-theme-root w-full h-[450px] overflow-hidden relative`}
              data-portfolio-theme={draftSettings.theme || 'dark'}
              dir={isRtl ? 'rtl' : 'ltr'}
              style={{
                '--portfolio-primary': draftSettings.primaryColor,
                '--portfolio-background': draftSettings.backgroundColor,
                '--portfolio-surface': draftSettings.surfaceColor,
                '--portfolio-text': draftSettings.textColor,
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {/* Fake Browser Chrome */}
              <div className="w-full h-full bg-[var(--theme-bg)] flex flex-col p-4 transition-colors duration-300 relative text-[var(--theme-text)]">
                
                {/* Navbar mock */}
                <div className="flex items-center justify-between py-3 border-b border-[var(--theme-border)]">
                  <div className="font-bold">Abdelrahman</div>
                  <div className="flex gap-3">
                    <div className="w-12 h-2 bg-[var(--theme-text-muted)] rounded-full opacity-50"></div>
                    <div className="w-12 h-2 bg-[var(--theme-text-muted)] rounded-full opacity-50"></div>
                  </div>
                </div>

                {/* Hero Content mock */}
                <div className="flex-1 flex flex-col justify-center items-start gap-4 mt-8">
                  <div className="px-3 py-1 border border-[var(--theme-border-gold)] text-[var(--theme-accent)] text-[10px] font-mono rounded-md inline-block uppercase tracking-widest">
                    {isRtl ? 'مهندس سحابي' : 'Cloud Engineer'}
                  </div>
                  
                  <h1 className="text-3xl font-black leading-tight">
                    {isRtl ? 'تحويل الأفكار إلى' : 'Transforming ideas into'} <br/>
                    <span className="text-[var(--theme-accent)]">
                      {isRtl ? 'أنظمة قابلة للتوسع' : 'scalable systems.'}
                    </span>
                  </h1>
                  
                  <p className="text-[var(--theme-text-muted)] text-sm max-w-[200px] leading-relaxed mt-2">
                    {isRtl 
                      ? 'أعمل على أتمتة البنية التحتية وبناء حلول سحابية بشغف.' 
                      : 'Automating infrastructure and building scalable cloud solutions with passion.'}
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="px-4 py-2 bg-[var(--theme-accent)] text-[#fffefe] rounded-md font-bold text-xs shadow-[var(--theme-shadow-strong)]">
                      {isRtl ? 'المشاريع' : 'View Projects'}
                    </div>
                    <div className="px-4 py-2 bg-transparent border border-[var(--theme-border)] rounded-md font-bold text-xs">
                      {isRtl ? 'تواصل معي' : 'Contact Me'}
                    </div>
                  </div>
                </div>

                {/* Card Mock */}
                <div className="absolute bottom-4 left-4 right-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] p-4 rounded-xl shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[var(--theme-accent-soft)] border border-[var(--theme-border-gold)]"></div>
                    <div>
                      <div className="w-24 h-3 bg-[currentColor] rounded mb-2 opacity-80"></div>
                      <div className="w-32 h-2 bg-[var(--theme-text-muted)] rounded"></div>
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

export default AppearanceManager;
