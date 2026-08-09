/**
 * Full DashboardContext validation simulation (post-repair).
 */
import { loadEnv } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const env = loadEnv('development', process.cwd(), '');
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const auth = getAuth(app);

const COLLECTIONS = ['projects', 'skills', 'certifications', 'journey', 'socials', 'navbarItems', 'hero', 'about', 'profile', 'content'];

function serialize(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (v && typeof v.toDate === 'function') out[k] = v.toDate().toISOString();
    else out[k] = v;
  }
  return out;
}

const email = `validate_bot_${Date.now()}@example.com`;
await createUserWithEmailAndPassword(auth, email, 'TempPassword123!');

const counts = {};
const byCollection = {};
for (const col of COLLECTIONS) {
  const snap = await getDocs(collection(db, col));
  counts[col] = snap.size;
  byCollection[col] = snap.docs.map(d => ({ id: d.id, ...serialize(d.data()) }));
}

let healthScore = 100;
const pendingTasks = [];
const diagnostics = [];

const addIssue = (id, title, msg, penalty) => {
  pendingTasks.push({ id, title, msg });
  diagnostics.push({ label: msg, penalty });
  healthScore -= penalty;
};

// Hero
const hero = byCollection.hero[0];
if (!hero) addIssue('hero-missing', 'Create Hero Section', 'Hero section is missing.', 10);
else {
  const hasName = (hero.firstName && hero.lastName) || hero.title;
  const hasBadge = hero.badge || hero.role || hero.subtitle;
  const hasImage = hero.portrait || hero.image || hero.avatar;
  if (!hasName) addIssue('hero-name', 'Add Hero Name', 'Hero name missing.', 5);
  if (!hasBadge) addIssue('hero-badge', 'Add Hero Badge', 'Hero badge missing.', 5);
  if (!hasImage) addIssue('hero-image', 'Upload Hero Image', 'Hero portrait missing.', 5);
}

// About
const about = byCollection.about[0];
if (!about) addIssue('about-missing', 'Complete About Section', 'About document is missing.', 10);
else {
  const hasTitle = about.title || about.header;
  const hasContent = about.lead || about.description || (about.paragraphsJson?.length > 5) || (about.paragraphs?.length > 0);
  if (!hasTitle) addIssue('about-title', 'Add About Title', 'About title missing.', 5);
  if (!hasContent) addIssue('about-content', 'Add About Content', 'About content missing.', 10);
}

// Projects
if (counts.projects === 0) addIssue('no-projects', 'Publish First Project', 'No projects published.', 20);
else {
  byCollection.projects.forEach(p => {
    const hasImage = p.image || p.thumbnail || p.cover;
    const hasGithub = p.github || p.githubUrl || p.repo;
    const hasLive = p.live || p.liveUrl || p.demo || p.link;
    const display = p.title || p.id;
    if (!hasImage) addIssue(`proj-img-${p.id}`, `Add Thumbnail: ${display}`, `projects/${p.id} missing thumbnail.`, 5);
    if (!hasGithub && !hasLive) addIssue(`proj-links-${p.id}`, `Add Links: ${display}`, `projects/${p.id} missing links.`, 5);
  });
}

// Skills
if (counts.skills === 0) addIssue('no-skills', 'Add Technical Skills', 'No skills added.', 10);
else {
  byCollection.skills.forEach(s => {
    const missing = [];
    if (!s.name) missing.push('name');
    if (s.percent == null) missing.push('percent');
    if (missing.length) addIssue(`skill-inv-${s.id}`, `Fix Skill: ${s.name || s.id}`, `skills/${s.id} missing: ${missing.join(', ')}.`, 5);
  });
}

// Certifications
if (counts.certifications === 0) addIssue('no-certs', 'Add Certifications', 'No certifications.', 5);
else {
  byCollection.certifications.forEach(c => {
    const missing = [];
    if (!c.title) missing.push('title');
    if (!c.issuer) missing.push('issuer');
    if (missing.length) addIssue(`cert-inv-${c.id}`, `Fix Certificate: ${c.title || c.id}`, `certifications/${c.id} missing: ${missing.join(', ')}.`, 5);
  });
}

// Journey
if (counts.journey === 0) addIssue('no-journey', 'Add Journey Timeline', 'Journey empty.', 10);
else {
  byCollection.journey.forEach(j => {
    const missing = [];
    if (!j.title) missing.push('title');
    if (j.order == null) missing.push('order');
    if (missing.length) addIssue(`journey-inv-${j.id}`, `Fix Journey: ${j.title || j.id}`, `journey/${j.id} missing: ${missing.join(', ')}.`, 5);
  });
}

// Socials
if (counts.socials === 0) addIssue('no-socials', 'Add Social Profiles', 'No social links.', 5);
else {
  byCollection.socials.forEach(s => {
    const url = s.url || s.link || s.href;
    const missing = [];
    if (!s.platform && !s.name) missing.push('platform');
    if (!url) missing.push('url');
    else if (!url.startsWith('http') && !url.startsWith('tel:') && !url.startsWith('mailto:')) missing.push('url (invalid)');
    if (missing.length) addIssue(`soc-url-${s.id}`, `Fix Social: ${s.platform || s.id}`, `socials/${s.id} invalid: ${missing.join(', ')}.`, 5);
  });
}

// Navbar
if (counts.navbarItems === 0) addIssue('no-navs', 'Configure Navbar', 'No navbar items.', 5);
else {
  byCollection.navbarItems.forEach(n => {
    const label = n.label || n.title || n.name;
    const path = n.path || n.url || n.link || n.href;
    const missing = [];
    if (!label) missing.push('label');
    if (!path) missing.push('path');
    if (missing.length) addIssue(`nav-inv-${n.id}`, `Fix Navbar: ${label || n.id}`, `navbarItems/${n.id} missing: ${missing.join(', ')}.`, 5);
  });
}

// Contact
const contactDoc = byCollection.content.find(d => d.id === 'contact');
if (!contactDoc) addIssue('contact-missing', 'Configure Contact', 'Contact missing.', 5);
else if (!contactDoc.email?.includes('@')) addIssue('contact-email', 'Fix Contact Email', 'Valid email missing.', 5);

healthScore = Math.max(0, Math.min(100, healthScore));

console.log('=== FULL DASHBOARD VALIDATION ===');
console.log('Health Score:', healthScore);
console.log('Pending Tasks:', pendingTasks.length);
console.log('Diagnostics:', diagnostics.length);
console.log('Action Required:', pendingTasks.length);
if (pendingTasks.length) {
  console.log('\nIssues:');
  pendingTasks.forEach(t => console.log(`  - [${t.id}] ${t.msg}`));
} else {
  console.log('\n✅ All checks passed — Health Score 100%');
}

process.exit(healthScore === 100 && pendingTasks.length === 0 ? 0 : 1);
