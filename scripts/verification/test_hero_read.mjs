import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkHero() {
  try {
    const docRef = doc(db, 'hero', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log('Hero data exists:', snap.data());
    } else {
      console.log('Hero data is EMPTY/MISSING');
    }
  } catch (e) {
    console.log('Read failed:', e.message);
  }
  process.exit(0);
}

checkHero();
