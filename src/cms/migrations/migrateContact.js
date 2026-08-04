import { contact } from '../../data/portfolioData.js';
import { db } from '../../services/firebase.js';
import { doc, getDoc, setDoc, getCountFromServer } from 'firebase/firestore';


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

export const migrateContact = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const contactRef = doc(db, 'content', 'contact');
    const snap = await getDoc(contactRef);
    
    let email = '';
    let phone = '';
    let location = '';
    
    for (const channel of contact.channels || []) {
      if (channel.label === 'Email') email = channel.value;
      if (channel.label === 'Phone') phone = channel.value;
      if (channel.label === 'Location') location = channel.value;
    }

    const contactData = {
      email,
      phone,
      location,
      updatedAt: new Date()
    };
    
    if (snap.exists()) {
      await loggedSetDoc(contactRef, contactData, { merge: true });
      result.updated++;
    } else {
      contactData.createdAt = new Date();
      await loggedSetDoc(contactRef, contactData);
      result.created++;
    }
    
    console.log('[CMS MIGRATION] Contact data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Contact data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
