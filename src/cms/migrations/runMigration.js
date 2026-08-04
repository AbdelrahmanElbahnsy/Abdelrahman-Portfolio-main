import { migrateProjectsToFirestore } from './migrateProjects.js';
import { migrateSkills } from './migrateSkills.js';
import { migrateHero } from './migrateHero.js';
import { migrateJourney } from './migrateJourney.js';
import { migrateAbout } from './migrateAbout.js';
import { migrateCertifications } from './migrateCertifications.js';
import { migrateSocials } from './migrateSocials.js';
import { migrateContact } from './migrateContact.js';
import { migrateProfile } from './migrateProfile.js';
import { migrateNavbar } from './migrateNavbar.js';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../services/firebase.js';

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
 * @param {string} target - The migration to run ('projects', 'skills', 'hero', 'journey', 'about', 'all')
 */
export const runMigration = async (target) => {
  console.log(`[CMS MIGRATION] Initiating migration for: ${target}`);
  let results = {};
  
  try {
    switch (target) {
      case 'projects':
        results = await migrateProjectsToFirestore();
        break;
      case 'skills':
        results = await migrateSkills();
        break;
      case 'hero':
        results = await migrateHero();
        break;
      case 'journey':
        results = await migrateJourney();
        break;
      case 'about':
        results = await migrateAbout();
        break;
      case 'certifications':
        results = await migrateCertifications();
        break;
      case 'socials':
        results = await migrateSocials();
        break;
      case 'contact':
        results = await migrateContact();
        break;
      case 'profile':
        results = await migrateProfile();
        break;
      case 'navbar':
        results = await migrateNavbar();
        break;
      case 'all':
        console.log('[CMS MIGRATION] Running all migrations sequentially...');
        const rProj = await migrateProjectsToFirestore();
        const rSkills = await migrateSkills();
        const rHero = await migrateHero();
        const rJourney = await migrateJourney();
        const rAbout = await migrateAbout();
        const rCerts = await migrateCertifications();
        const rSocials = await migrateSocials();
        const rContact = await migrateContact();
        const rProfile = await migrateProfile();
        const rNavbar = await migrateNavbar();
        
        results = {
          created: (rProj?.created||0) + (rSkills?.created||0) + (rHero?.created||0) + (rJourney?.created||0) + (rAbout?.created||0) + (rCerts?.created||0) + (rSocials?.created||0) + (rContact?.created||0) + (rProfile?.created||0) + (rNavbar?.created||0),
          updated: (rProj?.updated||0) + (rSkills?.updated||0) + (rHero?.updated||0) + (rJourney?.updated||0) + (rAbout?.updated||0) + (rCerts?.updated||0) + (rSocials?.updated||0) + (rContact?.updated||0) + (rProfile?.updated||0) + (rNavbar?.updated||0),
          skipped: (rProj?.skipped||0) + (rSkills?.skipped||0) + (rHero?.skipped||0) + (rJourney?.skipped||0) + (rAbout?.skipped||0) + (rCerts?.skipped||0) + (rSocials?.skipped||0) + (rContact?.skipped||0) + (rProfile?.skipped||0) + (rNavbar?.skipped||0),
          failed: (rProj?.failed||0) + (rSkills?.failed||0) + (rHero?.failed||0) + (rJourney?.failed||0) + (rAbout?.failed||0) + (rCerts?.failed||0) + (rSocials?.failed||0) + (rContact?.failed||0) + (rProfile?.failed||0) + (rNavbar?.failed||0),
        };

        const checkAndPrint = async (name, colName, r) => {
          let count = 0;
          try {
            const snap = await getCountFromServer(collection(db, colName));
            count = snap.data().count;
          } catch(e) {
            // if getCountFromServer fails due to permissions, count remains 0, but we can log the error if we want.
          }
          
          if (count === 0 && (r?.created > 0 || r?.updated > 0)) {
            console.error(`\n${name}\nWrite: SUCCESS\nCreated: ${(r?.created||0) + (r?.updated||0)}\nDatabase Count: 0`);
            throw new Error(`getDocs() or getCountFromServer() returned 0 after a reported successful write for ${name}`);
          }

          let out = `\n${name}\nWrite: ${r?.failed > 0 ? 'FAILED' : 'SUCCESS'}\n`;
          if (r?.failed > 0 && r?.error) {
             out += `Exception: ${r.error.toString()}\n`;
          }
          out += `Created: ${(r?.created||0) + (r?.updated||0)}\nDatabase Count: ${count}`;
          console.log(out);
        };

        await checkAndPrint('projects', 'projects', rProj);
        await checkAndPrint('skills', 'skills', rSkills);
        await checkAndPrint('hero', 'hero', rHero);
        await checkAndPrint('journey', 'journey', rJourney);
        await checkAndPrint('about', 'about', rAbout);
        await checkAndPrint('certifications', 'certifications', rCerts);
        await checkAndPrint('socials', 'socials', rSocials);
        await checkAndPrint('contact', 'content', rContact);
        await checkAndPrint('profile', 'profile', rProfile);
        await checkAndPrint('navbar', 'navbarItems', rNavbar);
        break;
      default:
        console.warn(`[CMS MIGRATION] Unknown target: ${target}. Valid targets: projects, skills, hero, journey, about, all.`);
        return { created: 0, updated: 0, skipped: 0, failed: 1 };
    }
    console.log(`[CMS MIGRATION] Successfully completed migration for: ${target}`, results);
    return results;
  } catch (error) {
    console.error(`[CMS MIGRATION] Error migrating ${target}:`, error);
    return { created: 0, updated: 0, skipped: 0, failed: 1 };
  }
};
