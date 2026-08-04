import { collection, doc, setDoc, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { projects } from '../../data/portfolioData';


async function loggedSetDoc(docRef, data, options) {
  try {
    const res = await (options ? setDoc(docRef, data, options) : setDoc(docRef, data));
    console.log(`Collection path: ${docRef.parent.path}, Document ID: ${docRef.id}, Write result: SUCCESS, Returned ID: ${docRef.id}`);
    return res;
  } catch(e) {
    console.log(`Collection path: ${docRef.parent.path}, Document ID: ${docRef.id}, Write result: FAILED, Exception: ${e}`);
    throw e;
  }
}
async function loggedAddDoc(colRef, data) {
  try {
    const res = await addDoc(colRef, data);
    console.log(`Collection path: ${colRef.path}, Document ID: ${res.id}, Write result: SUCCESS, Returned ID: ${res.id}`);
    return res;
  } catch(e) {
    console.log(`Collection path: ${colRef.path}, Write result: FAILED, Exception: ${e}`);
    throw e;
  }
}

export const migrateProjectsToFirestore = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    console.log('[Migration] Starting projects migration...');
    const projectsRef = collection(db, 'projects');
    const existingDocs = await getDocs(projectsRef);
    const existingIds = new Set();
    existingDocs.forEach(d => existingIds.add(d.id));

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const docId = `project_${p.id}`; 
      
      const projectData = {
        title: p.title || '',
        description: p.desc || p.description || '',
        imageUrl: p.image || '', 
        image: p.image || '', 
        technologies: p.tags || [],
        repo: p.repo || '',
        link: p.link || '',
        order: i, 
        originalId: p.id,
        updatedAt: new Date().toISOString()
      };
      
      if (existingIds.has(docId)) {
        await loggedSetDoc(doc(db, 'projects', docId), projectData, { merge: true });
        result.updated++;
        console.log(`[Migration] Updated project: ${docId}`);
      } else {
        projectData.createdAt = new Date().toISOString();
        await loggedSetDoc(doc(db, 'projects', docId), projectData);
        result.created++;
        console.log(`[Migration] Created project: ${docId}`);
      }
    }
    console.log(`[Migration] Complete. Created ${result.created}, Updated ${result.updated} projects.`);
  } catch (error) {
    console.error('[Migration] Failed:', error);
    result.failed++; result.error = error;
  }
  return result;
};
