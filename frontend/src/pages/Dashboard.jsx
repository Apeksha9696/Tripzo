import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { auth, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: '/dashboard' }} />;
  }

  if (auth.user.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (auth.user.role === 'driver') {
    return <Navigate to="/driver-dashboard" replace />;
  }

  return <Navigate to="/my-bookings" replace />;
}
