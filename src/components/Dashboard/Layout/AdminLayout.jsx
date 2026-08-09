import React, { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from '../Sidebar';
import Topbar from './Topbar';
import { DashboardProvider } from '../../../context/DashboardContext';
import { GlobalSearch } from './GlobalSearch';
import { destroyLenis, initLenis } from '../../../utils/smoothScroll';

const AdminLayoutContent = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Lenis smooth scroll must not run inside the Dashboard — it intercepts
  // ALL wheel/touch events globally and prevents our scroll containers from working.
  useEffect(() => {
    destroyLenis();
    return () => {
      // Restore Lenis when user navigates back to the public portfolio
      initLenis();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Logged out securely');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  }, [logout, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derive title from path for now
  const pathTitleMap = {
    '/admin/overview': 'Dashboard Overview',
    '/admin/analytics': 'Analytics',
    '/admin/projects': 'Projects',
    '/admin/skills': 'Skills & Tools',
    '/admin/certifications': 'Certifications',
    '/admin/socials': 'Social Links',
    '/admin/navbar': 'Navbar Menu',
    '/admin/home': 'Hero Section',
    '/admin/about': 'About Section',
    '/admin/journey': 'Journey',
    '/admin/contact': 'Contact Info',
    '/admin/profile': 'Profile',
    '/admin/account': 'Account Center',
    '/admin/appearance': 'Appearance',
    '/admin/activity': 'Activity',
    '/admin/apikeys': 'API Keys',
    '/admin/settings': 'Settings',
    '/admin/shortcuts': 'Keyboard Shortcuts',
    '/admin/devtools': 'Developer Tools',
  };

  const currentTitle = pathTitleMap[location.pathname] || 'Dashboard';

  return (
    <div className="bg-cms-background text-white flex h-screen overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`flex-1 min-w-0 min-h-0 flex flex-col h-full transition-[margin] duration-300 ${isCollapsed ? 'ml-[80px]' : 'ml-[280px]'}`}>
        <Topbar title={currentTitle} onLogout={handleLogout} onSearchClick={() => setSearchOpen(true)} />

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-8 pb-32 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <DashboardProvider>
      <AdminLayoutContent />
    </DashboardProvider>
  );
};

export default AdminLayout;
