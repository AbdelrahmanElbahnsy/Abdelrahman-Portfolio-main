import React, { useEffect, useState, useRef } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import MaintenanceScreen from './MaintenanceScreen';

export default function PortfolioGate({ children }) {
  const { data, loading, error, subscribe } = useFirestoreSingleDoc('settings', 'general');
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  useEffect(() => {
    // Start a 5-second fail-open timeout
    timerRef.current = setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => clearTimeout(timerRef.current);
  }, []);

  // If loading and we haven't timed out yet and there's no error, wait.
  // Rendering null keeps the outer App.jsx SplashScreen visible.
  if (loading && !data && !timedOut && !error) {
    return null;
  }

  // If there is an explicit error or we timed out while still loading, fail closed.
  if (error || (loading && !data && timedOut)) {
    return <MaintenanceScreen />;
  }

  // Determine enabled state.
  // If undefined, it defaults to true.
  const isEnabled = data?.portfolioEnabled !== false;

  if (!isEnabled) {
    return <MaintenanceScreen />;
  }

  return children;
}
