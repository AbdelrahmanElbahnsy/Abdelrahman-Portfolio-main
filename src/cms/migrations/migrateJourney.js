import { journey } from '../../data/portfolioData.js';
import { db } from '../../services/firebase.js';
import { collection, addDoc, getDocs, doc, setDoc, getCountFromServer } from 'firebase/firestore';


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

export const migrateJourney = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const journeyCol = collection(db, 'journey');
    const snap = await getDocs(journeyCol);
    
    const existingDocs = {};
    snap.forEach(d => {
      existingDocs[d.data().title] = d.id;
    });

    const phases = journey.phases || [];
    for (const phase of phases) {
      const journeyData = {
        title: phase.title,
        description: phase.description,
        order: phase.phase, // '01', '02', etc.
        technologies: phase.tags ? phase.tags.join(', ') : '',
        company: '',
        organization: '',
        date: '',
        badge: '',
        status: '',
        icon: '',
        color: '',
        updatedAt: new Date()
      };
      
      if (existingDocs[phase.title]) {
        await loggedSetDoc(doc(db, 'journey', existingDocs[phase.title]), journeyData, { merge: true });
        result.updated++;
      } else {
        journeyData.createdAt = new Date();
        await loggedAddDoc(journeyCol, journeyData);
        result.created++;
      }
    }
    
    console.log('[CMS MIGRATION] Journey data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Journey data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
