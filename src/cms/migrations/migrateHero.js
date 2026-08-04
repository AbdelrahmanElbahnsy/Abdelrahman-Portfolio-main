import { personalInfo } from '../../data/portfolioData.js';
import { db } from '../../services/firebase.js';
import { doc, setDoc, getDoc, getCountFromServer } from 'firebase/firestore';


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

export const migrateHero = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const heroRef = doc(db, 'hero', 'main');
    const snap = await getDoc(heroRef);

    const heroData = {
      firstName: personalInfo.firstName.trim(),
      lastName: personalInfo.lastName.trim(),
      badge: personalInfo.badge.trim(),
      roles: personalInfo.roles.join(', '),
      description: personalInfo.description.trim(),
      portrait: personalInfo.portrait,
      cvUrl: personalInfo.cvUrl,
      availabilityStatus: personalInfo.availabilityStatus || 'Available for Opportunities',
      cta1: 'Download CV',
      cta2: 'Contact Me',
      updatedAt: new Date()
    };

    if (snap.exists()) {
      await loggedSetDoc(heroRef, heroData, { merge: true });
      result.updated++;
      console.log('[CMS MIGRATION] Hero data updated.');
    } else {
      heroData.createdAt = new Date();
      await loggedSetDoc(heroRef, heroData);
      result.created++;
      console.log('[CMS MIGRATION] Hero data created.');
    }
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Hero data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
