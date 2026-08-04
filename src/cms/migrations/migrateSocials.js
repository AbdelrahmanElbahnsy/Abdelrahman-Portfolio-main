import { socialLinks } from '../../data/portfolioData.js';
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

export const migrateSocials = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const socialsCol = collection(db, 'socials');
    const snap = await getDocs(socialsCol);
    
    const existingDocs = {};
    snap.forEach(d => {
      existingDocs[d.data().platform] = d.id;
    });

    const items = socialLinks.airplane || [];
    let order = 0;
    for (const item of items) {
      const socialData = {
        platform: item.label || '',
        url: item.href || '',
        icon: item.icon || '',
        order: order++,
        updatedAt: new Date()
      };
      
      if (existingDocs[item.label]) {
        await loggedSetDoc(doc(db, 'socials', existingDocs[item.label]), socialData, { merge: true });
        result.updated++;
      } else {
        socialData.createdAt = new Date();
        await loggedAddDoc(socialsCol, socialData);
        result.created++;
      }
    }
    
    console.log('[CMS MIGRATION] Socials data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Socials data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
