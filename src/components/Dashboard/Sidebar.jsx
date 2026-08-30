import React, { memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, Code, Terminal, User, BookOpen, LogOut, Home, 
  Info, Award, Phone, BarChart3, Navigation, Link as LinkIcon, 
  ChevronLeft, Settings, Database, Activity, LayoutDashboard 
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const MENU_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin/overview' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    ]
  },
  {
    label: 'Content',
    items: [
      { id: 'home', label: 'Hero Section', icon: Home, path: '/admin/home' },
      { id: 'about', label: 'About Section', icon: Info, path: '/admin/about' },
      { id: 'journey', label: 'Journey', icon: Terminal, path: '/admin/journey' },
      { id: 'contact', label: 'Contact Info', icon: Phone, path: '/admin/contact' },
    ]
  },
  {
    label: 'Collections',
    items: [
      { id: 'projects', label: 'Projects', icon: Briefcase, path: '/admin/projects' },
      { id: 'skills', label: 'Skills', icon: Code, path: '/admin/skills' },
      { id: 'certifications', label: 'Certifications', icon: Award, path: '/admin/certifications' },
      { id: 'socials', label: 'Social Links', icon: LinkIcon, path: '/admin/socials' },
      { id: 'navbar', label: 'Navbar Menu', icon: Navigation, path: '/admin/navbar' },
    ]
  },
  {
    label: 'Settings',
    items: [
      { id: 'profile', label: 'Account Center', icon: User, path: '/admin/profile' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
      { id: 'media', label: 'Media Library', icon: Database, path: '/admin/media' },
      ...(import.meta.env.DEV ? [{ id: 'devtools', label: 'Developer Tools', icon: Code, path: '/admin/devtools', dev: true }] : [])
    ]
  }
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const { counts, pendingTasks } = useDashboard();

  return (

    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>
      <aside
        className={`bg-cms-sidebar border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-2xl duration-300 transition-all w-[280px] ${isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-cms-background/30 backdrop-blur-md shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-cms-primary to-cms-secondary rounded-lg flex items-center justify-center shadow-glow-primary">
                <span className="text-cms-background font-black text-xl">A</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">Admin<span className="text-cms-primary">OS</span></span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-cms-primary to-cms-secondary rounded-lg flex items-center justify-center shadow-glow-primary">
                <span className="text-cms-background font-black text-xl">A</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-cms-cards border border-white/10 rounded-full items-center justify-center text-gray-400 hover:text-white hover:border-cms-primary hover:shadow-glow-primary transition-all z-50"
      >
        <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar min-h-0 py-6 px-3"
        style={{ overscrollBehavior: 'contain' }}
      >
        {MENU_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6 last:mb-0">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 mb-2 text-xs font-bold uppercase tracking-widest text-gray-500"
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-1">
              {group.items.map((tab) => {
                const isActive = location.pathname.startsWith(tab.path);
                const Icon = tab.icon;
                
                // Get badge count if applicable
                let badgeCount = 0;
                if (tab.id === 'overview' && counts) {
                  badgeCount = (pendingTasks || []).length;
                } else if (counts && counts[tab.id] !== undefined) {
                  badgeCount = counts[tab.id];
                }
                
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`
                      w-full flex items-center justify-between transition-all duration-200 rounded-xl group relative outline-none
                      ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'}
                      ${isActive 
                        ? 'bg-cms-primary/10 text-cms-primary' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active-indicator"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-cms-primary rounded-r-full shadow-glow-primary ${isCollapsed ? 'h-8' : 'h-6'}`}
                      />
                    )}
                    
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`
                        shrink-0 transition-colors duration-200
                        ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
                        ${isActive ? 'text-cms-primary' : 'text-gray-500 group-hover:text-gray-300'}
                        ${tab.dev && !isActive ? 'text-cms-warning/50' : ''}
                      `} />
                      
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="font-medium text-sm whitespace-nowrap overflow-hidden truncate"
                          >
                            {tab.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {!isCollapsed && badgeCount > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-cms-primary/20 text-cms-primary' : 'bg-white/5 text-gray-500'}`}>
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Info */}
      <div className="p-4 border-t border-white/5 bg-cms-background/30 shrink-0">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cms-success animate-pulse shadow-[0_0_8px_#10B981]"></div>
                <span className="text-xs font-semibold text-gray-400">System Normal</span>
              </div>
              <span className="text-[10px] font-mono text-gray-600 border border-white/5 bg-white/5 px-2 py-0.5 rounded">v2.5.0</span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-cms-success animate-pulse shadow-[0_0_8px_#10B981]"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
    </>
  );
};

export default memo(Sidebar);

