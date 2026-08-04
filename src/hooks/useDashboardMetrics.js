import { useState, useEffect } from 'react';
import { crudService } from '../cms/services/crudService';
import { checkSystemHealth } from '../utils/systemHealth';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    counts: { projects: 0, skills: 0, certifications: 0, socials: 0, navbarItems: 0, journey: 0 },
    latestProjects: [],
    recentActivity: [],
    pendingTasks: [],
    systemHealth: null,
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      try {
        // 1. Get counts efficiently
        const collections = ['projects', 'skills', 'certifications', 'socials', 'navbarItems', 'journey'];
        const counts = await crudService.getCollectionCounts(collections);
        
        // 2. Get latest projects (order by updatedAt desc)
        const latestProjects = await crudService.getAll('projects', {
          orderByField: 'updatedAt',
          orderDirection: 'desc',
          limitCount: 4
        });

        // 3. Get recent activity
        const recentActivity = await crudService.getAll('activityLog', {
          orderByField: 'timestamp',
          orderDirection: 'desc',
          limitCount: 5
        });

        // 4. Calculate Pending Tasks (Dynamic checks)
        const pendingTasks = [];
        const heroData = await crudService.getOne('hero', 'main');
        if (!heroData || !heroData.title) {
          pendingTasks.push({ id: 'hero-missing', title: 'Complete Hero Section content', urgent: true, link: '/admin/home' });
        }
        if (counts.projects === 0) {
          pendingTasks.push({ id: 'no-projects', title: 'Add your first project', urgent: true, link: '/admin/projects' });
        } else {
          // Check if any recent project is missing a live link
          const missingLink = latestProjects.find(p => !p.liveLink);
          if (missingLink) {
            pendingTasks.push({ id: 'proj-link', title: `Add Live Link to ${missingLink.title || 'Project'}`, urgent: false, link: '/admin/projects' });
          }
        }
        if (counts.skills === 0) {
          pendingTasks.push({ id: 'no-skills', title: 'Add your technical skills', urgent: false, link: '/admin/skills' });
        }

        // 5. System Health
        const health = await checkSystemHealth();

        if (isMounted) {
          setMetrics({
            counts,
            latestProjects,
            recentActivity,
            pendingTasks,
            systemHealth: health,
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error);
        if (isMounted) setMetrics(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchMetrics();
    
    // Optional: Could set up real-time subscriptions here if we wanted it instantly reactive,
    // but a fetch on mount is safer for counts to avoid excessive billing.
    
    return () => { isMounted = false; };
  }, []);

  return metrics;
}
