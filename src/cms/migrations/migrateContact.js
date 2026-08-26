import { contact } from '../../data/portfolioData.js';
import { db } from '../../services/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

export const migrateContact = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    // Migration target is now contact/main
    const contactRef = doc(db, 'contact', 'main');
    const snap = await getDoc(contactRef);
    
    let email = '';
    let phone = '';
    let location = '';
    
    // Extract specific fields from channels
    for (const channel of contact.channels || []) {
      if (channel.label === 'Email') email = channel.value;
      if (channel.label === 'Phone') phone = channel.value;
      if (channel.label === 'Location') location = channel.value;
    }

    const contactData = {
      title: contact.title || '',
      subtitle: contact.subtitle || '',
      email,
      phone,
      location,
      channels: contact.channels || [],
      opportunities: contact.opportunities || [],
      formSubjects: contact.formSubjects || [],
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
    
    console.log('[CMS MIGRATION] Contact data successfully migrated to Firestore contact/main.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Contact data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
