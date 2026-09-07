import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useFirestoreSingleDoc } from '../../../cms/hooks/useFirestoreSingleDoc';
import { 
  User, Settings, Palette, LogOut, ChevronDown, Shield, Keyboard, Key
} from 'lucide-react';

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Administrator',
  editor: 'Editor',
  viewer: 'Viewer'
};

const DropdownMenu = ({ isOpen, onClose, anchorRef, onLogout, user, role }) => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const safeRight = Math.max(16, window.innerWidth - rect.right);
      setCoords({
        top: rect.bottom + 8,
        right: safeRight
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
    { label: 'My Profile', icon: User, path: '/admin/profile' },
    { label: 'Security', icon: Shield, path: '/admin/account' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
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
        className="fixed w-[280px] bg-[#050914]/95 backdrop-blur-xl border border-[#1e2d42] rounded-xl shadow-2xl overflow-hidden z-[9999] flex flex-col max-w-[calc(100vw-32px)]"
      >
        <div className="p-4 border-b border-[#1e2d42] bg-[#0b1120]/50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#050914] border border-[#1e2d42] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{(user?.displayName || user?.email || 'A')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-bold text-sm leading-tight break-words pr-2">{user?.displayName || user?.email?.split('@')[0] || 'Admin Account'}</h4>
            <div className="flex flex-col gap-1.5 mt-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#14f195] bg-[#14f195]/10 px-1.5 py-0.5 rounded border border-[#14f195]/20 self-start">
                {ROLE_LABELS[role] || 'Viewer'}
              </span>
              <p className="text-[11px] text-[#4b6385] truncate pr-2" title={user?.email}>{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="p-2">
          {shortcuts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.path) navigate(item.path);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
          <div className="my-1 border-t border-[#1e2d42]"></div>
          <button 
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </>,
    document.body
  );
};

const UserDropdown = ({ onLogout }) => {
  const { user } = useAuth();
  const { data: adminData, subscribe } = useFirestoreSingleDoc('admins', user?.uid);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    let unsub;
    if (user?.uid) {
      unsub = subscribe();
    }
    return () => { if (unsub) unsub(); };
  }, [user?.uid, subscribe]);

  const role = adminData?.role || 'viewer';

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 p-1.5 md:pr-4 rounded-full transition-colors border outline-none focus-visible:ring-2 focus-visible:ring-[#14f195]/50 ${isOpen ? 'bg-[#0f172a] border-[#1e2d42]' : 'hover:bg-[#0f172a] border-transparent hover:border-[#1e2d42]'}`}
      >
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#14f195]/30 to-blue-500/30 blur-[3px] opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative w-8 h-8 md:w-[38px] md:h-[38px] rounded-full bg-[#050914] flex items-center justify-center text-white font-black text-sm border border-white/10 shadow-inner overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span>{(user?.displayName || user?.email || 'A')[0].toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="hidden md:flex flex-col items-start min-w-0">
          <span className="text-[13px] font-bold text-white leading-none mb-1 truncate max-w-[150px]" title={user?.displayName || user?.email || 'Admin Account'}>
            {user?.displayName || user?.email?.split('@')[0] || 'Admin Account'}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#14f195] leading-none">
            {ROLE_LABELS[role] || 'Viewer'}
          </span>
        </div>
        <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-500 ml-1 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        <DropdownMenu 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          anchorRef={buttonRef}
          onLogout={onLogout}
          user={user}
          role={role}
        />
      </AnimatePresence>
    </>
  );
};

export default UserDropdown;
