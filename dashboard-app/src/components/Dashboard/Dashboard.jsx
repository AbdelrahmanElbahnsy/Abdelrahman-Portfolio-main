import React, { Suspense, lazy, memo, useCallback, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './Sidebar';

const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const ProjectsManager = lazy(() => import('./ProjectsManager'));
const ProfileManager = lazy(() => import('./ProfileManager'));
const GenericListManager = lazy(() => import('./GenericListManager'));
const SingleDocManager = lazy(() => import('./SingleDocManager'));

const SectionSkeleton = () => (
  <div className="w-full animate-pulse space-y-6 p-6">
    <div className="h-10 w-48 rounded-lg bg-[#1e293b]" />
    <div className="h-64 rounded-2xl border border-[#1e293b] bg-[#131b2c]" />
    <div className="h-64 rounded-2xl border border-[#1e293b] bg-[#131b2c]" />
  </div>
);

const TABS_CONFIG = {
  analytics: { component: AnalyticsDashboard },
  home: {
    component: SingleDocManager,
    props: {
      title: 'Hero Header',
      collection: 'content',
      docId: 'home',
      fields: [
        { name: 'title', label: 'Main Title' },
        { name: 'subtitle', label: 'Subtitle / Role' },
        { name: 'description', label: 'Hero Description', type: 'textarea' },
      ],
    },
  },
  about: {
    component: SingleDocManager,
    props: {
      title: 'About Section',
      collection: 'content',
      docId: 'about',
      fields: [
        { name: 'title', label: 'Section Title' },
        { name: 'bio', label: 'About me text (Bio)', type: 'textarea' },
      ],
    },
  },
  contact: {
    component: SingleDocManager,
    props: {
      title: 'Contact Info',
      collection: 'content',
      docId: 'contact',
      fields: [
        { name: 'email', label: 'Contact Email', type: 'email' },
        { name: 'phone', label: 'Phone Number' },
        { name: 'location', label: 'Location / Address' },
      ],
    },
  },
  projects: { component: ProjectsManager },
  navbar: {
    component: GenericListManager,
    props: {
      title: 'Navbar Links',
      collectionName: 'navbarItems',
      fields: [
        { name: 'label', label: 'Link Text' },
        { name: 'href', label: 'Path / URL' },
        { name: 'order', label: 'Display Order', type: 'number' },
      ],
    },
  },
  skills: {
    component: GenericListManager,
    props: {
      title: 'Skills & Tools',
      collectionName: 'skills',
      fields: [
        { name: 'name', label: 'Skill Name' },
        { name: 'category', label: 'Category' },
        { name: 'level', label: 'Level' },
      ],
    },
  },
  certifications: {
    component: GenericListManager,
    props: {
      title: 'Certifications',
      collectionName: 'certifications',
      fields: [
        { name: 'title', label: 'Certificate Title' },
        { name: 'issuer', label: 'Issuing Organization' },
        { name: 'link', label: 'Credential URL', type: 'url' },
      ],
    },
  },
  socials: {
    component: GenericListManager,
    props: {
      title: 'Social Accounts',
      collectionName: 'socials',
      fields: [
        { name: 'platform', label: 'Platform (GitHub, LinkedIn)' },
        { name: 'url', label: 'Profile URL', type: 'url' },
        { name: 'icon', label: 'Icon Name' },
      ],
    },
  },
  profile: { component: ProfileManager },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [mountedTabs, setMountedTabs] = useState(['analytics']);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setMountedTabs((prev) => (prev.includes(tabId) ? prev : [...prev, tabId]));
  }, []);

  const handleLogout = useCallback(() => {
    toast('Standalone dashboard mode is active.', {
      icon: 'i',
    });
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0a0f1c] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#131b2c',
            color: '#fff',
            border: '1px solid #1e293b',
          },
        }}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        handleLogout={handleLogout}
      />

      <main className="relative ml-64 flex h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-[#1e293b] bg-[#0a0f1c] px-8 py-6">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Dashboard System
            </h1>
            <p className="mt-1 flex items-center gap-2 text-2xl font-black text-white">
              Live Control
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#14f195]" />
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#1e293b]/50 px-4 py-2 text-sm font-semibold shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#14f195]" />
            Standalone Admin
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-8 pb-32">
          {mountedTabs.map((tabId) => {
            const tabConfig = TABS_CONFIG[tabId];

            if (!tabConfig) {
              return null;
            }

            const Component = tabConfig.component;

            return (
              <div
                key={tabId}
                className={activeTab === tabId ? 'block animate-in fade-in duration-300' : 'hidden'}
                aria-hidden={activeTab !== tabId}
              >
                <Suspense fallback={<SectionSkeleton />}>
                  <Component {...(tabConfig.props || {})} />
                </Suspense>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default memo(Dashboard);
