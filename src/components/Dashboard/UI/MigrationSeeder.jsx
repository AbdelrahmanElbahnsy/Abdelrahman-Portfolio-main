import React, { useState } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { 
  personalInfo, about, contact, socialLinks, projects, skills, certifications, journey 
} from '../../../data/portfolioData';
import { AlertTriangle, Database, Play, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MigrationSeeder() {
  const [logs, setLogs] = useState([]);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasDryRun, setHasDryRun] = useState(false);

  const executeSeed = async (isDryRun = true) => {
    if (isDryRun) {
      setIsDryRunning(true);
      setLogs([]);
    } else {
      setIsExecuting(true);
    }

    const results = [];
    const logResult = (type, col, id, msg, payload = null) => {
      const entry = { type, collection: col, docId: id, message: msg, payload };
      results.push(entry);
      if (isDryRun) {
        setLogs(prev => [...prev, entry]);
      } else {
        if (type === 'CREATE' && payload) {
           const ref = doc(db, col, id);
           setDoc(ref, payload).then(() => {
             setLogs(prev => [...prev, { ...entry, message: msg + ' (SUCCESS)' }]);
           }).catch(err => {
             setLogs(prev => [...prev, { ...entry, type: 'ERROR', message: msg + ` (FAILED: ${err.message})` }]);
           });
        } else {
           setLogs(prev => [...prev, entry]);
        }
      }
    };

    try {
      // 1. HERO
      const heroRef = doc(db, 'hero', 'main');
      const heroSnap = await getDoc(heroRef);
      if (heroSnap.exists()) {
        logResult('SKIP', 'hero', 'main', 'Document already exists.');
      } else {
        const heroPayload = {
          firstName: personalInfo.firstName || '',
          lastName: personalInfo.lastName || '',
          fullName: personalInfo.fullName || '',
          badge: personalInfo.badge || '',
          roles: Array.isArray(personalInfo.roles) ? personalInfo.roles.join(', ') : (personalInfo.roles || ''),
          description: personalInfo.description || '',
          portrait: personalInfo.portrait || '',
          cvUrl: personalInfo.cvUrl || '',
          availabilityStatus: 'Available for New Challenges',
          cta1: 'Download CV',
          cta2: 'Contact Me',
          fullNameAr: personalInfo.fullNameAr || '',
          rolesAr: Array.isArray(personalInfo.rolesAr) ? personalInfo.rolesAr.join(', ') : (personalInfo.rolesAr || ''),
          descriptionAr: personalInfo.descriptionAr || '',
          badgeAr: personalInfo.badgeAr || ''
        };
        logResult('CREATE', 'hero', 'main', 'Will create hero document.', heroPayload);
      }

      // 2. ABOUT
      const aboutRef = doc(db, 'about', 'main');
      const aboutSnap = await getDoc(aboutRef);
      if (aboutSnap.exists()) {
        logResult('SKIP', 'about', 'main', 'Document already exists.');
      } else {
        const aboutPayload = {
          subtitle: about.subtitle || '',
          title: about.title || '',
          lead: about.lead || '',
          paragraphsJson: JSON.stringify(about.paragraphs || []),
          badgesJson: JSON.stringify(about.badges || []),
          terminalItemsJson: JSON.stringify(about.terminalItems || [])
        };
        logResult('CREATE', 'about', 'main', 'Will create about document.', aboutPayload);
      }

      // 3. PROFILE
      const profileRef = doc(db, 'profile', 'main');
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        logResult('SKIP', 'profile', 'main', 'Document already exists.');
      } else {
        const profilePayload = {
          firstName: personalInfo.firstName || '',
          lastName: personalInfo.lastName || '',
          fullName: personalInfo.fullName || '',
          firstNameAr: personalInfo.firstNameAr || '',
          lastNameAr: personalInfo.lastNameAr || '',
          fullNameAr: personalInfo.fullNameAr || ''
        };
        logResult('CREATE', 'profile', 'main', 'Will create profile document.', profilePayload);
      }

      // 4. CONTACT
      const contactRef = doc(db, 'contact', 'main');
      const contactSnap = await getDoc(contactRef);
      if (contactSnap.exists()) {
        logResult('SKIP', 'contact', 'main', 'Document already exists.');
      } else {
        const emails = [];
        const phones = [];
        const locations = [];
        let legacyEmail = '';
        let legacyPhone = '';
        let legacyLocation = '';

        if (contact && contact.channels) {
          contact.channels.forEach(ch => {
            const id = Math.random().toString(36).substring(2, 11);
            if (ch.label === 'Email') {
              const isPrimary = emails.length === 0;
              emails.push({ id, value: ch.value, label: 'Personal', isPrimary });
              if (isPrimary) legacyEmail = ch.value;
            } else if (ch.label === 'Phone') {
              const isPrimary = phones.length === 0;
              phones.push({ id, value: ch.value, label: 'Mobile', isPrimary });
              if (isPrimary) legacyPhone = ch.value;
            } else if (ch.label === 'Location') {
              const isPrimary = locations.length === 0;
              locations.push({ id, value: ch.value, label: 'Home', isPrimary });
              if (isPrimary) legacyLocation = ch.value;
            }
          });
        }

        const contactPayload = {
          emails, phones, locations,
          email: legacyEmail, phone: legacyPhone, location: legacyLocation
        };
        logResult('CREATE', 'contact', 'main', 'Will create contact document.', contactPayload);
      }

      // 5. SOCIALS
      const socialsSnap = await getDocs(collection(db, 'socials'));
      const existingSocials = socialsSnap.docs.map(d => d.data());
      
      const sourceSocials = [...(socialLinks.airplane || []), ...(socialLinks.floating || [])];
      const uniqueSourceSocials = Array.from(new Map(sourceSocials.map(item => [item.link || item.href, item])).values());

      uniqueSourceSocials.forEach((social, idx) => {
        const url = social.link || social.href;
        const exists = existingSocials.some(s => s.url === url);
        const docId = 'social-' + idx;
        if (exists) {
          logResult('SKIP', 'socials', docId, `Equivalent social link already exists for ${url}`);
        } else {
          const payload = {
            platform: social.label || social.title || 'Social',
            url: url,
            icon: social.icon || ''
          };
          logResult('CREATE', 'socials', docId, `Will create social link for ${url}`, payload);
        }
      });

      // 6. PROJECTS
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const existingProjects = projectsSnap.docs.map(d => d.data());

      projects.forEach((proj, idx) => {
        const exists = existingProjects.some(p => p.title === proj.title || (p.repo && p.repo === proj.repo));
        const docId = proj.id ? 'project-' + proj.id : 'project-' + idx;
        if (exists) {
          logResult('SKIP', 'projects', docId, `Equivalent project already exists for ${proj.title}`);
        } else {
          const payload = {
            title: proj.title || '',
            description: proj.desc || proj.description || '',
            titleAr: proj.titleAr || '',
            descAr: proj.descAr || '',
            image: proj.image || '',
            repo: proj.repo || '',
            tags: proj.tags || [],
            order: idx + 1
          };
          logResult('CREATE', 'projects', docId, `Will create project ${proj.title}`, payload);
        }
      });

      // 7. SKILLS
      const skillsSnap = await getDocs(collection(db, 'skills'));
      const existingSkills = skillsSnap.docs.map(d => d.data());

      let skillOrder = 1;

      if (skills && skills.circularSkills) {
        skills.circularSkills.forEach((sk, idx) => {
          const exists = existingSkills.some(s => s.name === sk.label && s.isCircular === true);
          const docId = 'skill-circ-' + idx;
          if (exists) {
            logResult('SKIP', 'skills', docId, `Equivalent circular skill exists for ${sk.label}`);
          } else {
            const payload = {
              name: sk.label || '',
              category: 'Core',
              categoryIcon: sk.icon || '',
              percent: sk.percent || 0,
              isCircular: true,
              circularSub: sk.sub || '',
              order: skillOrder++
            };
            logResult('CREATE', 'skills', docId, `Will create circular skill ${sk.label}`, payload);
          }
        });
      }

      if (skills && skills.categories) {
        skills.categories.forEach((cat, catIdx) => {
          if (cat.skills) {
            cat.skills.forEach((sk, skIdx) => {
              const exists = existingSkills.some(s => s.name === sk.name && s.category === cat.title);
              const docId = `skill-cat-${catIdx}-${skIdx}`;
              if (exists) {
                logResult('SKIP', 'skills', docId, `Equivalent skill exists for ${sk.name} in ${cat.title}`);
              } else {
                const payload = {
                  name: sk.name || '',
                  category: cat.title || '',
                  categoryIcon: cat.icon || '',
                  percent: sk.percent || 0,
                  isCircular: false,
                  circularSub: '',
                  order: skillOrder++
                };
                logResult('CREATE', 'skills', docId, `Will create skill ${sk.name}`, payload);
              }
            });
          }
        });
      }

      // 8. CERTIFICATIONS
      const certsSnap = await getDocs(collection(db, 'certifications'));
      const existingCerts = certsSnap.docs.map(d => d.data());

      certifications.forEach((cert, idx) => {
        const exists = existingCerts.some(c => c.title === cert.title && c.issuer === cert.issuer);
        const docId = 'cert-' + idx;
        if (exists) {
          logResult('SKIP', 'certifications', docId, `Equivalent certification exists for ${cert.title}`);
        } else {
          const payload = {
            title: cert.title || '',
            issuer: cert.issuer || '',
            icon: cert.icon || '',
            link: cert.link || '',
            order: idx + 1
          };
          logResult('CREATE', 'certifications', docId, `Will create certification ${cert.title}`, payload);
        }
      });

      // 9. JOURNEY
      const journeySnap = await getDocs(collection(db, 'journey'));
      const existingJourney = journeySnap.docs.map(d => d.data());

      if (journey && journey.phases) {
        journey.phases.forEach((phase, idx) => {
          const exists = existingJourney.some(j => j.title === phase.title || j.order === phase.phase);
          const docId = 'phase-' + idx;
          if (exists) {
            logResult('SKIP', 'journey', docId, `Equivalent phase exists for ${phase.title}`);
          } else {
            const payload = {
              title: phase.title || '',
              description: phase.description || '',
              order: phase.phase || (idx + 1).toString(),
              technologies: Array.isArray(phase.tags) ? phase.tags.join(', ') : (phase.tags || '')
            };
            logResult('CREATE', 'journey', docId, `Will create journey phase ${phase.title}`, payload);
          }
        });
      }

      if (isDryRun) {
        setHasDryRun(true);
      } else {
        toast.success('Migration executed successfully.');
      }

    } catch (error) {
      console.error('Migration error:', error);
      logResult('ERROR', 'SYSTEM', 'none', `Migration failed: ${error.message}`);
      toast.error('Migration encountered an error.');
    } finally {
      setIsDryRunning(false);
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-[#0a0f1c] border border-blue-900/30 rounded-2xl p-6 mt-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 shrink-0">
          <Database className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">CMS Data Migration</h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
            Synchronize the production Firestore CMS with the existing fallback data in <code className="text-[#14f195] bg-[#14f195]/10 px-1 rounded">src/data/portfolioData.js</code>. 
            This utility evaluates all collections, strictly detects duplicates, and prevents accidental overwrites. 
            Navbar and Media Library will be explicitly skipped.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[#1e293b] pb-6 mb-6">
        <button 
          onClick={() => executeSeed(true)}
          disabled={isDryRunning || isExecuting}
          className="px-6 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isDryRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Dry-Run Preview
        </button>

        <button 
          onClick={() => executeSeed(false)}
          disabled={!hasDryRun || isDryRunning || isExecuting}
          className="px-6 py-2.5 bg-[#14f195] hover:bg-[#10d482] text-[#0a0f1c] border border-[#14f195] rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={!hasDryRun ? "Run a Dry-Run preview first" : "Execute Migration"}
        >
          {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Execute Migration
        </button>
      </div>

      {logs.length > 0 && (
        <div className="bg-[#030814] border border-[#1e293b] rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[#0d1321] border-b border-[#1e293b] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Execution Log</span>
            <span className="text-xs font-mono text-gray-500">{logs.length} operations</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 font-mono text-xs">
            {logs.map((log, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-2 rounded border ${
                log.type === 'CREATE' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                log.type === 'SKIP' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400' :
                'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                <div className="w-16 shrink-0 font-bold">{log.type}</div>
                <div className="w-24 shrink-0 text-gray-500">{log.collection}/{log.docId}</div>
                <div className="flex-1 break-words">{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
