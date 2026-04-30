import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import BusDetails from './pages/BusDetails';
import Checkout from './pages/Checkout';
import DriverDashboard from './pages/DriverDashboard';
import MyBookings from './pages/MyBookings';
import Help from './pages/Help';
import Tracking from './pages/Tracking';
import AuthModal from './components/AuthModal';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


// ✅ USER ROUTE (blocks driver + admin)
const UserRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user?.role === 'driver') {
      return <Navigate to="/driver-dashboard" replace />;
    }

    if (user?.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }

  } catch (e) {}

  return children;
};


// ✅ DRIVER ROUTE
const DriverRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user?.role === 'driver') {
      return children;
    }

  } catch (e) {}

  return <Navigate to="/" replace />;
};


// ✅ ADMIN ROUTE (FIXED)
const AdminRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user?.role === 'admin') {
      return children;
    }

  } catch (e) {}

  return <Navigate to="/" replace />;
};


// ✅ ROUTES WITH RE-RENDER FIX
const AnimatedRoutes = () => {
  const location = useLocation();

  // 🔥 IMPORTANT: forces refresh when login/logout happens
  const token = localStorage.getItem('token');

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname + token}>

        {/* User routes */}
        <Route path="/" element={<UserRoute><Home /></UserRoute>} />
        <Route path="/search" element={<UserRoute><SearchResults /></UserRoute>} />
        <Route path="/bus/:id" element={<UserRoute><BusDetails /></UserRoute>} />
        <Route path="/checkout/:id" element={<UserRoute><Checkout /></UserRoute>} />
        <Route path="/my-bookings" element={<UserRoute><MyBookings /></UserRoute>} />

        <Route path="/tracking" element={<Tracking />} />
        <Route path="/help" element={<Help />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Driver */}
        <Route path="/driver-dashboard" element={<DriverRoute><DriverDashboard /></DriverRoute>} />

        {/* 🔥 ADMIN ROUTE */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      </Routes>
    </AnimatePresence>
  );
};


// ✅ MAIN APP
const LayoutWrapper = () => {
  const location = useLocation();
  const hideNavbar = ['/admin-dashboard', '/driver-dashboard', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password');
  
  const [authModal, setAuthModal] = React.useState(null);

  React.useEffect(() => {
    const handleOpenAuth = (e) => setAuthModal(e.detail || 'login');
    const handleCloseAuth = () => setAuthModal(null);

    window.addEventListener('openAuthModal', handleOpenAuth);
    window.addEventListener('closeAuthModal', handleCloseAuth);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuth);
      window.removeEventListener('closeAuthModal', handleCloseAuth);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col app-shell">
      {!hideNavbar && <Navbar />}

      <main className="flex-1 flex flex-col">
        <AnimatedRoutes />
      </main>

      {authModal && (
        <AuthModal
          type={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <Router>
        <LayoutWrapper />
      </Router>
    </SocketProvider>
  );
}

export default App;