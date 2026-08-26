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
   * Internal helper to log activity
   */
  async _logActivity(type, collectionName, id, title = '') {
    try {
      if (collectionName === 'activityLog') return; // Prevent infinite loops
      const payload = {
        type, // 'create', 'update', 'delete', 'set'
        collectionName,
        documentId: id,
        title: title || `${type} in ${collectionName}`,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'activityLog'), payload);
      
      // Dispatch global event so DashboardContext can refetch counts, activity, and tasks automatically
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dashboard-update'));
      }
    } catch (error) {
      console.warn('Failed to log activity, non-fatal:', error);
    }
  },

  /**
   * Get total count of documents in a collection efficiently
   */
  async getCollectionCounts(collectionsArray) {
    try {
      const counts = {};
      const { getCountFromServer } = await import('firebase/firestore');
      
      const promises = collectionsArray.map(async (colName) => {
        try {
          const snapshot = await getCountFromServer(collection(db, colName));
          counts[colName] = snapshot.data().count;
        } catch {
          counts[colName] = 0; // fallback if collection is missing/permission denied
        }
      });
      await Promise.all(promises);
      return counts;
    } catch (error) {
      console.error('Error fetching counts:', error);
      throw error;
    }
  },

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
      const title = data.title || data.name || data.label || 'New item';
      await this._logActivity('create', collectionName, docRef.id, `Created ${title}`);
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
      const title = data.title || data.name || data.label || 'Item';
      await this._logActivity('update', collectionName, id, `Updated ${title}`);
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
      const title = data.title || data.name || data.label || 'Item';
      await this._logActivity('update', collectionName, id, `Updated ${title}`);
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
      
      // Try to get document title before deleting if possible, for better logs
      let title = 'Item';
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const d = snap.data();
          title = d.title || d.name || d.label || 'Item';
        }
      } catch (e) {}

      await deleteDoc(docRef);
      await this._logActivity('delete', collectionName, id, `Deleted ${title}`);
      return id;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  },

  subscribe(collectionName, callback, onError, options = {}) {
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
      if (onError) onError(error);
    });
  },

  /**
   * Subscribe to real-time updates for a single document
   */
  subscribeOne(collectionName, id, callback, onError) {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Realtime subscription error for ${collectionName}/${id}:`, error);
      if (onError) onError(error);
    });
  }
};
