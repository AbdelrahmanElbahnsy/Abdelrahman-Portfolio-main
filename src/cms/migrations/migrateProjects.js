import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { projects } from '../../data/portfolioData';

export const migrateProjectsToFirestore = async () => {
  try {
    console.log('[Migration] Starting projects migration...');
    const projectsRef = collection(db, 'projects');
    const existingDocs = await getDocs(projectsRef);
    const existingIds = new Set();
    existingDocs.forEach(d => existingIds.add(d.id));

    let migratedCount = 0;
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      // Use the repo URL or a fallback slug as the document ID if preferred, 
      // but to preserve exact IDs safely, we use a prefix.
      const docId = `project_${p.id}`; 
      
      if (existingIds.has(docId)) {
        console.log(`[Migration] Skipping duplicate project: ${docId}`);
        continue;
      }
      
      const projectData = {
        title: p.title || '',
        description: p.desc || p.description || '',
        imageUrl: p.image || '', // Ensure it matches Dashboard expectation if needed
        image: p.image || '', 
        technologies: p.tags || [],
        repo: p.repo || '',
        link: p.link || '',
        order: i, 
        originalId: p.id,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'projects', docId), projectData);
      console.log(`[Migration] Migrated project: ${docId}`);
      migratedCount++;
    }
    console.log(`[Migration] Complete. Uploaded ${migratedCount} projects.`);
    return migratedCount;
  } catch (error) {
    console.error('[Migration] Failed:', error);
    return 0;
  }
};
