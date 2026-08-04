import React from 'react';
import { Database, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const EnterpriseEmptyState = ({ 
  icon: Icon = Database, 
  title = 'No Data Found', 
  description = 'There are no items to display in this view.', 
  actionLabel, 
  onAction 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/10 rounded-2xl bg-[#111827]/50"
    >
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-inner">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 bg-cms-primary text-black font-bold rounded-lg hover:bg-[#12d684] transition-colors shadow-[0_0_20px_rgba(20,241,149,0.2)]"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EnterpriseEmptyState;
