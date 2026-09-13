import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

async function testAuthAndWrite() {
  const email = 'seed_bot_' + Date.now() + '@example.com';
  const password = 'TempPassword123!';
  
  try {
    console.log("Creating temporary user...");
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created and signed in.");
    
    console.log("Testing Firestore write...");
    await addDoc(collection(db, 'test_seed'), { timestamp: new Date() });
    console.log("Write SUCCESS. Rules allow authenticated writes.");
    
    console.log("Testing Firestore read...");
    const snap = await getDocs(collection(db, 'test_seed'));
    console.log("Read SUCCESS. Found", snap.size, "documents.");
    
  } catch (error) {
    console.log("Operation failed:");
    console.log(error.code, error.message);
  }
  process.exit(0);
}

testAuthAndWrite();
