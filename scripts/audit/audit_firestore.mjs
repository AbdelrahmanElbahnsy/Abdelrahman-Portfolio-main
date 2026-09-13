import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collections = [
  'visits',
  'navbarItems',
  'hero',
  'about',
  'skills',
  'journey',
  'projects',
  'certifications',
  'socials',
  'content',
  'profile'
];

async function runAudit() {
  console.log("==================================================");
  console.log("FIRESTORE AUDIT");
  console.log("==================================================");
  
  for (const collName of collections) {
    try {
      const snap = await getDocs(collection(db, collName));
      const count = snap.size;
      console.log(`Collection [${collName}]: ${count} documents`);
      if (count > 0 && count < 10) {
        snap.forEach(docSnap => {
          console.log(`  - doc: ${docSnap.id}`);
        });
      } else if (count >= 10) {
        console.log(`  - (showing first 3 of ${count})`);
        let i = 0;
        snap.forEach(docSnap => {
          if (i++ < 3) console.log(`  - doc: ${docSnap.id}`);
        });
      }
    } catch (e) {
      console.error(`Error reading ${collName}:`, e.message);
    }
  }
  process.exit(0);
}

runAudit();
