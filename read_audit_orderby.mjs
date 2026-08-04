import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testRead() {
  const email = 'seed_bot_order_' + Date.now() + '@example.com';
  const password = 'TempPassword123!';
  
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    
    for (const colName of ['certifications', 'socials', 'navbarItems']) {
      console.log(`\n--- ${colName} ---`);
      try {
        const q = query(collection(db, colName), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        console.log(`Count with orderBy: ${snap.size}`);
      } catch (err) {
        console.log(`Error querying ${colName} with orderBy: ${err.message}`);
      }
    }
  } catch (error) {
    console.log("Operation failed:");
    console.log(error.code, error.message);
  }
  process.exit(0);
}

testRead();
