import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Eye, FileText, AlertCircle, Settings } from 'lucide-react';

const AnalyticsIntegrationModal = ({ isOpen, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleConfigure = () => {
    setShowError(true);
  };

  const providers = {
    google: {
      id: 'google',
      name: 'Google Analytics 4',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/30',
      description: 'Enterprise-grade traffic analysis and audience demographic tracking.',
      useful: 'Essential for understanding where your visitors come from, how long they stay, and which portfolio pieces get the most engagement.',
      configure: 'Requires setting up a GA4 Property ID (G-XXXXXXX) and securely injecting it via environment variables.'
    },
    clarity: {
      id: 'clarity',
      name: 'Microsoft Clarity',
      icon: <Eye className="w-6 h-6" />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/30',
      description: 'Free session recording and heatmaps to see exactly how users interact with your portfolio.',
      useful: 'Reveals UX bottlenecks by showing literal screen recordings of visitors trying to navigate your projects.',
      configure: 'Requires a Microsoft Clarity Project ID and script injection in the index.html head.'
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-10">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-cms-cards border border-cms-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-cms-border bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cms-primary/10 rounded-xl flex items-center justify-center text-cms-primary border border-cms-primary/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Analytics Integration</h2>
                <p className="text-sm text-cms-muted">Configure external tracking services</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar selection */}
            <div className="w-full md:w-64 border-r border-cms-border bg-black/20 p-4 space-y-2 flex-shrink-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Providers</p>
              {Object.values(providers).map(provider => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setShowError(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedProvider === provider.id 
                      ? `${provider.bg} ${provider.border} ${provider.color}` 
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {provider.icon}
                  <span className="font-semibold text-sm">{provider.name}</span>
                </button>
              ))}
            </div>

            {/* Provider Details */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-white mb-2">{providers[selectedProvider].name}</h3>
                <p className="text-gray-300">{providers[selectedProvider].description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Why it's useful</h4>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 leading-relaxed">
                    {providers[selectedProvider].useful}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">How to configure</h4>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 leading-relaxed flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>{providers[selectedProvider].configure}</span>
                  </div>
                </div>

                {/* Simulated Error Message */}
                <AnimatePresence>
                  {showError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-cms-danger/10 border border-cms-danger/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-cms-danger shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-bold text-red-400 mb-1">Configuration Unavailable</h5>
                          <p className="text-xs text-red-400/80 leading-relaxed">
                            Backend support for injecting API keys dynamically is currently missing. 
                            This feature requires a Firebase Cloud Function or automated CI/CD injection, 
                            which is scheduled for a future Enterprise release.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cms-border bg-white/[0.02] flex items-center justify-between">
            <a 
              href={selectedProvider === 'google' ? 'https://analytics.google.com' : 'https://clarity.microsoft.com'} 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Documentation
            </a>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfigure}
                className="px-6 py-2 bg-cms-primary hover:bg-cms-primary/90 text-cms-background font-bold rounded-lg transition-colors text-sm shadow-glow-primary"
              >
                Configure
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsIntegrationModal;
