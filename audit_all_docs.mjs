import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword } from 'firebase/auth';
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

async function fetchAllDocs() {
  const email = 'audit_bot_' + Date.now() + '@example.com';
  const password = 'TempPassword123!';
  
  try {
    console.log("Authenticating...");
    await createUserWithEmailAndPassword(auth, email, password);
    
    const collectionsToAudit = ['certifications', 'socials', 'navbarItems'];
    
    for (const colName of collectionsToAudit) {
      console.log(`\n==================================================`);
      console.log(`COLLECTION: ${colName}`);
      console.log(`==================================================`);
      
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      
      console.log(`Total document count: ${snap.size}`);
      
      let allHaveOrder = true;
      let missingOrderIds = [];
      let docsData = [];
      
      snap.forEach(doc => {
        const data = doc.data();
        docsData.push({ id: doc.id, data });
        
        console.log(`\nDocument ID: ${doc.id}`);
        console.log(`Fields:`);
        for (const [key, value] of Object.entries(data)) {
          let type = typeof value;
          let valToPrint = value;
          if (value && value.toDate) {
             type = 'Timestamp';
             valToPrint = value.toDate().toISOString();
          }
          console.log(`  - ${key} (${type}): ${valToPrint}`);
        }
        
        if (!('order' in data)) {
          allHaveOrder = false;
          missingOrderIds.push(doc.id);
          console.log(`  ---> WARNING: MISSING 'order' FIELD`);
        } else {
          console.log(`  ---> Has 'order' of type: ${typeof data.order}`);
        }
      });
      
      console.log(`\n--- SUMMARY FOR ${colName} ---`);
      console.log(`Every document contains 'order': ${allHaveOrder}`);
      if (!allHaveOrder) {
        console.log(`Missing order IDs: ${missingOrderIds.join(', ')}`);
      }
      
      // Test the orderBy query
      try {
        const q = query(colRef, orderBy('order', 'asc'));
        const orderedSnap = await getDocs(q);
        console.log(`\nQuery test with orderBy('order', 'asc') returned ${orderedSnap.size} documents.`);
      } catch (err) {
        console.log(`\nQuery test failed: ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Script failed:", err);
  }
  process.exit(0);
}

fetchAllDocs();
