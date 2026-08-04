import React, { useState, useRef, useEffect } from 'react';
import { Plus, RefreshCw, Download, FileText, Code, Award, Terminal, Link as LinkIcon, Image as ImageIcon, Database } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDashboard } from '../../../context/DashboardContext';
import { crudService } from '../../../cms/services/crudService';

const DropdownMenu = ({ isOpen, onClose, anchorRef, items, title }) => {
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ top: coords.top, right: coords.right }}
        className="fixed w-56 bg-cms-cards/95 backdrop-blur-xl border border-cms-border rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden z-[9999]"
      >
        {title && (
          <div className="p-3 border-b border-cms-border bg-white/[0.01]">
            <h4 className="text-cms-text font-bold text-xs uppercase tracking-wider">{title}</h4>
          </div>
        )}
        <div className="p-1.5">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onClose();
                if (item.action) item.action();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cms-muted hover:text-cms-text hover:bg-white/5 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>
    </>,
    document.body
  );
};

const QuickActions = () => {
  const navigate = useNavigate();
  const { refreshDashboard, isRefetching } = useDashboard();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  
  const createRef = useRef(null);
  const exportRef = useRef(null);

  const handleSync = async () => {
    if (isRefetching) return;
    const toastId = toast.loading('Syncing dashboard data...');
    try {
      await refreshDashboard();
      toast.success('Dashboard synced successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to sync dashboard', { id: toastId });
    }
  };

  const handleExportJSON = async (collectionsToExport, filename) => {
    const toastId = toast.loading(`Exporting ${filename}...`);
    try {
      const exportData = {};
      for (const collection of collectionsToExport) {
        exportData[collection] = await crudService.getAll(collection);
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully', { id: toastId });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed: ' + err.message, { id: toastId });
    }
  };

  const createItems = [
    { label: 'Project', icon: FileText, action: () => navigate('/admin/projects') },
    { label: 'Skill', icon: Code, action: () => navigate('/admin/skills') },
    { label: 'Certificate', icon: Award, action: () => navigate('/admin/certifications') },
    { label: 'Journey Event', icon: Terminal, action: () => navigate('/admin/journey') },
    { label: 'Social Link', icon: LinkIcon, action: () => navigate('/admin/socials') },
  ];

  const exportItems = [
    { 
      label: 'Portfolio JSON', 
      icon: Download, 
      action: () => handleExportJSON(['projects', 'skills', 'certifications', 'journey', 'socials'], 'portfolio_export.json')
    },
    { 
      label: 'Firestore Snapshot', 
      icon: Database, 
      action: () => handleExportJSON(['projects', 'skills', 'certifications', 'journey', 'socials', 'navbarItems', 'hero', 'about', 'activityLog'], 'firestore_snapshot.json')
    },
  ];

  return (
    <div className="flex items-center gap-2 mr-2">
      <button 
        ref={createRef}
        onClick={() => setCreateOpen(!createOpen)}
        className={`p-2 rounded-xl transition-colors tooltip-trigger relative group outline-none focus-visible:ring-2 focus-visible:ring-cms-primary ${createOpen ? 'text-cms-primary bg-cms-primary/10' : 'text-gray-400 hover:text-cms-primary hover:bg-cms-primary/10'}`}
      >
        <Plus className="w-4 h-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-cms-cards border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Quick Create</span>
      </button>

      <button 
        onClick={handleSync}
        className={`p-2 text-gray-400 hover:text-cms-secondary hover:bg-cms-secondary/10 rounded-xl transition-colors tooltip-trigger relative group outline-none focus-visible:ring-2 focus-visible:ring-cms-secondary ${isRefetching ? 'text-cms-secondary bg-cms-secondary/10' : ''}`}
      >
        <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-cms-cards border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Sync Data</span>
      </button>

      <button 
        ref={exportRef}
        onClick={() => setExportOpen(!exportOpen)}
        className={`p-2 rounded-xl transition-colors tooltip-trigger relative group outline-none focus-visible:ring-2 focus-visible:ring-cms-warning ${exportOpen ? 'text-cms-warning bg-cms-warning/10' : 'text-gray-400 hover:text-cms-warning hover:bg-cms-warning/10'}`}
      >
        <Download className="w-4 h-4" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-cms-cards border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Export</span>
      </button>

      <AnimatePresence>
        <DropdownMenu 
          isOpen={createOpen} 
          onClose={() => setCreateOpen(false)} 
          anchorRef={createRef} 
          items={createItems}
          title="Create New"
        />
        <DropdownMenu 
          isOpen={exportOpen} 
          onClose={() => setExportOpen(false)} 
          anchorRef={exportRef} 
          items={exportItems}
          title="Export Options"
        />
      </AnimatePresence>
    </div>
  );
};

export default QuickActions;
