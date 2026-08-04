import { certifications } from '../../data/portfolioData.js';
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

export const migrateCertifications = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const certCol = collection(db, 'certifications');
    const snap = await getDocs(certCol);
    
    const existingDocs = {};
    snap.forEach(d => {
      existingDocs[d.data().title] = d.id;
    });

    let order = 0;
    for (const cert of certifications || []) {
      const certData = {
        title: cert.title || '',
        issuer: cert.issuer || '',
        link: cert.link || '',
        order: order++,
        updatedAt: new Date()
      };
      
      if (existingDocs[cert.title]) {
        await loggedSetDoc(doc(db, 'certifications', existingDocs[cert.title]), certData, { merge: true });
        result.updated++;
      } else {
        certData.createdAt = new Date();
        await loggedAddDoc(certCol, certData);
        result.created++;
      }
    }
    
    console.log('[CMS MIGRATION] Certifications data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Certifications data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
