import { personalInfo, contact } from '../../data/portfolioData.js';
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

export const migrateProfile = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const profileRef = doc(db, 'profile', 'main');
    const snap = await getDoc(profileRef);
    
    let email = '';
    let github = '';
    let linkedin = '';
    
    for (const channel of contact.channels || []) {
      if (channel.label === 'Email') email = channel.value;
      if (channel.label === 'GitHub') github = channel.value || channel.link;
      if (channel.label === 'LinkedIn') linkedin = channel.value || channel.link;
    }

    const profileData = {
      fullName: personalInfo.fullName || '',
      bio: personalInfo.description || '',
      email,
      github,
      linkedin,
      resumeUrl: personalInfo.cvUrl || '',
      avatar: personalInfo.portrait || '',
      updatedAt: new Date()
    };
    
    if (snap.exists()) {
      await loggedSetDoc(profileRef, profileData, { merge: true });
      result.updated++;
    } else {
      profileData.createdAt = new Date();
      await loggedSetDoc(profileRef, profileData);
      result.created++;
    }
    
    console.log('[CMS MIGRATION] Profile data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Profile data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
