import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crudService } from '../services/crudService';

/**
 * Generic hook for uploading images to Cloudinary with progress tracking
 */
export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  
  const xhrRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    };
  }, []);

  const uploadImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('');
        return;
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        console.error("Missing Cloudinary Environment Variables.");
        resolve('');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      xhr.upload.onprogress = (event) => {
        if (!isMounted.current) return;
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (!isMounted.current) return;
        setIsUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            // Write to Firestore Media Ledger
            try {
              const payload = {
                url: data.secure_url,
                publicId: data.public_id || '',
                format: data.format || '',
                bytes: data.bytes || 0,
                width: data.width || 0,
                height: data.height || 0,
                originalFilename: data.original_filename || '',
                resourceType: data.resource_type || 'image',
                uploadedBy: user?.uid || 'unknown'
              };
              await crudService.create('media', payload);
            } catch (err) {
              console.error("Firestore Media Ledger Write Failed:", err);
              // We intentionally DO NOT fail the overall upload flow if ledger write fails,
              // to ensure existing CMS functionality remains unbroken.
            }
            
            resolve(data.secure_url);
          } else {
            const err = new Error("Upload failed: missing secure_url");
            setError(err.message);
            reject(err);
          }
        } else {
          const err = new Error(`Upload failed with status: ${xhr.status}`);
          setError(err.message);
          reject(err);
        }
      };

      xhr.onerror = () => {
        if (!isMounted.current) return;
        setIsUploading(false);
        const err = new Error("Upload failed due to network error");
        setError(err.message);
        reject(err);
      };

      xhr.send(formData);
    });
  }, []);

  const resetUploadState = useCallback(() => {
    if (xhrRef.current) xhrRef.current.abort();
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    uploadImage,
    isUploading,
    uploadProgress,
    error,
    resetUploadState
  };
};
