import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Database, Cloud, GitBranch, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { checkSystemHealth } from '../../../utils/systemHealth';

const SystemDiagnosticsModal = ({ isOpen, onClose, initialServiceKey }) => {
  const [healthData, setHealthData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState(initialServiceKey || 'firestore');

  useEffect(() => {
    if (isOpen) {
      if (initialServiceKey) setSelectedService(initialServiceKey);
      fetchDiagnostics();
    }
  }, [isOpen, initialServiceKey]);

  const fetchDiagnostics = async () => {
    setIsRefreshing(true);
    try {
      const data = await checkSystemHealth();
      setHealthData(data);
    } catch (err) {
      console.error(err);
    }
    setIsRefreshing(false);
  };

  if (!isOpen) return null;

  const getIcon = (key) => {
    switch (key) {
      case 'firestore': return <Database className="w-5 h-5" />;
      case 'vercel': return <Cloud className="w-5 h-5" />;
      case 'github': return <GitBranch className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const currentInfo = healthData?.[selectedService] || { status: 'unknown', latency: 0, label: 'Unknown' };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-10">
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
          className="relative w-full max-w-4xl bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[500px]"
        >
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#111827] flex flex-col">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Services</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {healthData && Object.entries(healthData).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedService(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedService === key ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className={`${selectedService === key ? 'text-white' : 'text-gray-500'}`}>
                    {getIcon(key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${selectedService === key ? 'text-white' : 'text-gray-400'}`}>{info.label}</p>
                    <p className="text-xs text-gray-500">
                      {info.status === 'online' ? 'Operational' : 
                       info.status === 'configured' ? 'Configured' :
                       info.status === 'unconfigured' ? 'Not Configured' :
                       info.status === 'unmonitored' ? 'Not Monitored' :
                       'Degraded'}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${info.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : info.status === 'configured' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : info.status === 'unmonitored' ? 'bg-gray-500 shadow-[0_0_8px_#6b7280]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-[#0a0f1c] min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-white/[0.02] gap-4 sm:gap-0 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border ${currentInfo.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : currentInfo.status === 'configured' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : currentInfo.status === 'unmonitored' ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' : 'bg-cms-warning/10 border-cms-warning/20 text-cms-warning'}`}>
                  {getIcon(selectedService)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug sm:leading-normal break-words">{currentInfo.label} Diagnostics</h2>
                  <p className="text-xs sm:text-sm flex items-center gap-2 mt-0.5 sm:mt-0">
                    <span className="text-gray-500 shrink-0">Status:</span>
                    <span className={`font-bold truncate ${currentInfo.status === 'online' ? 'text-emerald-400' : currentInfo.status === 'configured' ? 'text-blue-400' : currentInfo.status === 'unmonitored' ? 'text-gray-400' : 'text-red-400'}`}>
                      {currentInfo.status === 'online' ? 'Operational' : 
                       currentInfo.status === 'configured' ? 'Configured' :
                       currentInfo.status === 'unconfigured' ? 'Not Configured' :
                       currentInfo.status === 'unmonitored' ? 'Not Monitored' :
                       'Degraded'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button 
                  onClick={fetchDiagnostics}
                  disabled={isRefreshing}
                  aria-label="Refresh diagnostics"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button 
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              {isRefreshing && !healthData ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-cms-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  {selectedService === 'firestore' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-5 bg-[#111827] border border-white/5 rounded-xl">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Ping Latency</p>
                        <p className="text-3xl font-black text-white">{currentInfo.latency} <span className="text-lg text-gray-500">ms</span></p>
                      </div>
                    </div>
                  )}
                  
                  {/* Detailed Log */}
                  <div className="p-5 bg-black/40 border border-white/5 rounded-xl text-sm">
                    <p className="text-gray-500 mb-4 border-b border-white/5 pb-2">Diagnostic Details</p>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <span className="text-gray-300">
                          {selectedService === 'firestore' ? 'Live database query' :
                           selectedService === 'cloudinary' ? 'Client configuration check' :
                           'Not monitored'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SystemDiagnosticsModal;
