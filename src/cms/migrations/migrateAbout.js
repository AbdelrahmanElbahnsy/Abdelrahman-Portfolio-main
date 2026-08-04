import { doc, getDoc, setDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { about } from '../../data/portfolioData.js';


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

export const migrateAbout = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const aboutRef = doc(db, 'about', 'main');
    const snap = await getDoc(aboutRef);

    const aboutData = {
      subtitle: about.subtitle || '',
      title: about.title || '',
      lead: about.lead || '',
      paragraphsJson: JSON.stringify(about.paragraphs || []),
      badgesJson: JSON.stringify(about.badges || []),
      terminalItemsJson: JSON.stringify(about.terminalItems || []),
      updatedAt: new Date()
    };
    
    if (snap.exists()) {
      await loggedSetDoc(aboutRef, aboutData, { merge: true });
      result.updated++;
      console.log('[CMS MIGRATION] About data updated.');
    } else {
      aboutData.createdAt = new Date();
      await loggedSetDoc(aboutRef, aboutData);
      result.created++;
      console.log('[CMS MIGRATION] About data created.');
    }
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating About data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
