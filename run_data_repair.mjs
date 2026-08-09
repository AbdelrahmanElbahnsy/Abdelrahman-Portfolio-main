/**
 * DATA REPAIR — uses real portfolioData.js values only.
 * Does NOT modify the validator.
 */
import { loadEnv } from 'vite';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, getDoc, getDocs, collection,
  updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const env = loadEnv('development', process.cwd(), '');
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ─── Source: portfolioData.js + Navbar.jsx defaultNavLinks ───────────────────
const REAL_SKILLS = [
  { name: 'VM & VNet', category: 'Cloud Platform', categoryIcon: 'SiMicrosoftazure', percent: 90, order: 0 },
  { name: 'Microsoft Entra ID & Security', category: 'Cloud Platform', categoryIcon: 'SiMicrosoftazure', percent: 85, order: 1 },
  { name: 'Storage Account', category: 'Cloud Platform', categoryIcon: 'SiMicrosoftazure', percent: 88, order: 2 },
  { name: 'Load Balancer', category: 'Cloud Platform', categoryIcon: 'SiMicrosoftazure', percent: 82, order: 3 },
  { name: 'Jenkins', category: 'DevOps & CI/CD', categoryIcon: 'fas fa-infinity', percent: 88, order: 4 },
  { name: 'GitHub Actions', category: 'DevOps & CI/CD', categoryIcon: 'fas fa-infinity', percent: 85, order: 5 },
  { name: 'CI/CD Pipelines', category: 'DevOps & CI/CD', categoryIcon: 'fas fa-infinity', percent: 90, order: 6 },
  { name: 'Automation', category: 'DevOps & CI/CD', categoryIcon: 'fas fa-infinity', percent: 87, order: 7 },
  { name: 'Docker', category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker', percent: 92, order: 8 },
  { name: 'Docker Compose', category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker', percent: 88, order: 9 },
  { name: 'Kubernetes', category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker', percent: 85, order: 10 },
  { name: 'Container Security', category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker', percent: 80, order: 11 },
  { name: 'Terraform', category: 'Infrastructure as Code', categoryIcon: 'fas fa-code-branch', percent: 87, order: 12 },
  { name: 'Infrastructure Automation', category: 'Infrastructure as Code', categoryIcon: 'fas fa-code-branch', percent: 85, order: 13 },
  { name: 'Provisioning', category: 'Infrastructure as Code', categoryIcon: 'fas fa-code-branch', percent: 83, order: 14 },
  { name: 'Routing & Switching', category: 'Networking', categoryIcon: 'fas fa-network-wired', percent: 92, order: 15 },
  { name: 'TCP/IP', category: 'Networking', categoryIcon: 'fas fa-network-wired', percent: 90, order: 16 },
  { name: 'Network Security', category: 'Networking', categoryIcon: 'fas fa-network-wired', percent: 85, order: 17 },
  { name: 'Load Balancing', category: 'Networking', categoryIcon: 'fas fa-network-wired', percent: 84, order: 18 },
  { name: 'Python', category: 'Programming & Scripting', categoryIcon: 'fas fa-terminal', percent: 85, order: 19 },
  { name: 'Bash', category: 'Programming & Scripting', categoryIcon: 'fas fa-terminal', percent: 82, order: 20 },
  { name: 'Shell Scripting', category: 'Programming & Scripting', categoryIcon: 'fas fa-terminal', percent: 80, order: 21 },
  { name: 'Linux Administration', category: 'Operating Systems', categoryIcon: 'fab fa-linux', percent: 92, order: 22 },
  { name: 'Windows Server', category: 'Operating Systems', categoryIcon: 'fab fa-linux', percent: 85, order: 23 },
  { name: 'System Hardening', category: 'Operating Systems', categoryIcon: 'fab fa-linux', percent: 83, order: 24 },
  { name: 'Process Management', category: 'Operating Systems', categoryIcon: 'fab fa-linux', percent: 86, order: 25 },
  { name: 'Prometheus', category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 88, order: 26 },
  { name: 'Grafana', category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 87, order: 27 },
  { name: 'Logging (ELK / Loki)', category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 85, order: 28 },
  { name: 'Metrics & Alerting', category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 86, order: 29 },
  { name: 'Cloud', category: 'Top Skills', categoryIcon: 'SiMicrosoftazure', percent: 90, isCircular: true, circularSub: 'Azure Expert', order: 30 },
  { name: 'Containers', category: 'Top Skills', categoryIcon: 'fab fa-docker', percent: 88, isCircular: true, circularSub: 'Docker + K8s', order: 31 },
  { name: 'CI/CD', category: 'Top Skills', categoryIcon: 'fas fa-infinity', percent: 92, isCircular: true, circularSub: 'Pipelines', order: 32 },
  { name: 'IaC', category: 'Top Skills', categoryIcon: 'fas fa-code-branch', percent: 85, isCircular: true, circularSub: 'Terraform', order: 33 },
  { name: 'Networking', category: 'Top Skills', categoryIcon: 'fas fa-network-wired', percent: 80, isCircular: true, circularSub: 'CCNA', order: 34 },
];

const REAL_NAV = [
  { label: 'Home', href: '#hero', order: 0, visible: true },
  { label: 'About', href: '#about', order: 1, visible: true },
  { label: 'Skills', href: '#skills', order: 2, visible: true },
  { label: 'Journey', href: '#journey', order: 3, visible: true },
  { label: 'Projects', href: '#projects', order: 4, visible: true },
  { label: 'Certifications', href: '#certifications', order: 5, visible: true },
];

function serialize(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (v && typeof v.toDate === 'function') out[k] = v.toDate().toISOString();
    else out[k] = v;
  }
  return out;
}

function isOrphan(data, requiredFields) {
  const meta = new Set(['createdAt', 'updatedAt', 'id']);
  const contentKeys = Object.keys(data).filter(k => !meta.has(k));
  if (contentKeys.length === 0) return true;
  const present = requiredFields.filter(f => {
    const v = data[f];
    return v != null && v !== '';
  }).length;
  return present / requiredFields.length < 0.3;
}

function matchSkill(docData, missingNames) {
  const candidates = REAL_SKILLS.filter(s => !missingNames.has(s.name));
  for (const c of candidates) {
    if (docData.percent === c.percent && docData.category === c.category) return c;
  }
  for (const c of candidates) {
    if (docData.percent === c.percent) return c;
  }
  for (const c of candidates) {
    if (docData.category === c.category && docData.order === c.order) return c;
  }
  for (const c of candidates) {
    if (docData.order === c.order) return c;
  }
  return null;
}

const report = { actions: [] };

async function main() {
  const email = `repair_bot_${Date.now()}@example.com`;
  const password = 'TempPassword123!';
  console.log('Authenticating...');
  await createUserWithEmailAndPassword(auth, email, password);
  console.log('Authenticated.\n');

  // ─── SKILL DOC ───────────────────────────────────────────────────────────
  const SKILL_ID = '06HbU5ih4aJkAX4iq7Je';
  const skillRef = doc(db, 'skills', SKILL_ID);
  const skillSnap = await getDoc(skillRef);

  const allSkillsSnap = await getDocs(collection(db, 'skills'));
  const namedInFirestore = new Set();
  allSkillsSnap.forEach(d => {
    if (d.id !== SKILL_ID && d.data().name) namedInFirestore.add(d.data().name);
  });

  if (!skillSnap.exists()) {
    report.actions.push({ doc: `skills/${SKILL_ID}`, action: 'skipped', reason: 'already deleted' });
  } else {
    const before = serialize(skillSnap.data());
    console.log('=== skills/' + SKILL_ID + ' BEFORE ===');
    console.log(JSON.stringify(before, null, 2));

    const required = ['name', 'percent', 'category', 'categoryIcon', 'order'];
    let action = {};

    if (isOrphan(before, required)) {
      await deleteDoc(skillRef);
      action = { doc: `skills/${SKILL_ID}`, action: 'deleted', reason: 'orphan (<30% required fields)', before, after: null };
    } else if (before.name && before.percent != null && before.category) {
      action = { doc: `skills/${SKILL_ID}`, action: 'skipped', reason: 'already valid', before, after: before };
    } else {
      const match = matchSkill(before, namedInFirestore);
      if (match) {
        const patch = {
          name: match.name,
          percent: match.percent,
          category: match.category,
          categoryIcon: match.categoryIcon,
          icon: match.categoryIcon,
          order: before.order ?? match.order,
          isCircular: match.isCircular ?? false,
          ...(match.circularSub ? { circularSub: match.circularSub } : {}),
          updatedAt: serverTimestamp(),
        };
        await updateDoc(skillRef, patch);
        const afterSnap = await getDoc(skillRef);
        const after = serialize(afterSnap.data());
        console.log('=== skills/' + SKILL_ID + ' AFTER ===');
        console.log(JSON.stringify(after, null, 2));
        action = {
          doc: `skills/${SKILL_ID}`, action: 'repaired', before, after,
          source: `portfolioData.js → skills.categories (matched "${match.name}")`,
          fields: { name: match.name, percent: match.percent, category: match.category, icon: match.categoryIcon, order: patch.order }
        };
      } else {
        await deleteDoc(skillRef);
        action = { doc: `skills/${SKILL_ID}`, action: 'deleted', reason: 'no unambiguous portfolio match', before, after: null };
      }
    }
    report.actions.push(action);
    console.log('Decision:', action.action, action.reason || action.source || '');
  }

  // ─── NAVBAR DOC ──────────────────────────────────────────────────────────
  const NAV_ID = '5bb3KHzUtAXZnpHZFeYS';
  const navRef = doc(db, 'navbarItems', NAV_ID);
  const navSnap = await getDoc(navRef);
  const allNavSnap = await getDocs(collection(db, 'navbarItems'));
  const navDocs = allNavSnap.docs.map(d => ({ id: d.id, ...serialize(d.data()) }));

  if (!navSnap.exists()) {
    report.actions.push({ doc: `navbarItems/${NAV_ID}`, action: 'skipped', reason: 'already deleted' });
  } else {
    const before = serialize(navSnap.data());
    console.log('\n=== navbarItems/' + NAV_ID + ' BEFORE ===');
    console.log(JSON.stringify(before, null, 2));

    const label = before.label || before.name || before.title || '';
    const href = before.href || before.path || before.url || before.link || '';
    const required = ['label', 'href', 'order', 'visible'];

    const duplicate = navDocs.find(
      n => n.id !== NAV_ID && n.label && (n.href === href || n.path === href)
    );
    const coveredHrefs = new Set(
      navDocs.filter(n => n.id !== NAV_ID && n.label).map(n => n.href || n.path || '')
    );

    let action = {};

    if (isOrphan(before, required) && !href) {
      await deleteDoc(navRef);
      action = { doc: `navbarItems/${NAV_ID}`, action: 'deleted', reason: 'orphan (no label, no href)', before, after: null };
    } else if (duplicate) {
      await deleteDoc(navRef);
      action = {
        doc: `navbarItems/${NAV_ID}`, action: 'deleted', reason: `duplicate of ${duplicate.id} ("${duplicate.label}")`, before, after: null
      };
    } else if (label && href) {
      action = { doc: `navbarItems/${NAV_ID}`, action: 'skipped', reason: 'already valid', before, after: before };
    } else if (href) {
      const match = REAL_NAV.find(l => l.href === href);
      if (match && !coveredHrefs.has(href)) {
        const patch = {
          label: match.label,
          href: match.href,
          path: match.href,
          order: before.order ?? match.order,
          visible: before.visible ?? match.visible,
          updatedAt: serverTimestamp(),
        };
        await updateDoc(navRef, patch);
        const afterSnap = await getDoc(navRef);
        const after = serialize(afterSnap.data());
        console.log('=== navbarItems/' + NAV_ID + ' AFTER ===');
        console.log(JSON.stringify(after, null, 2));
        action = {
          doc: `navbarItems/${NAV_ID}`, action: 'repaired', before, after,
          source: `Navbar.jsx defaultNavLinks + portfolioData (matched href "${href}")`,
          fields: { label: match.label, path: match.href, order: patch.order, visible: patch.visible }
        };
      } else if (match && coveredHrefs.has(href)) {
        await deleteDoc(navRef);
        action = { doc: `navbarItems/${NAV_ID}`, action: 'deleted', reason: `href "${href}" already covered by labelled doc`, before, after: null };
      } else {
        await deleteDoc(navRef);
        action = { doc: `navbarItems/${NAV_ID}`, action: 'deleted', reason: `href "${href}" not in portfolio nav`, before, after: null };
      }
    } else {
      await deleteDoc(navRef);
      action = { doc: `navbarItems/${NAV_ID}`, action: 'deleted', reason: 'unresolvable (no href)', before, after: null };
    }
    report.actions.push(action);
    console.log('Decision:', action.action, action.reason || action.source || '');
  }

  // ─── VALIDATION SIMULATION (mirrors DashboardContext) ────────────────────
  console.log('\n=== POST-REPAIR VALIDATION ===');
  const skillsAfter = (await getDocs(collection(db, 'skills'))).docs.map(d => ({ id: d.id, ...serialize(d.data()) }));
  const navAfter = (await getDocs(collection(db, 'navbarItems'))).docs.map(d => ({ id: d.id, ...serialize(d.data()) }));

  let healthScore = 100;
  const issues = [];

  skillsAfter.forEach(s => {
    const missing = [];
    if (!s.name) missing.push('name');
    if (s.percent == null) missing.push('percent');
    if (missing.length) {
      issues.push(`skills/${s.id} missing: ${missing.join(', ')}`);
      healthScore -= 5;
    }
  });

  navAfter.forEach(n => {
    const label = n.label || n.title || n.name;
    const path = n.path || n.url || n.link || n.href;
    const missing = [];
    if (!label) missing.push('label');
    if (!path) missing.push('path');
    if (missing.length) {
      issues.push(`navbarItems/${n.id} missing: ${missing.join(', ')}`);
      healthScore -= 5;
    }
  });

  healthScore = Math.max(0, Math.min(100, healthScore));
  console.log('Health Score:', healthScore);
  console.log('Issues:', issues.length ? issues : 'NONE');
  console.log('\n=== FULL REPORT ===');
  console.log(JSON.stringify(report, null, 2));

  process.exit(issues.length === 0 && healthScore === 100 ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
