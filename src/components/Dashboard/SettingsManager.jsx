import React, { useState, useEffect, useCallback } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { checkSystemHealth } from '../../utils/systemHealth';
import toast, { Toaster } from 'react-hot-toast';
import {
  Settings, Save, Moon, Sun, Trash2, AlertTriangle, 
  RefreshCw, CheckCircle2, ShieldAlert, Server, Globe
} from 'lucide-react';

const PageSection = ({ title, subtitle, children, className = '' }) => (
  <section className={`space-y-4 ${className}`}>
    <div className="flex items-baseline gap-3">
      <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 font-mono hidden sm:block">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, helper, isMonospace, disabled }) => (
  <div className="w-full">
    <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={`w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isMonospace ? 'font-mono text-sm' : ''}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isMonospace ? 'font-mono text-sm' : ''}`}
      />
    )}
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto border border-red-500/20">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} className="w-full sm:w-1/2 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white bg-[#1e293b] hover:bg-[#293548] transition-colors text-sm">Cancel</button>
          <button onClick={onConfirm} className="w-full sm:w-1/2 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm shadow-lg shadow-red-500/20">Clear Cache</button>
        </div>
      </div>
    </div>
  );
};

export default function SettingsManager() {
  const { data: settingsData, setDocData, subscribe } = useFirestoreSingleDoc('settings', 'general');
  const [formData, setFormData] = useState({ siteTitle: '', siteDescription: '', theme: 'dark', portfolioEnabled: true });
  const [isSaving, setIsSaving] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [showCacheConfirm, setShowCacheConfirm] = useState(false);

  // Subscribe to settings document
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // Update form data when firestore data loads/updates
  useEffect(() => {
    if (settingsData) {
      setFormData({
        siteTitle: settingsData.siteTitle || '',
        siteDescription: settingsData.siteDescription || '',
        theme: settingsData.theme || 'dark',
        portfolioEnabled: settingsData.portfolioEnabled !== false
      });
    }
  }, [settingsData]);

  const fetchHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const status = await checkSystemHealth();
      setHealthStatus(status);
    } catch (err) {
      toast.error('Failed to fetch system diagnostics');
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDocData(formData);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('portfolio-appearance-cache');
      localStorage.removeItem('portfolio-language');
      localStorage.removeItem('visitor-preferences');
      toast.success('Local cache cleared successfully');
      setShowCacheConfirm(false);
      // Optional: Wait a brief moment before reload to allow user to read the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const isDirty = settingsData && (
    settingsData.siteTitle !== formData.siteTitle ||
    settingsData.siteDescription !== formData.siteDescription ||
    settingsData.theme !== formData.theme ||
    (settingsData.portfolioEnabled !== false) !== formData.portfolioEnabled
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      <Toaster position="top-right" toastOptions={{ style: { background: '#131b2c', color: '#fff', border: '1px solid #1e293b' } }} />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#1e293b] pb-6">
        <div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center border border-[#334155]">
          <Settings className="w-6 h-6 text-[#14f195]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-sm font-mono text-gray-400">Workspace preferences &amp; system configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* GENERAL PREFERENCES */}
          <PageSection title="General Preferences" subtitle="Global site identity">
            <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden p-6 space-y-6">
              <InputField
                label="Site Title"
                name="siteTitle"
                value={formData.siteTitle}
                onChange={handleChange}
                placeholder="e.g. My Portfolio"
                helper="The global title used for the site meta tag."
              />
              <InputField
                label="Site Description"
                name="siteDescription"
                type="textarea"
                value={formData.siteDescription}
                onChange={handleChange}
                placeholder="Brief description of the portfolio..."
                helper="Used for SEO and social sharing descriptions."
              />
              <div className="flex justify-end pt-2 border-t border-[#1e293b]">
                <button
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#14f195]/10"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </PageSection>

          {/* PORTFOLIO AVAILABILITY */}
          <PageSection title="Portfolio Availability" subtitle="Public visibility control">
            <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <h3 className="text-white font-bold text-lg mb-1">Portfolio Status</h3>
                  <p className="text-sm text-gray-400">
                    {formData.portfolioEnabled 
                      ? "The public portfolio is currently online and accessible."
                      : "The public portfolio is offline. Visitors see a maintenance screen."}
                  </p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, portfolioEnabled: !formData.portfolioEnabled })}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors ${
                    formData.portfolioEnabled ? 'bg-[#14f195]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      formData.portfolioEnabled ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1e293b]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-[#222]">
                  <div className={`w-2 h-2 rounded-full ${formData.portfolioEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${formData.portfolioEnabled ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formData.portfolioEnabled ? 'Portfolio Online' : 'Portfolio Offline'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Note: Make sure to save changes for the status to update globally.
                </p>
              </div>
            </div>
          </PageSection>

          {/* GLOBAL APPEARANCE */}
          <PageSection title="Global Appearance" subtitle="Default UI theme">
            <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-6">
              <label className="block text-[11px] font-mono font-bold text-gray-400 mb-4 uppercase tracking-widest">
                Default Theme
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, theme: 'dark' })}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.theme === 'dark'
                      ? 'bg-[#14f195]/10 border-[#14f195] text-[#14f195]'
                      : 'bg-[#030814]/50 border-[#1e293b] text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-sm font-bold">Dark Mode</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, theme: 'light' })}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.theme === 'light'
                      ? 'bg-[#14f195]/10 border-[#14f195] text-[#14f195]'
                      : 'bg-[#030814]/50 border-[#1e293b] text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-sm font-bold">Light Mode</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                This sets the initial theme for new visitors. Users can still toggle the theme locally. Note: Make sure to save changes.
              </p>
            </div>
          </PageSection>
        </div>

        <div className="space-y-8">
          {/* SYSTEM DIAGNOSTICS */}
          <PageSection title="System Diagnostics" subtitle="Read-only infrastructure health">
            <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden">
              <div className="p-6 space-y-4">
                {/* Firestore */}
                <div className="bg-[#0d1321] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center border border-[#334155]">
                      <Server className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Firestore DB</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                          healthStatus?.firestore?.status === 'online' 
                            ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/20'
                            : healthStatus?.firestore?.status === 'error'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {healthStatus?.firestore?.status || 'Checking...'}
                        </span>
                        {healthStatus?.firestore?.latency > 0 && (
                          <span className="text-xs text-gray-500 font-mono">
                            {healthStatus.firestore.latency}ms latency
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {healthStatus?.firestore?.status === 'online' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#14f195]" />
                  ) : healthStatus?.firestore?.status === 'error' ? (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
                  )}
                </div>

                {/* Cloudinary */}
                <div className="bg-[#0d1321] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center border border-[#334155]">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Cloudinary CDN</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                          healthStatus?.cloudinary?.status === 'configured' 
                            ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/20'
                            : healthStatus?.cloudinary?.status === 'warning'
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {healthStatus?.cloudinary?.status || 'Checking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {healthStatus?.cloudinary?.status === 'configured' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#14f195]" />
                  ) : healthStatus?.cloudinary?.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
                  )}
                </div>
              </div>
              <div className="bg-[#0d1321]/50 border-t border-[#1e293b] p-4 flex justify-end">
                <button
                  onClick={fetchHealth}
                  disabled={isCheckingHealth}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-[#1e293b] hover:bg-[#293548] border border-[#334155] rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                  Refresh Diagnostics
                </button>
              </div>
            </div>
          </PageSection>

          {/* DATA & CACHE */}
          <PageSection title="Data & Cache" subtitle="Local storage management">
            <div className="bg-[#0a0f1c] border border-red-900/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20 shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Clear Local Cache</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    This will purge cached appearance settings, language preferences, and visitor overrides from your local browser storage. It is completely safe and does NOT affect Firebase authentication, CMS content, or other users.
                  </p>
                  <button
                    onClick={() => setShowCacheConfirm(true)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 text-xs font-bold rounded-lg transition-all"
                  >
                    Clear Local Cache
                  </button>
                </div>
              </div>
            </div>
          </PageSection>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={showCacheConfirm}
        onClose={() => setShowCacheConfirm(false)}
        onConfirm={handleClearCache}
        title="Clear Local Cache?"
        message="Are you sure you want to clear your local preferences cache? The application will automatically reload to sync fresh settings from the server."
      />
    </div>
  );
}
