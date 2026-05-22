import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { auth, isAuthenticated } = useAuth();

  if (!auth.ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="rounded-2xl p-6 bg-white shadow-lg border border-slate-200 text-sm font-semibold">
          Restoring session...
        </div>
      </div>
    );
  }

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
