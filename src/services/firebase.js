import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD0aa1ZNToX2NJRaM7lSNjIiSs5JVlZX3A",
  authDomain: "my-portfolio-4a24d.firebaseapp.com",
  projectId: "my-portfolio-4a24d",
  storageBucket: "my-portfolio-4a24d.firebasestorage.app",
  messagingSenderId: "827847446337",
  appId: "1:827847446337:web:8ef3c45696610c38e0dbc0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
