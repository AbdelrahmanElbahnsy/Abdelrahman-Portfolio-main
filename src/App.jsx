import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import SplashScreen from './components/ui/SplashScreen';

/* ─── Lazy Imports ───────────────────────────────────────────────────────── */
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

/* ─── Eagerly preload the Home chunk during splash ───────────────────────── */
const homePreload = import('./pages/Home');

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Preload Home chunk as soon as App mounts (while splash is playing)
  useEffect(() => {
    homePreload
      .then(() => setContentReady(true))
      .catch(() => setContentReady(true)); // Don't block on errors
  }, []);

  return (
    <>
      {/* Splash stays until BOTH animation + chunk load finish */}
      {!splashDone && (
        <SplashScreen
          contentReady={contentReady}
          onComplete={() => setSplashDone(true)}
        />
      )}

      {/* Only mount routes after splash is fully done */}
      {splashDone && (
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;