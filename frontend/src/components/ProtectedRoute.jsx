import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!auth.ready) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    if (auth.user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (auth.user.role === 'driver') {
      return <Navigate to="/driver-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
