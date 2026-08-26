import { useState, useCallback } from 'react';
import { crudService } from '../services/crudService';

/**
 * Generic hook for managing a single document in Firestore
 * @param {string} collectionName - The Firestore collection name
 * @param {string} docId - The specific document ID
 */
export const useFirestoreSingleDoc = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the document once
  const fetchOne = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await crudService.getOne(collectionName, docId);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName, docId]);

  // Set the document (create or overwrite)
  const setDocData = useCallback(async (payload) => {
    try {
      const savedDoc = await crudService.set(collectionName, docId, payload);
      setData(savedDoc);
      return savedDoc;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [collectionName, docId]);

  // Subscribe to real-time updates
  const subscribe = useCallback(() => {
    setLoading(true);
    const unsubscribe = crudService.subscribeOne(
      collectionName,
      docId,
      (fetchedData) => {
        setData(fetchedData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Error loading document');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, docId]);

  return {
    data,
    loading,
    error,
    fetchOne,
    setDocData,
    subscribe,
    setData,
    setLoading,
    setError
  };
};
