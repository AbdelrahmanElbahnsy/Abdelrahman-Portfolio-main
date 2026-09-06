import React, { useEffect, useState, useRef } from 'react';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import MaintenanceScreen from './MaintenanceScreen';

export default function PortfolioGate({ children }) {
  const { data, loading, subscribe } = useFirestoreSingleDoc('settings', 'general');
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

  // If loading and we haven't timed out yet, wait.
  // Rendering null keeps the outer App.jsx SplashScreen visible.
  if (loading && !data && !timedOut) {
    return null;
  }

  // Determine enabled state.
  // If undefined, it defaults to true. If we timed out (fail-open), it renders.
  const isEnabled = data?.portfolioEnabled !== false;

  if (!isEnabled) {
    return <MaintenanceScreen />;
  }

  return children;
}
