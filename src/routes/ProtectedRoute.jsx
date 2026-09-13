import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreSingleDoc } from '../cms/hooks/useFirestoreSingleDoc';

const VALID_ROLES = ['owner', 'admin', 'editor', 'viewer'];

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: adminData, subscribe, loading: roleLoading } = useFirestoreSingleDoc('admins', user?.uid);

  useEffect(() => {
    let unsub;
    if (user?.uid) {
      unsub = subscribe();
    }
    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid, subscribe]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14f195]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14f195]"></div>
      </div>
    );
  }

  const role = adminData?.role;
  if (!role || !VALID_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
