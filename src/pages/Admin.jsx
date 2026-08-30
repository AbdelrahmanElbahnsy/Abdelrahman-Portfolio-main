import React, { lazy, Suspense, memo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Dashboard/Layout/AdminLayout';
import { skillsSchema, heroSchema, journeySchema, aboutSchema } from '../cms/schemas';

// Lazy loaded dashboard sections for bundle optimization
const OverviewDashboard = lazy(() => import('../components/Dashboard/OverviewDashboard'));
const AnalyticsDashboard = lazy(() => import('../components/Dashboard/AnalyticsDashboard'));
const ProjectsManager = lazy(() => import('../components/Dashboard/ProjectsManager'));
const SkillsManager = lazy(() => import('../components/Dashboard/SkillsManager'));
const AccountCenter = lazy(() => import('../components/Dashboard/AccountCenter'));
const GenericListManager = lazy(() => import('../components/Dashboard/GenericListManager'));
const ContactManager = lazy(() => import('../components/Dashboard/ContactManager'));
const DeveloperTools = lazy(() => import('../components/Dashboard/DeveloperTools'));
const FeatureUnavailable = lazy(() => import('../components/Dashboard/FeatureUnavailable'));
const HeroManager = lazy(() => import('../components/Dashboard/HeroManager'));
const AboutManager = lazy(() => import('../components/Dashboard/AboutManager'));
const JourneyManager = lazy(() => import('../components/Dashboard/JourneyManager'));
const CertificationsManager = lazy(() => import('../components/Dashboard/CertificationsManager'));

const SectionSkeleton = () => (
  <div className="w-full space-y-6 animate-pulse">
    <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
    <div className="h-64 bg-cms-cards border border-white/5 rounded-2xl"></div>
    <div className="h-64 bg-cms-cards border border-white/5 rounded-2xl"></div>
  </div>
);

const Admin = () => {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<OverviewDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route 
            path="skills" 
            element={<SkillsManager />} 
          />
          <Route 
            path="certifications" 
            element={<CertificationsManager />} 
          />
          <Route 
            path="socials" 
            element={<GenericListManager title="Social Accounts" collectionName="socials" fields={[
              {name: 'platform', label: 'Platform (GitHub, LinkedIn)'}, {name: 'url', label: 'Profile URL', type: 'url'}, {name: 'icon', label: 'Icon Name'}, {name: 'order', label: 'Display Order', type: 'number', required: false}
            ]} />} 
          />
          <Route 
            path="navbar" 
            element={<GenericListManager title="Navbar Links" collectionName="navbarItems" fields={[
              {name: 'label', label: 'Link Text'}, {name: 'href', label: 'Path / URL'}, {name: 'order', label: 'Display Order', type: 'number'}
            ]} />} 
          />
          <Route 
            path="journey" 
            element={<JourneyManager />} 
          />
          
          <Route 
            path="home" 
            element={<HeroManager />} 
          />
          <Route 
            path="about" 
            element={<AboutManager />} 
          />
          <Route 
            path="contact" 
            element={<ContactManager />} 
          />

          <Route path="profile" element={<AccountCenter />} />
          <Route path="account" element={<AccountCenter />} />
          <Route path="appearance" element={<FeatureUnavailable featureName="Appearance" />} />
          <Route path="activity" element={<FeatureUnavailable featureName="Activity Log" />} />
          <Route path="apikeys" element={<FeatureUnavailable featureName="API Keys" />} />
          <Route path="settings" element={<FeatureUnavailable featureName="Settings" />} />
          <Route path="shortcuts" element={<FeatureUnavailable featureName="Keyboard Shortcuts" />} />
          <Route path="media" element={<FeatureUnavailable featureName="Media Library" />} />
          
          {import.meta.env.DEV && (
            <Route path="devtools" element={<DeveloperTools />} />
          )}
          
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default memo(Admin);
