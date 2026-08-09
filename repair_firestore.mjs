/**
 * TARGETED FIRESTORE REPAIR
 * Reads the two broken documents, classifies them, and repairs/deletes.
 *
 * Skills doc 06HbU5ih4aJkAX4iq7Je:
 *   - Created by migrateSkills addDoc with no name (bug: addDoc ran before name was set, or mid-loop failure)
 *   - Will read ALL current skills to find which name is MISSING from the set
 *   - If it's a duplicate/orphan: DELETE it
 *
 * NavbarItems doc 5bb3KHzUtAXZnpHZFeYS:
 *   - Missing label field
 *   - Will inspect all fields and map to real nav links from portfolioData
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, getDoc, getDocs, collection, deleteDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDA9yTl8zFoZ8zxZPkTBydd23yuaJbhV0E',
  authDomain: 'abdelrahman-portfolio-62abe.firebaseapp.com',
  projectId: 'abdelrahman-portfolio-62abe',
  storageBucket: 'abdelrahman-portfolio-62abe.firebasestorage.app',
  messagingSenderId: '591841366575',
  appId: '1:591841366575:web:f0f91e5eda2000bb3d6cda',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node repair_firestore.mjs <email> <password>');
  process.exit(1);
}

console.log(`\nSigning in as ${email}...`);
await signInWithEmailAndPassword(auth, email, password);
console.log('✅ Authenticated.\n');

// ═══════════════════════════════════════════════════════════════
// REAL NAV LINKS from portfolioData.js (source of truth)
// ═══════════════════════════════════════════════════════════════
const realNavLinks = [
  { label: 'Home',           href: '#hero',           order: 0 },
  { label: 'About',          href: '#about',           order: 1 },
  { label: 'Skills',         href: '#skills',          order: 2 },
  { label: 'Journey',        href: '#journey',         order: 3 },
  { label: 'Projects',       href: '#projects',        order: 4 },
  { label: 'Certifications', href: '#certifications',  order: 5 },
];

// ═══════════════════════════════════════════════════════════════
// REAL SKILLS from portfolioData.js (source of truth)
// ═══════════════════════════════════════════════════════════════
const realSkillCategories = [
  { title: 'Cloud Platform',               icon: 'SiMicrosoftazure',      skills: [
    { name: 'VM & VNet', percent: 90 },
    { name: 'Microsoft Entra ID & Security', percent: 85 },
    { name: 'Storage Account', percent: 88 },
    { name: 'Load Balancer', percent: 82 },
  ]},
  { title: 'DevOps & CI/CD',               icon: 'fas fa-infinity',        skills: [
    { name: 'Jenkins', percent: 88 },
    { name: 'GitHub Actions', percent: 85 },
    { name: 'CI/CD Pipelines', percent: 90 },
    { name: 'Automation', percent: 87 },
  ]},
  { title: 'Containers & Orchestration',   icon: 'fab fa-docker',          skills: [
    { name: 'Docker', percent: 92 },
    { name: 'Docker Compose', percent: 88 },
    { name: 'Kubernetes', percent: 85 },
    { name: 'Container Security', percent: 80 },
  ]},
  { title: 'Infrastructure as Code',       icon: 'fas fa-code-branch',     skills: [
    { name: 'Terraform', percent: 87 },
    { name: 'Infrastructure Automation', percent: 85 },
    { name: 'Provisioning', percent: 83 },
  ]},
  { title: 'Networking',                   icon: 'fas fa-network-wired',   skills: [
    { name: 'Routing & Switching', percent: 92 },
    { name: 'TCP/IP', percent: 90 },
    { name: 'Network Security', percent: 85 },
    { name: 'Load Balancing', percent: 84 },
  ]},
  { title: 'Programming & Scripting',      icon: 'fas fa-terminal',        skills: [
    { name: 'Python', percent: 85 },
    { name: 'Bash', percent: 82 },
    { name: 'Shell Scripting', percent: 80 },
  ]},
  { title: 'Operating Systems',            icon: 'fab fa-linux',           skills: [
    { name: 'Linux Administration', percent: 92 },
    { name: 'Windows Server', percent: 85 },
    { name: 'System Hardening', percent: 83 },
    { name: 'Process Management', percent: 86 },
  ]},
  { title: 'Monitoring & Observability',   icon: 'fas fa-chart-line',      skills: [
    { name: 'Prometheus', percent: 88 },
    { name: 'Grafana', percent: 87 },
    { name: 'Logging (ELK / Loki)', percent: 85 },
    { name: 'Metrics & Alerting', percent: 86 },
  ]},
];
const allRealSkillNames = new Set(realSkillCategories.flatMap(c => c.skills.map(s => s.name)));

// ═══════════════════════════════════════════════════════════════
// STEP 1: Read ALL existing Firestore skills
// ═══════════════════════════════════════════════════════════════
console.log('Reading all Firestore skills...');
const skillsSnap = await getDocs(collection(db, 'skills'));
const firestoreSkillNames = new Set();
skillsSnap.forEach(d => {
  const name = d.data().name;
  if (name) firestoreSkillNames.add(name);
});
console.log(`Found ${skillsSnap.size} skill docs. Named: ${firestoreSkillNames.size}`);

// ═══════════════════════════════════════════════════════════════
// STEP 2: Read target skill doc
// ═══════════════════════════════════════════════════════════════
const skillRef = doc(db, 'skills', '06HbU5ih4aJkAX4iq7Je');
const skillSnap = await getDoc(skillRef);

console.log('\n═══════════════════════════════════════════════════');
console.log('DOC: skills/06HbU5ih4aJkAX4iq7Je');
console.log('═══════════════════════════════════════════════════');

if (!skillSnap.exists()) {
  console.log('Document does not exist. Already cleaned up.');
} else {
  const sd = skillSnap.data();
  console.log('Current data:', JSON.stringify(sd, null, 2));
  
  // Which real skill names are MISSING from Firestore? → those would be candidates
  const missingFromFirestore = [...allRealSkillNames].filter(n => !firestoreSkillNames.has(n));
  console.log('\nReal skills NOT yet in Firestore:', missingFromFirestore);

  // Determine what this doc is
  const hasName     = sd.name && sd.name.trim() !== '';
  const hasPercent  = sd.percent != null;
  const hasCategory = sd.category && sd.category.trim() !== '';

  const nonMetaFields = Object.keys(sd).filter(k => !['createdAt','updatedAt'].includes(k));
  const isEmpty = nonMetaFields.length === 0;

  if (isEmpty) {
    console.log('\n→ DECISION: Document is completely empty. DELETING.');
    await deleteDoc(skillRef);
    console.log('✅ Deleted skills/06HbU5ih4aJkAX4iq7Je');
  } else if (!hasName && missingFromFirestore.length > 0) {
    // Has some fields but no name — try to map by category/percent/order
    let bestMatch = null;
    for (const cat of realSkillCategories) {
      for (const s of cat.skills) {
        if (!firestoreSkillNames.has(s.name)) {
          if (sd.percent === s.percent || sd.category === cat.title) {
            bestMatch = { ...s, category: cat.title, categoryIcon: cat.icon };
            break;
          }
        }
      }
      if (bestMatch) break;
    }
    
    if (bestMatch) {
      const patch = {
        name: bestMatch.name,
        percent: bestMatch.percent,
        category: bestMatch.category,
        categoryIcon: bestMatch.categoryIcon,
        updatedAt: serverTimestamp(),
      };
      if (sd.order == null) patch.order = 99;
      console.log('\n→ DECISION: Repairable. Matched to real skill:', bestMatch.name);
      console.log('Patch:', JSON.stringify(patch, null, 2));
      await updateDoc(skillRef, patch);
      console.log('✅ Repaired.');
    } else {
      console.log('\n→ DECISION: No name, cannot map to any real skill without ambiguity. DELETING orphan.');
      await deleteDoc(skillRef);
      console.log('✅ Deleted skills/06HbU5ih4aJkAX4iq7Je');
    }
  } else if (hasName && hasPercent && hasCategory) {
    console.log('\n→ DECISION: Document has all required fields. No repair needed.');
    console.log('  name:', sd.name, '| percent:', sd.percent, '| category:', sd.category);
  } else {
    // Has some but not all required fields
    console.log('\n→ DECISION: Partial document. Non-meta fields:', nonMetaFields);
    // If it can't be confidently mapped: DELETE
    console.log('Cannot confidently repair without ambiguity. DELETING.');
    await deleteDoc(skillRef);
    console.log('✅ Deleted skills/06HbU5ih4aJkAX4iq7Je');
  }
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: Read ALL existing navbarItems
// ═══════════════════════════════════════════════════════════════
console.log('\n\nReading all Firestore navbarItems...');
const navSnap = await getDocs(collection(db, 'navbarItems'));
const navDocs = navSnap.docs.map(d => ({ id: d.id, ...d.data() }));
console.log(`Found ${navDocs.length} navbar docs:`);
navDocs.forEach(n => console.log(`  ${n.id}: label="${n.label}" href="${n.href}" path="${n.path}" order=${n.order}`));

// ═══════════════════════════════════════════════════════════════
// STEP 4: Read target navbar doc
// ═══════════════════════════════════════════════════════════════
const navRef = doc(db, 'navbarItems', '5bb3KHzUtAXZnpHZFeYS');
const navDocSnap = await getDoc(navRef);

console.log('\n═══════════════════════════════════════════════════');
console.log('DOC: navbarItems/5bb3KHzUtAXZnpHZFeYS');
console.log('═══════════════════════════════════════════════════');

if (!navDocSnap.exists()) {
  console.log('Document does not exist. Already cleaned up.');
} else {
  const nd = navDocSnap.data();
  console.log('Current data:', JSON.stringify(nd, null, 2));

  const label = nd.label || nd.name || nd.title || '';
  const href  = nd.href  || nd.path || nd.url  || nd.link || '';

  // If it has an href, find the matching real nav link
  const matchedRealNav = realNavLinks.find(l => l.href === href);

  // Check if this is a duplicate of another doc that already has a label
  const existingWithSameHref = navDocs.filter(
    n => n.id !== '5bb3KHzUtAXZnpHZFeYS' && (n.href === href || n.path === href)
  );

  if (existingWithSameHref.length > 0 && existingWithSameHref.some(n => n.label)) {
    console.log('\n→ DECISION: This is a DUPLICATE of:', existingWithSameHref.map(n => n.id).join(', '));
    console.log('Duplicate already exists with label. DELETING orphan.');
    await deleteDoc(navRef);
    console.log('✅ Deleted navbarItems/5bb3KHzUtAXZnpHZFeYS');
  } else if (href && matchedRealNav) {
    // Has an href that maps to a real nav link — repair the label
    const patch = {
      label: matchedRealNav.label,
      href: matchedRealNav.href,
      order: nd.order ?? matchedRealNav.order,
      updatedAt: serverTimestamp(),
    };
    // Remove legacy field aliases if present
    if (nd.path && !nd.href) patch.href = nd.path;

    console.log('\n→ DECISION: Repairable. Matched to real nav link:', matchedRealNav.label);
    console.log('Patch:', JSON.stringify({ ...patch, updatedAt: '<serverTimestamp>' }, null, 2));
    await updateDoc(navRef, patch);
    console.log('✅ Repaired.');
  } else if (!label && !href) {
    const nonMetaFields = Object.keys(nd).filter(k => !['createdAt','updatedAt','order'].includes(k));
    console.log('\n→ DECISION: No label, no href. Non-meta fields:', nonMetaFields);
    console.log('DELETING empty/unresolvable navbar item.');
    await deleteDoc(navRef);
    console.log('✅ Deleted navbarItems/5bb3KHzUtAXZnpHZFeYS');
  } else if (label && href) {
    console.log('\n→ DECISION: Document has all required fields. No repair needed.');
  } else {
    // Has href but no matching real nav AND no label — check if we can derive
    console.log('\n→ DECISION: Partial. href:', href, 'label:', label);
    if (!label) {
      // Use href to derive label
      const derived = href.replace('#', '');
      const capitalized = derived.charAt(0).toUpperCase() + derived.slice(1);
      const patch = { label: capitalized, updatedAt: serverTimestamp() };
      console.log('Derived label from href:', capitalized);
      await updateDoc(navRef, patch);
      console.log('✅ Repaired with derived label.');
    }
  }
}

console.log('\n\n✅ Repair complete. Reload the Dashboard to verify Health Score.\n');
process.exit(0);
