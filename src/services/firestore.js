import { db } from './firebase';
import { 
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc, setDoc,
  serverTimestamp, query, orderBy, onSnapshot
} from 'firebase/firestore';

// Generic Add
export const addDocument = async (collName, data) => {
  const docRef = await addDoc(collection(db, collName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
};

// Fixed: getDocuments is now definitively re-added here
export const getDocuments = async (collName) => {
  const q = query(collection(db, collName), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Generic Update
export const updateDocument = async (collName, id, data) => {
  const docRef = doc(db, collName, id);
  await updateDoc(docRef, data);
  return true;
};

// Generic Delete
export const deleteDocument = async (collName, id) => {
  const docRef = doc(db, collName, id);
  await deleteDoc(docRef);
  return true;
};

// Single Doc helpers
export const getSingleDocument = async (collName, docId) => {
  const docRef = doc(db, collName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
};

export const setSingleDocument = async (collName, docId, data) => {
  const docRef = doc(db, collName, docId);
  await setDoc(docRef, data, { merge: true });
  return true;
};

// REALTIME LISTENERS
export const subscribeToCollection = (collName, callback) => {
  const q = query(collection(db, collName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeToDocument = (collName, docId, callback) => {
  const docRef = doc(db, collName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};
