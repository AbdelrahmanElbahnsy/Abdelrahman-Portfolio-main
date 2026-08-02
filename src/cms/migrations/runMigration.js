import { migrateProjectsToFirestore } from './migrateProjects.js';
import { migrateSkills } from './migrateSkills.js';
import { migrateHero } from './migrateHero.js';
import { migrateJourney } from './migrateJourney.js';
import { migrateAbout } from './migrateAbout.js';

/**
 * Developer Utility: CMS Migration Runner
 * 
 * IMPORTANT: 
 * This file is strictly a developer tool. It must NEVER be imported 
 * in the production bundle (e.g. App.jsx, Home.jsx, main.jsx).
 * 
 * Usage Instructions:
 * If a new environment is spun up and needs base data seeded, a developer 
 * can temporarily import and invoke this function during local development, 
 * then immediately remove the import.
 * 
 * @param {string} target - The migration to run ('projects', 'skills', 'hero', 'journey', 'all')
 */
export const runMigration = async (target) => {
  console.log(`[CMS MIGRATION] Initiating migration for: ${target}`);
  
  try {
    switch (target) {
      case 'projects':
        await migrateProjectsToFirestore();
        break;
      case 'skills':
        await migrateSkills();
        break;
      case 'hero':
        await migrateHero();
        break;
      case 'journey':
        await migrateJourney();
        break;
      case 'about':
        await migrateAbout();
        break;
      case 'all':
        console.log('[CMS MIGRATION] Running all migrations sequentially...');
        await migrateProjectsToFirestore();
        await migrateSkills();
        await migrateHero();
        await migrateJourney();
        await migrateAbout();
        break;
      default:
        console.warn(`[CMS MIGRATION] Unknown target: ${target}. Valid targets: projects, skills, hero, journey, about, all.`);
        return;
    }
    console.log(`[CMS MIGRATION] Successfully completed migration for: ${target}`);
  } catch (error) {
    console.error(`[CMS MIGRATION] Error migrating ${target}:`, error);
  }
};
