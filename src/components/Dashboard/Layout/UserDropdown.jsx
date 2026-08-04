import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
  User, Settings, Activity, Palette, LogOut, ChevronDown, Shield, Keyboard
} from 'lucide-react';

const DropdownMenu = ({ isOpen, onClose, anchorRef, onLogout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const shortcuts = [
    { label: 'Profile', icon: User, path: '/admin/profile' },
    { label: 'Account Center', icon: Settings, path: '/admin/account' },
    { label: 'Appearance', icon: Palette, path: '/admin/appearance' },
    { label: 'Activity', icon: Activity, path: '/admin/activity' },
    { label: 'API Keys', icon: Shield, path: '/admin/apikeys' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
    { label: 'Keyboard Shortcuts', icon: Keyboard, path: '/admin/shortcuts' },
  ];

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ top: coords.top, right: coords.right }}
        className="fixed w-64 bg-cms-cards/95 backdrop-blur-xl border border-cms-border rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden z-[9999]"
      >
        <div className="p-3 border-b border-cms-border bg-white/[0.01]">
          <h4 className="text-cms-text font-bold text-sm truncate">{user?.email || 'Admin User'}</h4>
          <p className="text-xs text-cms-muted">Workspace Owner</p>
        </div>
        <div className="p-1.5">
          {shortcuts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.path) navigate(item.path);
                if (item.action) item.action();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cms-muted hover:text-cms-text hover:bg-white/5 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <div className="my-1 border-t border-cms-border"></div>
          <button 
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cms-danger hover:bg-cms-danger/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.div>
    </>,
    document.body
  );
};

const UserDropdown = ({ onLogout }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-colors border outline-none focus-visible:ring-2 focus-visible:ring-cms-primary ${isOpen ? 'bg-white/5 border-white/10' : 'hover:bg-white/5 border-transparent hover:border-white/10'}`}
      >
        <div className="w-8 h-8 rounded-full bg-cms-secondary flex items-center justify-center text-cms-primary font-bold text-sm border border-cms-border">
          {user?.email?.[0].toUpperCase() || 'A'}
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-semibold text-cms-text leading-none mb-1">
            {user?.email?.split('@')[0] || 'Admin'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-cms-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        <DropdownMenu 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          anchorRef={buttonRef}
          onLogout={onLogout}
        />
      </AnimatePresence>
    </>
  );
};

export default UserDropdown;
