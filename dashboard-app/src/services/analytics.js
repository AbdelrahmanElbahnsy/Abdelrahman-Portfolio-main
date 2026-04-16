import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const VISITS_COLLECTION = 'visits';
const VISIT_DEDUPLICATION_KEY = 'lastVisit';
const VISIT_DEDUPLICATION_WINDOW_MS = 10 * 60 * 1000;

const getVisitsCollectionRef = () => collection(db, VISITS_COLLECTION);

const isBrowser = () =>
  typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shouldSkipVisitTracking = () => {
  if (!isBrowser()) {
    return false;
  }

  // Ignore rapid refreshes/navigation loops from the same browser for 10 minutes.
  const lastVisitAt = Number(localStorage.getItem(VISIT_DEDUPLICATION_KEY) || 0);
  const elapsedMs = Date.now() - lastVisitAt;

  return elapsedMs > 0 && elapsedMs < VISIT_DEDUPLICATION_WINDOW_MS;
};

const markVisitTracked = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(VISIT_DEDUPLICATION_KEY, Date.now().toString());
};

const buildVisitPayload = (page = '/') => ({
  timestamp: serverTimestamp(),
  page,
});

const normalizeVisitsStats = (snapshot) => {
  const todayStart = getStartOfToday();
  const dailyVisits = {};
  let visitsToday = 0;

  // Derive dashboard metrics directly from raw visit documents so the UI stays in sync.
  snapshot.forEach((visitDoc) => {
    const visit = visitDoc.data();
    const timestamp = visit.timestamp?.toDate?.();

    if (!timestamp) {
      return;
    }

    const dateKey = getDateKey(timestamp);
    dailyVisits[dateKey] = (dailyVisits[dateKey] || 0) + 1;

    if (timestamp >= todayStart) {
      visitsToday += 1;
    }
  });

  const recentDailyVisits = Object.entries(dailyVisits)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, 7);

  return {
    totalVisits: snapshot.size,
    visitsToday,
    dailyVisits,
    recentDailyVisits,
  };
};

export const trackVisit = async (page = '/') => {
  if (shouldSkipVisitTracking()) {
    console.log('[analytics] Visit skipped: localStorage cooldown still active.');
    return { tracked: false, reason: 'cooldown' };
  }

  try {
    const visitPayload = buildVisitPayload(page);
    const docRef = await addDoc(getVisitsCollectionRef(), visitPayload);

    markVisitTracked();
    console.log('[analytics] Visit tracked once.', {
      id: docRef.id,
      page,
    });

    return { tracked: true, id: docRef.id };
  } catch (error) {
    console.error('[analytics] Failed to track visit.', error);
    return { tracked: false, reason: 'error', error };
  }
};

export const getVisitsStats = async () => {
  try {
    const visitsQuery = query(getVisitsCollectionRef(), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(visitsQuery);
    const stats = normalizeVisitsStats(snapshot);

    console.log('[analytics] Visit stats fetched.', stats);
    return stats;
  } catch (error) {
    console.error('[analytics] Failed to fetch visit stats.', error);

    return {
      totalVisits: 0,
      visitsToday: 0,
      dailyVisits: {},
      recentDailyVisits: [],
      error,
    };
  }
};

export const subscribeToVisitsStats = (callback, onError) => {
  const visitsQuery = query(getVisitsCollectionRef(), orderBy('timestamp', 'desc'));

  return onSnapshot(
    visitsQuery,
    (snapshot) => {
      const stats = normalizeVisitsStats(snapshot);
      console.log('[analytics] Visit stats updated in real time.', stats);
      callback(stats);
    },
    (error) => {
      console.error('[analytics] Failed to subscribe to visit stats.', error);
      onError?.(error);
    }
  );
};
