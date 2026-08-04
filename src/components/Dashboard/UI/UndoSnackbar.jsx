import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const UndoSnackbar = ({ isOpen, message, onUndo, onDismiss, duration = 5000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-cms-cards border border-white/10 px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <span className="text-sm font-medium text-white">{message}</span>
          <div className="w-px h-4 bg-white/20"></div>
          <button 
            onClick={() => {
              onUndo();
              onDismiss();
            }}
            className="flex items-center gap-1.5 text-sm font-bold text-cms-primary hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UndoSnackbar;
