import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase';

/**
 * Generic CRUD Service for Firestore Collections
 */
export const crudService = {
  /**
   * Fetch all documents from a collection, with optional ordering and filtering.
   * @param {string} collectionName 
   * @param {Object} options - { orderByField, orderDirection, filters, limitCount }
   */
  async getAll(collectionName, options = {}) {
    try {
      let q = collection(db, collectionName);
      
      if (options.filters && Array.isArray(options.filters)) {
        options.filters.forEach(f => {
          q = query(q, where(f.field, f.operator, f.value));
        });
      }
      
      if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
      }
      
      if (options.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Get a single document by ID
   */
  async getOne(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching document ${id} from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Create a new document in a collection
   */
  async create(collectionName, data) {
    try {
      const payload = { ...data, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, collectionName), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Set a document with a specific ID (creates if not exists, overwrites if exists)
   */
  async set(collectionName, id, data) {
    try {
      const payload = { ...data, updatedAt: serverTimestamp() };
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, payload, { merge: true });
      return { id, ...payload };
    } catch (error) {
      console.error(`Error setting document ${id} in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing document
   */
  async update(collectionName, id, data) {
    try {
      const payload = { ...data, updatedAt: serverTimestamp() };
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, payload);
      return { id, ...payload };
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time updates for a collection
   * @param {string} collectionName 
   * @param {Function} callback 
   * @param {Object} options 
   * @returns {Function} unsubscribe function
   */
  subscribe(collectionName, callback, options = {}) {
    let q = collection(db, collectionName);
    
    if (options.filters && Array.isArray(options.filters)) {
      options.filters.forEach(f => {
        q = query(q, where(f.field, f.operator, f.value));
      });
    }
    
    if (options.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
    }
    
    if (options.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error(`Realtime subscription error for ${collectionName}:`, error);
    });
  },

  /**
   * Subscribe to real-time updates for a single document
   */
  subscribeOne(collectionName, id, callback) {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Realtime subscription error for ${collectionName}/${id}:`, error);
    });
  }
};
