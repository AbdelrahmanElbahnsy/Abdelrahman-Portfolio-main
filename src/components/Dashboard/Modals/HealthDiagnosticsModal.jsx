import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HealthDiagnosticsModal = ({ isOpen, onClose, score, diagnostics }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

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
          className="relative w-full max-w-2xl bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${score === 100 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-cms-warning/10 border-cms-warning/20 text-cms-warning'}`}>
                {score === 100 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Health Diagnostics</h2>
                <p className="text-sm text-gray-500">Current Portfolio Completion Score: <strong className={score === 100 ? 'text-emerald-400' : 'text-cms-warning'}>{score}%</strong></p>
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
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0a0f1c]">
            {diagnostics?.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-6">The following issues are reducing your total portfolio quality score. Fix them to achieve an Enterprise-grade 100% rating.</p>
                {diagnostics.map((diag, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#111827] border border-white/5 rounded-xl hover:border-cms-warning/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-cms-warning/10 flex items-center justify-center text-cms-warning font-bold text-xs">
                        -{diag.penalty}
                      </div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{diag.label}</p>
                    </div>
                    <button 
                      onClick={() => {
                        onClose();
                        navigate(diag.link);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      Resolve <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-6">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Perfect Score</h3>
                <p className="text-gray-400 text-center max-w-sm">Your portfolio is fully optimized, completely populated, and all external systems are online.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Close Diagnostics
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HealthDiagnosticsModal;
