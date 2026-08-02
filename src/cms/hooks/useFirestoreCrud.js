import { useState, useCallback, useEffect } from 'react';
import { crudService } from '../services/crudService';

/**
 * Generic hook for managing Firestore CRUD operations
 * @param {string} collectionName - The Firestore collection name
 * @param {Object} defaultOptions - Default fetch options (filters, orderBy, etc)
 */
export const useFirestoreCrud = (collectionName, defaultOptions = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize defaultOptions to create a stable dependency string
  const optionsKey = JSON.stringify(defaultOptions);

  // Fetch all documents
  const fetchAll = useCallback(async (options = null) => {
    const fetchOptions = options || JSON.parse(optionsKey);
    setLoading(true);
    setError(null);
    try {
      const result = await crudService.getAll(collectionName, fetchOptions);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName, optionsKey]);

  // Create document
  const create = useCallback(async (payload) => {
    try {
      const newDoc = await crudService.create(collectionName, payload);
      // Optimistic UI update or re-fetch can be done here. 
      // For simplicity, we just return the document and let caller fetchAll if needed.
      return newDoc;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [collectionName]);

  // Update document
  const update = useCallback(async (id, payload) => {
    try {
      const updatedDoc = await crudService.update(collectionName, id, payload);
      return updatedDoc;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [collectionName]);

  // Delete document
  const remove = useCallback(async (id) => {
    try {
      await crudService.delete(collectionName, id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [collectionName]);

  // Subscribe to real-time updates
  const subscribe = useCallback((options = null) => {
    const fetchOptions = options || JSON.parse(optionsKey);
    setLoading(true);
    const unsubscribe = crudService.subscribe(
      collectionName,
      (fetchedData) => {
        setData(fetchedData);
        setLoading(false);
        setError(null);
      },
      fetchOptions
    );
    return unsubscribe;
  }, [collectionName, optionsKey]);

  return {
    data,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    subscribe,
    setData,
    setLoading,
    setError
  };
};
