// src/utils/systemHealth.js
import { db } from '../services/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export async function checkSystemHealth() {
  const timestamp = new Date().toISOString();
  const isLocal = !import.meta.env.PROD;
  
  const status = {
    firestore: { status: 'checking', label: 'Firestore DB', latency: 0, lastChecked: timestamp },
    vercel: { status: 'checking', label: 'Vercel CDN', latency: 0, lastChecked: timestamp },
    cloudinary: { status: 'checking', label: 'Cloudinary', latency: 0, lastChecked: timestamp },
    github: { status: 'checking', label: 'GitHub Sync', latency: 0, lastChecked: timestamp },
  };

  // 1. Check Firestore Health (Measure Latency)
  try {
    const start = performance.now();
    const q = query(collection(db, 'hero'), limit(1));
    await getDocs(q);
    status.firestore.latency = Math.round(performance.now() - start);
    status.firestore.status = 'online';
  } catch (error) {
    status.firestore.status = 'error';
    status.firestore.reason = 'Database connection failed or permission denied.';
  }

  // 2. Check Cloudinary Configuration
  const cloudinaryName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (cloudinaryName && cloudinaryName.length > 3) {
    status.cloudinary.status = 'configured';
  } else {
    status.cloudinary.status = 'warning'; 
    status.cloudinary.reason = 'Missing VITE_CLOUDINARY_CLOUD_NAME config.';
  }

  // 3. Check Vercel
  status.vercel.status = 'unknown';

  // 4. Check GitHub
  status.github.status = 'unknown';

  return status;
}
