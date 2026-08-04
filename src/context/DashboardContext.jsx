import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { crudService } from '../cms/services/crudService';
import { checkSystemHealth } from '../utils/systemHealth';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    counts: {},
    latestUpdates: [],
    recentActivity: [],
    pendingTasks: [],
    systemHealth: null,
    isLoading: true,
    isRefetching: false,
    error: null,
  });

  const COLLECTIONS = [
    'projects', 'skills', 'certifications', 'journey', 
    'socials', 'navbarItems', 'hero', 'about', 'profile', 'content'
  ];

  const fetchMetrics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setMetrics(prev => ({ ...prev, isRefetching: true, error: null }));
    } else {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      // 1. Fetch Counts (Highly Optimized)
      const counts = await crudService.getCollectionCounts(COLLECTIONS);

      // 2. Fetch Latest Updates (Mixed Content)
      // Since Firestore doesn't support global sorting across collections, 
      // we fetch the top 2 from each major editable collection, merge, and sort locally.
      const editableCollections = ['projects', 'skills', 'certifications', 'journey', 'hero', 'about', 'navbarItems', 'socials'];
      
      const latestPromises = editableCollections.map(col => 
        crudService.getAll(col, { orderByField: 'updatedAt', orderDirection: 'desc', limitCount: 2 })
          .then(docs => docs.map(d => ({ ...d, _collection: col })))
          .catch(() => []) // Ignore missing collections gracefully
      );
      
      const allUpdates = await Promise.all(latestPromises);
      const mergedUpdates = allUpdates.flat().filter(d => d.updatedAt).sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : new Date(a.updatedAt).getTime();
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : new Date(b.updatedAt).getTime();
        return timeB - timeA;
      }).slice(0, 5); // Take top 5 newest globally

      // 3. Fetch Recent Activity
      const recentActivity = await crudService.getAll('activityLog', {
        orderByField: 'timestamp',
        orderDirection: 'desc',
        limitCount: 15
      }).catch(() => []);

      // 4. Advanced Dynamic Pending Tasks & Notifications & Health Score
      const pendingTasks = [];
      const notifications = [];
      const healthDiagnostics = [];
      let healthScore = 100;
      
      const hero = allUpdates.find(colArray => colArray[0]?._collection === 'hero')?.[0];
      if (!hero || !hero.title || !hero.image) {
        pendingTasks.push({ id: 'hero-incomplete', title: 'Complete Hero section (Title/Image missing)', urgent: true, link: '/admin/home', type: 'hero' });
        healthDiagnostics.push({ label: 'Hero section incomplete', penalty: 10, link: '/admin/home' });
        healthScore -= 10;
      }
      
      let cloudinaryImages = hero?.image ? 1 : 0;
      const about = allUpdates.find(colArray => colArray[0]?._collection === 'about')?.[0];
      if (!about || !about.description) {
        healthDiagnostics.push({ label: 'About description missing', penalty: 10, link: '/admin/about' });
        healthScore -= 10;
      }
      if (about?.image) cloudinaryImages += 1;
      
      const projs = allUpdates.find(colArray => colArray[0]?._collection === 'projects') || [];
      cloudinaryImages += projs.filter(p => p.image).length;

      if (counts.projects === 0) {
        pendingTasks.push({ id: 'no-projects', title: 'Publish your first project', urgent: true, link: '/admin/projects', type: 'projects' });
        healthDiagnostics.push({ label: 'No projects published', penalty: 20, link: '/admin/projects' });
        healthScore -= 20;
      } else {
        const missingLink = projs.find(p => !p.liveLink && !p.githubLink);
        if (missingLink) {
          pendingTasks.push({ id: `proj-${missingLink.id}`, title: `Project "${missingLink.title}" is missing links`, urgent: false, link: '/admin/projects', type: 'projects' });
          notifications.push({ id: `notif-proj-${missingLink.id}`, type: 'warning', message: `Project "${missingLink.title}" missing demo link.`, time: Date.now() });
          healthDiagnostics.push({ label: `Project "${missingLink.title}" missing links`, penalty: 5, link: '/admin/projects' });
          healthScore -= 5;
        }
      }

      if (counts.skills === 0) {
        pendingTasks.push({ id: 'no-skills', title: 'Add your technical skills', urgent: false, link: '/admin/skills', type: 'skills' });
        healthDiagnostics.push({ label: 'No technical skills added', penalty: 10, link: '/admin/skills' });
        healthScore -= 10;
      }
      if (counts.socials === 0) {
        pendingTasks.push({ id: 'no-socials', title: 'Add your social profiles', urgent: false, link: '/admin/socials', type: 'socials' });
        healthDiagnostics.push({ label: 'No social links configured', penalty: 5, link: '/admin/socials' });
        healthScore -= 5;
      }
      if (counts.journey === 0) {
        healthDiagnostics.push({ label: 'Journey timeline empty', penalty: 10, link: '/admin/journey' });
        healthScore -= 10;
      }

      // 5. System Health
      const systemHealth = await checkSystemHealth();
      Object.entries(systemHealth).forEach(([key, info]) => {
        if (info.status !== 'online') {
          healthDiagnostics.push({ label: `${info.label} is degraded`, penalty: 5, link: '/admin/account' });
          healthScore -= 5;
          notifications.push({ id: `notif-sys-${key}`, type: 'error', message: `${info.label} is currently ${info.status}.`, time: Date.now() });
        }
      });

      // Clamp health score
      healthScore = Math.max(0, Math.min(100, healthScore));

      // 6. Storage Statistics
      const totalContent = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
      const storageStats = {
        firestoreDocs: totalContent,
        cloudinaryImages: cloudinaryImages,
        estimatedUsageMB: (cloudinaryImages * 1.5).toFixed(1), // Estimate 1.5MB per image
        backups: 0
      };

      // 7. Unified Notifications
      const formattedActivity = recentActivity.map(act => ({
        id: `act-${act.id}`,
        type: 'info',
        message: `${act.action} ${act.target || 'item'}`,
        time: act.timestamp?.toMillis ? act.timestamp.toMillis() : new Date(act.timestamp).getTime(),
        link: act.link || '/admin/overview'
      }));

      const unifiedNotifications = [...notifications, ...formattedActivity].sort((a, b) => b.time - a.time);

      setMetrics({
        counts,
        latestUpdates: mergedUpdates,
        recentActivity,
        pendingTasks,
        notifications: unifiedNotifications,
        healthScore,
        healthDiagnostics,
        storageStats,
        systemHealth,
        isLoading: false,
        isRefetching: false,
        error: null
      });

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setMetrics(prev => ({ ...prev, isLoading: false, isRefetching: false, error: err.message }));
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchMetrics();
    
    // Listen for custom event from crudService to automatically refetch
    const handleUpdate = () => fetchMetrics(true);
    window.addEventListener('dashboard-update', handleUpdate);
    return () => window.removeEventListener('dashboard-update', handleUpdate);
  }, [fetchMetrics]);

  return (
    <DashboardContext.Provider value={{ ...metrics, refreshDashboard: () => fetchMetrics(true) }}>
      {children}
    </DashboardContext.Provider>
  );
};
