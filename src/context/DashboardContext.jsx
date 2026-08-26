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
    notifications: [],
    healthDiagnostics: [],
    healthScore: null,
    storageStats: null,
    systemHealth: null,
    isLoading: true,
    isRefetching: false,
    error: null,
  });

  const COLLECTIONS = [
    'projects', 'skills', 'certifications', 'journey', 
    'socials', 'navbarItems', 'hero', 'about', 'profile', 'contact'
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
      const editableCollections = ['projects', 'skills', 'certifications', 'journey', 'hero', 'about', 'navbarItems', 'socials', 'contact'];
      
      const latestPromises = editableCollections.map(col =>
        crudService.getAll(col, { orderByField: 'updatedAt', orderDirection: 'desc' })
          .then(docs => docs.map(d => ({ ...d, _collection: col })))
          .catch(() => []) // Ignore missing collections gracefully
      );
      
      const allUpdates = await Promise.all(latestPromises);

      // Helper: get all docs for a specific collection from allUpdates
      const byCollection = (col) => allUpdates.find(arr => arr[0]?._collection === col) || [];

      const getTimestamp = (d) => {
        const ts = d.updatedAt || d.createdAt;
        if (!ts) return 0;
        return ts?.toMillis ? ts.toMillis() : new Date(ts).getTime();
      };

      const mergedUpdates = allUpdates.flat()
        .filter(d => {
          // Must have at least one timestamp
          if (!d.updatedAt && !d.createdAt) return false;
          return true;
        })
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))
        .slice(0, 5);

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
      let cloudinaryImages = 0;

      const addIssue = (id, title, msg, link, penalty, type, urgent = false) => {
        // Prevent duplicates
        if (pendingTasks.some(t => t.id === id)) return;
        pendingTasks.push({ id, title, urgent, link, type });
        healthDiagnostics.push({ label: msg, penalty, link });
        notifications.push({ id: `notif-${id}`, type: 'warning', message: msg, time: Date.now() });
        healthScore -= penalty;
      };

      // ----------------------------------------------------
      // SCHEMA-AWARE VALIDATION
      // ----------------------------------------------------

      // 4.1 Hero Validation (Schema: firstName, lastName, badge, portrait)
      const heroList = byCollection('hero');
      const hero = heroList[0] || null;
      if (!hero) {
        addIssue('hero-missing', 'Create Hero Section', 'Hero section is missing.', '/admin/home', 10, 'hero', true);
      } else {
        const hasName = (hero.firstName && hero.lastName) || hero.title;
        const hasBadge = hero.badge || hero.role || hero.subtitle;
        const hasImage = hero.portrait || hero.image || hero.avatar;

        if (!hasName) addIssue('hero-name', 'Add Hero Name', 'Hero name (firstName/lastName) is missing.', '/admin/home', 5, 'hero');
        if (!hasBadge) addIssue('hero-badge', 'Add Hero Badge', 'Hero professional title (badge) is missing.', '/admin/home', 5, 'hero');
        if (!hasImage) addIssue('hero-image', 'Upload Hero Image', 'Hero portrait image is missing.', '/admin/home', 5, 'hero');
        if (hasImage) cloudinaryImages++;
      }

      // 4.2 About Validation (Schema: subtitle, title, lead, paragraphsJson)
      const aboutList = byCollection('about');
      const about = aboutList[0] || null;
      if (!about) {
        addIssue('about-missing', 'Complete About Section', 'About document is missing.', '/admin/about', 10, 'about', true);
      } else {
        const hasTitle = about.title || about.header;
        const hasContent = about.lead || about.description || (about.paragraphsJson && about.paragraphsJson.length > 5) || (about.paragraphs && about.paragraphs.length > 0);
        
        if (!hasTitle) addIssue('about-title', 'Add About Title', 'About section title is missing.', '/admin/about', 5, 'about');
        if (!hasContent) addIssue('about-content', 'Add About Content', 'About description or lead text is missing.', '/admin/about', 10, 'about', true);
        if (about.image || about.portrait) cloudinaryImages++;
      }

      // 4.3 Projects Validation (Schema: title, description, image, github, live)
      const projs = byCollection('projects');
      if (counts.projects === 0) {
        addIssue('no-projects', 'Publish First Project', 'No projects published.', '/admin/projects', 20, 'projects', true);
      } else {
        projs.forEach(p => {
          const hasImage = p.image || p.thumbnail || p.cover;
          const hasGithub = p.github || p.githubUrl || p.githubLink || p.repo || p.repository;
          const hasLive = p.live || p.liveUrl || p.liveLink || p.demo || p.demoUrl || p.website || p.link;
          const displayName = p.title || p.id;

          if (hasImage) cloudinaryImages++;
          else addIssue(
            `proj-img-${p.id}`,
            `Add Thumbnail: "${displayName}" (${p.id})`,
            `projects/${p.id} — "${displayName}" is missing a thumbnail image.`,
            `/admin/projects?edit=${p.id}`, 5, 'projects'
          );
          
          if (!hasGithub && !hasLive) {
            addIssue(
              `proj-links-${p.id}`,
              `Add Links: "${displayName}" (${p.id})`,
              `projects/${p.id} — "${displayName}" is missing both GitHub and Live links.`,
              `/admin/projects?edit=${p.id}`, 5, 'projects'
            );
          }
        });
      }

      // 4.4 Skills Validation (Schema: name, percent)
      const skills = byCollection('skills');
      if (counts.skills === 0) {
        addIssue('no-skills', 'Add Technical Skills', 'No technical skills added.', '/admin/skills', 10, 'skills');
      } else {
        skills.forEach(s => {
          const missingFields = [];
          if (!s.name) missingFields.push('name');
          if (s.percent == null) missingFields.push('percent');
          if (missingFields.length > 0) {
            const display = s.name || `[id: ${s.id}]`;
            addIssue(
              `skill-inv-${s.id}`,
              `Fix Skill: "${display}" (${s.id})`,
              `skills/${s.id} — "${display}" is missing: ${missingFields.join(', ')}.`,
              `/admin/skills?edit=${s.id}`, 5, 'skills'
            );
          }
        });
      }

      // 4.5 Certifications Validation (Schema: title, issuer)
      const certs = byCollection('certifications');
      if (counts.certifications === 0) {
        addIssue('no-certs', 'Add Certifications', 'No certifications added.', '/admin/certifications', 5, 'certifications');
      } else {
        certs.forEach(c => {
          const missingFields = [];
          if (!c.title) missingFields.push('title');
          if (!c.issuer) missingFields.push('issuer');
          if (missingFields.length > 0) {
            const display = c.title || `[id: ${c.id}]`;
            addIssue(
              `cert-inv-${c.id}`,
              `Fix Certificate: "${display}" (${c.id})`,
              `certifications/${c.id} — "${display}" is missing: ${missingFields.join(', ')}.`,
              `/admin/certifications?edit=${c.id}`, 5, 'certifications'
            );
          }
        });
      }

      // 4.6 Journey Validation (Schema: title, order)
      const journeys = byCollection('journey');
      if (counts.journey === 0) {
        addIssue('no-journey', 'Add Journey Timeline', 'Journey timeline is empty.', '/admin/journey', 10, 'journey');
      } else {
        journeys.forEach(j => {
          const missingFields = [];
          if (!j.title) missingFields.push('title');
          if (j.order == null) missingFields.push('order');
          if (missingFields.length > 0) {
            const display = j.title || `[id: ${j.id}]`;
            addIssue(
              `journey-inv-${j.id}`,
              `Fix Journey: "${display}" (${j.id})`,
              `journey/${j.id} — "${display}" is missing: ${missingFields.join(', ')}.`,
              `/admin/journey?edit=${j.id}`, 5, 'journey'
            );
          }
        });
      }

      // 4.7 Socials Validation (Schema: platform, url)
      const socials = byCollection('socials');
      if (counts.socials === 0) {
        addIssue('no-socials', 'Add Social Profiles', 'No social links configured.', '/admin/socials', 5, 'socials');
      } else {
        socials.forEach(s => {
          const url = s.url || s.link || s.href;
          const platform = s.platform || s.name || `[id: ${s.id}]`;
          const missingFields = [];
          if (!s.platform && !s.name) missingFields.push('platform');
          if (!url) missingFields.push('url');
          else if (!url.startsWith('http') && !url.startsWith('tel:') && !url.startsWith('mailto:')) missingFields.push('url (invalid format)');

          if (missingFields.length > 0) {
            addIssue(
              `soc-url-${s.id}`,
              `Fix Social: "${platform}" (${s.id})`,
              `socials/${s.id} — "${platform}" has invalid fields: ${missingFields.join(', ')}.`,
              `/admin/socials?edit=${s.id}`, 5, 'socials'
            );
          }
        });
      }

      // 4.8 Navbar Validation (Schema: label, path)
      const navs = byCollection('navbarItems');
      if (counts.navbarItems === 0) {
        addIssue('no-navs', 'Configure Navbar', 'No navbar items exist.', '/admin/navbar', 5, 'navbarItems');
      } else {
        navs.forEach(n => {
          const label = n.label || n.title || n.name;
          const path = n.path || n.url || n.link || n.href;
          const missingFields = [];
          if (!label) missingFields.push('label');
          if (!path) missingFields.push('path');
          if (missingFields.length > 0) {
            const display = label || `[id: ${n.id}]`;
            addIssue(
              `nav-inv-${n.id}`,
              `Fix Navbar: "${display}" (${n.id})`,
              `navbarItems/${n.id} — "${display}" is missing: ${missingFields.join(', ')}.`,
              `/admin/navbar?edit=${n.id}`, 5, 'navbarItems'
            );
          }
        });
      }

      // 4.9 Contact Validation (Schema: email)
      const contactCol = allUpdates.find(colArray => colArray[0]?._collection === 'contact') || [];
      let contactDoc = contactCol.find(d => d.id === 'main');
      
      if (!contactDoc) {
        // ONE-TIME MIGRATION: Auto-migrate from portfolioData if missing
        try {
          console.log("Contact document missing. Running auto-migration from portfolioData.js...");
          const { migrateContact } = await import('../cms/migrations/migrateContact.js');
          await migrateContact();
          
          // Refetch to confirm migration
          const migratedDocs = await crudService.getAll('contact');
          contactDoc = migratedDocs.find(d => d.id === 'main');
          
          if (contactDoc) {
            console.log("Migration successful, contactDoc loaded.");
            contactDoc._collection = 'contact';
            if (contactCol.length === 0) {
              allUpdates.push([contactDoc]);
            } else {
              contactCol.push(contactDoc);
            }
          }
        } catch(e) {
          console.error("Auto-migration failed:", e);
        }
      }

      if (!contactDoc) {
        addIssue('contact-missing', 'Configure Contact Settings', 'Contact information is missing.', '/admin/contact', 5, 'contact');
      } else {
        if (!contactDoc.email || !contactDoc.email.includes('@')) {
          addIssue('contact-email', 'Fix Contact Email', 'Valid contact email is missing.', '/admin/contact', 5, 'contact');
        }
      }

      // 5. System Health
      const systemHealth = await checkSystemHealth();
      Object.entries(systemHealth).forEach(([key, info]) => {
        if (info.status === 'error' || info.status === 'offline') {
          healthDiagnostics.push({ label: `${info.label} is degraded`, penalty: 5, link: '/admin/account' });
          healthScore -= 5;
          notifications.push({ id: `notif-sys-${key}`, type: 'error', message: `${info.label} is currently ${info.status}: ${info.reason || 'Service unavailable'}.`, time: Date.now() });
        }
      });

      // Clamp health score
      healthScore = Math.max(0, Math.min(100, healthScore));

      // 6. Storage Statistics
      const totalContent = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
      const storageStats = {
        firestoreDocs: totalContent,
        cloudinaryImages: cloudinaryImages,
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
