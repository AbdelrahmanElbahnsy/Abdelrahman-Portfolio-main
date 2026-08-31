import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Setup basic firebase config (we can extract this from env or similar, or just read the config file if possible)
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Signing in...");
    // Replace with the owner account to test
    await signInWithEmailAndPassword(auth, "abdelrahmanelbahnsy5@gmail.com", "your_password_here");
    console.log("Signed in.");
    
    const docRef = doc(db, 'settings', 'appearance');
    console.log("Trying to get document...");
    const snap = await getDoc(docRef);
    console.log("Exists:", snap.exists());
    
    console.log("Trying to set document...");
    await setDoc(docRef, { test: true }, { merge: true });
    console.log("Set successful.");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

test();
