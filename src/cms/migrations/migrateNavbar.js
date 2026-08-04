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

export const migrateNavbar = async () => {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 };
  try {
    const navbarCol = collection(db, 'navbarItems');
    const snap = await getDocs(navbarCol);
    
    const existingDocs = {};
    snap.forEach(d => {
      existingDocs[d.data().label] = d.id;
    });

    const items = [
      { label: 'Home', href: '#hero' },
      { label: 'About', href: '#about' },
      { label: 'Skills', href: '#skills' },
      { label: 'Journey', href: '#journey' },
      { label: 'Projects', href: '#projects' },
      { label: 'Certifications', href: '#certifications' },
      { label: 'Contact', href: '#contact' },
    ];

    let order = 1;
    for (const item of items) {
      const navData = {
        label: item.label,
        href: item.href,
        order: order++,
        updatedAt: new Date()
      };
      
      if (existingDocs[item.label]) {
        await loggedSetDoc(doc(db, 'navbarItems', existingDocs[item.label]), navData, { merge: true });
        result.updated++;
      } else {
        navData.createdAt = new Date();
        await loggedAddDoc(navbarCol, navData);
        result.created++;
      }
    }
    
    console.log('[CMS MIGRATION] Navbar data successfully migrated to Firestore.');
  } catch (error) {
    console.error('[CMS MIGRATION] Error migrating Navbar data:', error);
    result.failed++; result.error = error;
  }
  return result;
};
