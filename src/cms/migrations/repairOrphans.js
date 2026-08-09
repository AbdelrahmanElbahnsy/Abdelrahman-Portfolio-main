/**
 * repairOrphans.js
 *
 * Runs INSIDE the authenticated browser context.
 * Reads the two known broken documents, classifies them against
 * the real portfolioData, and repairs or deletes them.
 *
 * Source of truth priority:
 *   1. portfolioData.js (canonical reference)
 *   2. Other Firestore documents in the same collection
 *   3. DELETE if unresolvable
 */
import {
  doc, getDoc, getDocs, collection,
  updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';

// ─── Real skill data from portfolioData.js ───────────────────────────────────
const REAL_SKILLS_FROM_PORTFOLIO = [
  // Cloud Platform
  { name: 'VM & VNet',                      category: 'Cloud Platform',             categoryIcon: 'SiMicrosoftazure', percent: 90,  order: 0  },
  { name: 'Microsoft Entra ID & Security',  category: 'Cloud Platform',             categoryIcon: 'SiMicrosoftazure', percent: 85,  order: 1  },
  { name: 'Storage Account',                category: 'Cloud Platform',             categoryIcon: 'SiMicrosoftazure', percent: 88,  order: 2  },
  { name: 'Load Balancer',                  category: 'Cloud Platform',             categoryIcon: 'SiMicrosoftazure', percent: 82,  order: 3  },
  // DevOps & CI/CD
  { name: 'Jenkins',                        category: 'DevOps & CI/CD',             categoryIcon: 'fas fa-infinity',  percent: 88,  order: 4  },
  { name: 'GitHub Actions',                 category: 'DevOps & CI/CD',             categoryIcon: 'fas fa-infinity',  percent: 85,  order: 5  },
  { name: 'CI/CD Pipelines',               category: 'DevOps & CI/CD',             categoryIcon: 'fas fa-infinity',  percent: 90,  order: 6  },
  { name: 'Automation',                     category: 'DevOps & CI/CD',             categoryIcon: 'fas fa-infinity',  percent: 87,  order: 7  },
  // Containers
  { name: 'Docker',                         category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker',    percent: 92,  order: 8  },
  { name: 'Docker Compose',                 category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker',    percent: 88,  order: 9  },
  { name: 'Kubernetes',                     category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker',    percent: 85,  order: 10 },
  { name: 'Container Security',             category: 'Containers & Orchestration', categoryIcon: 'fab fa-docker',    percent: 80,  order: 11 },
  // IaC
  { name: 'Terraform',                      category: 'Infrastructure as Code',     categoryIcon: 'fas fa-code-branch', percent: 87, order: 12 },
  { name: 'Infrastructure Automation',      category: 'Infrastructure as Code',     categoryIcon: 'fas fa-code-branch', percent: 85, order: 13 },
  { name: 'Provisioning',                   category: 'Infrastructure as Code',     categoryIcon: 'fas fa-code-branch', percent: 83, order: 14 },
  // Networking
  { name: 'Routing & Switching',            category: 'Networking',                 categoryIcon: 'fas fa-network-wired', percent: 92, order: 15 },
  { name: 'TCP/IP',                         category: 'Networking',                 categoryIcon: 'fas fa-network-wired', percent: 90, order: 16 },
  { name: 'Network Security',               category: 'Networking',                 categoryIcon: 'fas fa-network-wired', percent: 85, order: 17 },
  { name: 'Load Balancing',                 category: 'Networking',                 categoryIcon: 'fas fa-network-wired', percent: 84, order: 18 },
  // Programming
  { name: 'Python',                         category: 'Programming & Scripting',    categoryIcon: 'fas fa-terminal',  percent: 85,  order: 19 },
  { name: 'Bash',                           category: 'Programming & Scripting',    categoryIcon: 'fas fa-terminal',  percent: 82,  order: 20 },
  { name: 'Shell Scripting',               category: 'Programming & Scripting',    categoryIcon: 'fas fa-terminal',  percent: 80,  order: 21 },
  // OS
  { name: 'Linux Administration',           category: 'Operating Systems',          categoryIcon: 'fab fa-linux',     percent: 92,  order: 22 },
  { name: 'Windows Server',                 category: 'Operating Systems',          categoryIcon: 'fab fa-linux',     percent: 85,  order: 23 },
  { name: 'System Hardening',              category: 'Operating Systems',          categoryIcon: 'fab fa-linux',     percent: 83,  order: 24 },
  { name: 'Process Management',            category: 'Operating Systems',          categoryIcon: 'fab fa-linux',     percent: 86,  order: 25 },
  // Monitoring
  { name: 'Prometheus',                     category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 88, order: 26 },
  { name: 'Grafana',                        category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 87, order: 27 },
  { name: 'Logging (ELK / Loki)',          category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 85, order: 28 },
  { name: 'Metrics & Alerting',            category: 'Monitoring & Observability', categoryIcon: 'fas fa-chart-line', percent: 86, order: 29 },
  // Top Skills (circular)
  { name: 'Cloud',       category: 'Top Skills', categoryIcon: 'SiMicrosoftazure',    percent: 90, isCircular: true, circularSub: 'Azure Expert',  order: 30 },
  { name: 'Containers',  category: 'Top Skills', categoryIcon: 'fab fa-docker',        percent: 88, isCircular: true, circularSub: 'Docker + K8s',  order: 31 },
  { name: 'CI/CD',       category: 'Top Skills', categoryIcon: 'fas fa-infinity',      percent: 92, isCircular: true, circularSub: 'Pipelines',     order: 32 },
  { name: 'IaC',         category: 'Top Skills', categoryIcon: 'fas fa-code-branch',   percent: 85, isCircular: true, circularSub: 'Terraform',     order: 33 },
  { name: 'Networking',  category: 'Top Skills', categoryIcon: 'fas fa-network-wired', percent: 80, isCircular: true, circularSub: 'CCNA',          order: 34 },
];

// ─── Real navbar data from Navbar.jsx defaultNavLinks ────────────────────────
const REAL_NAV_LINKS_FROM_PORTFOLIO = [
  { label: 'Home',           href: '#hero',           order: 0, visible: true },
  { label: 'About',          href: '#about',           order: 1, visible: true },
  { label: 'Skills',         href: '#skills',          order: 2, visible: true },
  { label: 'Journey',        href: '#journey',         order: 3, visible: true },
  { label: 'Projects',       href: '#projects',        order: 4, visible: true },
  { label: 'Certifications', href: '#certifications',  order: 5, visible: true },
];

export async function repairOrphans() {
  const log = [];
  const result = { repaired: 0, deleted: 0, skipped: 0, errors: [] };

  const push = (msg) => { log.push(msg); console.log(msg); };

  // ─── SKILLS ──────────────────────────────────────────────────────────────
  push('\n═══════ STEP 1: Read all Firestore skills ═══════');
  const allSkillsSnap = await getDocs(collection(db, 'skills'));
  const firestoreSkillsByName = new Map();
  allSkillsSnap.forEach(d => {
    const name = d.data().name;
    if (name) firestoreSkillsByName.set(name, { id: d.id, ...d.data() });
  });

  push(`Found ${allSkillsSnap.size} skill docs. Named: ${firestoreSkillsByName.size}`);
  const namedSkillNames = new Set(firestoreSkillsByName.keys());
  const missingFromFirestore = REAL_SKILLS_FROM_PORTFOLIO.filter(s => !namedSkillNames.has(s.name));
  push(`Skills in portfolioData NOT yet in Firestore: [${missingFromFirestore.map(s => s.name).join(', ')}]`);

  // ─── skills/06HbU5ih4aJkAX4iq7Je ────────────────────────────────────────
  push('\n═══════ skills/06HbU5ih4aJkAX4iq7Je ═══════');
  const skillRef = doc(db, 'skills', '06HbU5ih4aJkAX4iq7Je');
  const skillSnap = await getDoc(skillRef);

  if (!skillSnap.exists()) {
    push('→ Document does NOT exist. Already removed.');
    result.skipped++;
  } else {
    const sd = skillSnap.data();
    push('BEFORE:');
    push(JSON.stringify(sd, null, 2));

    const metaOnly = ['createdAt', 'updatedAt'];
    const nonMetaKeys = Object.keys(sd).filter(k => !metaOnly.includes(k));
    const hasName     = !!(sd.name   && sd.name.trim());
    const hasPercent  = sd.percent != null;
    const hasCategory = !!(sd.category && sd.category.trim());
    const requiredPresent = [hasName, hasPercent, hasCategory].filter(Boolean).length;
    const isOrphan = !hasName && !hasPercent && !hasCategory;

    push(`Non-meta fields: [${nonMetaKeys.join(', ')}]`);
    push(`Required present: ${requiredPresent}/3  isOrphan: ${isOrphan}`);

    if (isOrphan || nonMetaKeys.length === 0) {
      push('→ DECISION: Empty/orphan. DELETING.');
      await deleteDoc(skillRef);
      push('✅ Deleted.');
      result.deleted++;
    } else if (!hasName && missingFromFirestore.length > 0) {
      // Has some fields but no name. Try to match by percent + category
      let best = null;
      for (const candidate of missingFromFirestore) {
        if (sd.percent === candidate.percent && sd.category === candidate.category) {
          best = candidate; break;
        }
      }
      if (!best) {
        // Try just percent
        for (const candidate of missingFromFirestore) {
          if (sd.percent === candidate.percent) { best = candidate; break; }
        }
      }
      if (!best) {
        // Try just category
        for (const candidate of missingFromFirestore) {
          if (sd.category === candidate.category) { best = candidate; break; }
        }
      }

      if (best) {
        const patch = {
          name:         best.name,
          percent:      best.percent,
          category:     best.category,
          categoryIcon: best.categoryIcon,
          order:        sd.order ?? best.order,
          isCircular:   best.isCircular ?? false,
          ...(best.circularSub ? { circularSub: best.circularSub } : {}),
          updatedAt:    serverTimestamp(),
        };
        push(`→ DECISION: Repaired. Mapped to real skill: "${best.name}"`);
        push(`  Source: portfolioData.js → skills.categories`);
        push('AFTER:');
        push(JSON.stringify({ ...sd, ...patch, updatedAt: '<serverTimestamp>' }, null, 2));
        await updateDoc(skillRef, patch);
        push('✅ Repaired.');
        result.repaired++;
      } else {
        push('→ DECISION: Cannot map to any real skill without ambiguity. DELETING orphan.');
        push('  Reason: no percent/category match to any portfolioData skill name that is missing from Firestore');
        await deleteDoc(skillRef);
        push('✅ Deleted.');
        result.deleted++;
      }
    } else if (hasName && hasPercent && hasCategory) {
      push('→ DECISION: Already valid. Skipping.');
      result.skipped++;
    } else {
      push('→ DECISION: Partial doc, cannot confidently map. DELETING.');
      await deleteDoc(skillRef);
      push('✅ Deleted.');
      result.deleted++;
    }
  }

  // ─── NAVBAR ──────────────────────────────────────────────────────────────
  push('\n═══════ STEP 2: Read all Firestore navbarItems ═══════');
  const allNavSnap = await getDocs(collection(db, 'navbarItems'));
  const navDocs = allNavSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  push(`Found ${navDocs.length} navbar docs:`);
  navDocs.forEach(n => push(`  ${n.id}: label="${n.label}" href="${n.href}" path="${n.path}" order=${n.order}`));

  // Which real nav labels are already covered?
  const coveredHrefs = new Set(
    navDocs
      .filter(n => n.id !== '5bb3KHzUtAXZnpHZFeYS' && n.label)
      .map(n => n.href || n.path || '')
  );
  push(`Covered hrefs (with labels): [${[...coveredHrefs].join(', ')}]`);

  push('\n═══════ navbarItems/5bb3KHzUtAXZnpHZFeYS ═══════');
  const navRef = doc(db, 'navbarItems', '5bb3KHzUtAXZnpHZFeYS');
  const navSnap = await getDoc(navRef);

  if (!navSnap.exists()) {
    push('→ Document does NOT exist. Already removed.');
    result.skipped++;
  } else {
    const nd = navSnap.data();
    push('BEFORE:');
    push(JSON.stringify(nd, null, 2));

    const label = nd.label || nd.name || nd.title || '';
    const href  = nd.href  || nd.path || nd.url  || nd.link || '';

    // Check if it's a duplicate of an already-labelled doc
    const duplicateWithLabel = navDocs.find(
      n => n.id !== '5bb3KHzUtAXZnpHZFeYS' && n.label &&
           (n.href === href || n.path === href || n.href === (nd.href || nd.path) || n.path === (nd.href || nd.path))
    );

    if (duplicateWithLabel) {
      push(`→ DECISION: DUPLICATE of ${duplicateWithLabel.id} ("${duplicateWithLabel.label}"). DELETING.`);
      await deleteDoc(navRef);
      push('✅ Deleted duplicate.');
      result.deleted++;
    } else if (href) {
      // Find matching real nav link
      const match = REAL_NAV_LINKS_FROM_PORTFOLIO.find(l => l.href === href);
      if (match && !coveredHrefs.has(href)) {
        const patch = {
          label:     match.label,
          href:      match.href,
          order:     nd.order ?? match.order,
          visible:   nd.visible ?? match.visible,
          updatedAt: serverTimestamp(),
        };
        push(`→ DECISION: Repaired. Matched href "${href}" to real nav link: "${match.label}"`);
        push('  Source: Navbar.jsx → defaultNavLinks');
        push('AFTER:');
        push(JSON.stringify({ ...nd, ...patch, updatedAt: '<serverTimestamp>' }, null, 2));
        await updateDoc(navRef, patch);
        push('✅ Repaired.');
        result.repaired++;
      } else if (match && coveredHrefs.has(href)) {
        push(`→ DECISION: href "${href}" already covered by another doc with label. This is a duplicate. DELETING.`);
        await deleteDoc(navRef);
        push('✅ Deleted duplicate.');
        result.deleted++;
      } else {
        // href not in real nav — obsolete item
        push(`→ DECISION: href "${href}" is not in real portfolio nav. DELETING obsolete item.`);
        await deleteDoc(navRef);
        push('✅ Deleted obsolete.');
        result.deleted++;
      }
    } else {
      // No href and no label — pure orphan
      push('→ DECISION: No label, no href. Pure orphan. DELETING.');
      await deleteDoc(navRef);
      push('✅ Deleted orphan.');
      result.deleted++;
    }
  }

  push('\n═══════ REPAIR COMPLETE ═══════');
  push(`Repaired: ${result.repaired}  Deleted: ${result.deleted}  Skipped: ${result.skipped}`);

  // Fire dashboard-update so DashboardContext refetches immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dashboard-update'));
    push('✅ dashboard-update event fired → DashboardContext will refetch.');
  }

  return { ...result, log };
}
