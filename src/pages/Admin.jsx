import React, { useState, lazy, Suspense, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from '../components/Dashboard/Sidebar';

// Lazy loaded dashboard sections for bundle optimization
const AnalyticsDashboard = lazy(() => import('../components/Dashboard/AnalyticsDashboard'));
const ProjectsManager = lazy(() => import('../components/Dashboard/ProjectsManager'));
const ProfileManager = lazy(() => import('../components/Dashboard/ProfileManager'));
const GenericListManager = lazy(() => import('../components/Dashboard/GenericListManager'));
const SingleDocManager = lazy(() => import('../components/Dashboard/SingleDocManager'));

const SectionSkeleton = () => (
  <div className="w-full space-y-6 animate-pulse p-6">
    <div className="h-10 w-48 bg-[#1e293b] rounded-lg"></div>
    <div className="h-64 bg-[#131b2c] border border-[#1e293b] rounded-2xl"></div>
    <div className="h-64 bg-[#131b2c] border border-[#1e293b] rounded-2xl"></div>
  </div>
);

// Map definitions completely outside render to prevent recreation overhead
const TABS_CONFIG = {
  analytics: { component: AnalyticsDashboard },
  home: { 
    component: SingleDocManager, 
    props: { title: "Hero Header", collection: "content", docId: "home", fields: [
      {name: 'title', label: 'Main Title'}, {name: 'subtitle', label: 'Subtitle / Role'}, {name: 'description', label: 'Hero Description', type: 'textarea'}
    ]}
  },
  about: { 
    component: SingleDocManager, 
    props: { title: "About Section", collection: "content", docId: "about", fields: [
      {name: 'title', label: 'Section Title'}, {name: 'bio', label: 'About me text (Bio)', type: 'textarea'}
    ]}
  },
  contact: { 
    component: SingleDocManager, 
    props: { title: "Contact Info", collection: "content", docId: "contact", fields: [
      {name: 'email', label: 'Contact Email', type: 'email'}, {name: 'phone', label: 'Phone Number'}, {name: 'location', label: 'Location / Address'}
    ]}
  },
  projects: { component: ProjectsManager },
  navbar: { 
    component: GenericListManager, 
    props: { title: "Navbar Links", collectionName: "navbarItems", fields: [
      {name: 'label', label: 'Link Text'}, {name: 'href', label: 'Path / URL'}, {name: 'order', label: 'Display Order', type: 'number'}
    ]}
  },
  skills: { 
    component: GenericListManager, 
    props: { title: "Skills & Tools", collectionName: "skills", fields: [
      {name: 'name', label: 'Skill Name'}, {name: 'category', label: 'Category'}, {name: 'level', label: 'Level'}
    ]}
  },
  certifications: { 
    component: GenericListManager, 
    props: { title: "Certifications", collectionName: "certifications", fields: [
      {name: 'title', label: 'Certificate Title'}, {name: 'issuer', label: 'Issuing Organization'}, {name: 'link', label: 'Credential URL', type: 'url'}
    ]}
  },
  socials: { 
    component: GenericListManager, 
    props: { title: "Social Accounts", collectionName: "socials", fields: [
      {name: 'platform', label: 'Platform (GitHub, LinkedIn)'}, {name: 'url', label: 'Profile URL', type: 'url'}, {name: 'icon', label: 'Icon Name'}
    ]}
  },
  profile: { component: ProfileManager }
};

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('analytics');
  // TAB CACHING MECHANISM: Store which tabs have been rendered to prevent unmount/remount
  const [mountedTabs, setMountedTabs] = useState(['analytics']);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setMountedTabs(prev => {
      if (!prev.includes(tabId)) return [...prev, tabId];
      return prev;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Logged out securely');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#131b2c', color: '#fff', border: '1px solid #1e293b' } }} />
      
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} handleLogout={handleLogout} />

      <main className="flex-1 ml-64 flex flex-col h-screen relative">
        <header className="flex-shrink-0 flex justify-between items-center px-8 py-6 border-b border-[#1e293b] bg-[#0a0f1c] z-10 sticky top-0">
          <div>
             <h1 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Dashboard System</h1>
             <p className="text-2xl font-black mt-1 text-white flex items-center gap-2">Live Control <span className="w-2 h-2 rounded-full bg-[#14f195] animate-pulse"/></p>
          </div>
          <div className="bg-[#1e293b]/50 border border-[#1e293b] px-4 py-2 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-[#14f195] rounded-full"></div>
            {user?.email || 'Admin'}
          </div>
        </header>

        {/* Caching Viewport */}
        <div className="flex-1 overflow-y-auto w-full p-8 pb-32">
          {mountedTabs.map((tabId) => {
            const TabConfig = TABS_CONFIG[tabId];
            if (!TabConfig) return null;
            
            const Component = TabConfig.component;
            
            return (
              <div 
                key={tabId} 
                className={activeTab === tabId ? 'block animate-in fade-in duration-300' : 'hidden'} 
                aria-hidden={activeTab !== tabId}
              >
                <Suspense fallback={<SectionSkeleton />}>
                   <Component {...(TabConfig.props || {})} />
                </Suspense>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default memo(Admin);
