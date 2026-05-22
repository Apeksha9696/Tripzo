import React from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
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
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';


// ✅ USER ROUTE (blocks driver + admin)
const UserRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!auth.ready) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (auth.user.role === 'driver') {
    return <Navigate to="/driver-dashboard" replace />;
  }

  if (auth.user.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};


// ✅ DRIVER ROUTE
const DriverRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!auth.ready) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (auth.user.role !== 'driver') {
    return <Navigate to="/" replace />;
  }

  return children;
};


// ✅ ADMIN ROUTE (FIXED)
const AdminRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!auth.ready) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (auth.user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};


// ✅ ROUTES WITH RE-RENDER FIX
const AnimatedRoutes = () => {
  const location = useLocation();
  const { auth } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname + (auth.token || '')}>

        {/* User routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<UserRoute><SearchResults /></UserRoute>} />
        <Route path="/bus/:id" element={<UserRoute><BusDetails /></UserRoute>} />
        <Route path="/checkout/:id" element={<UserRoute><Checkout /></UserRoute>} />
        <Route path="/my-bookings" element={<UserRoute><MyBookings /></UserRoute>} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
  const navigate = useNavigate();
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

  React.useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const idToken = await result.user.getIdToken();
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, { token: idToken });
          console.debug('Firebase redirect result', { user: res.data.user, role: res.data.user.role });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
          window.dispatchEvent(new Event('authChange'));
          if (res.data.user.role === 'admin') navigate('/admin-dashboard');
          else if (res.data.user.role === 'driver') navigate('/driver-dashboard');
          else navigate('/dashboard');
        }
      } catch (err) {
        console.warn('No redirect auth result or failed to process it', err?.message || err);
      }
    };

    handleRedirect();
  }, [navigate]);

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
        <AuthProvider>
          <LayoutWrapper />
        </AuthProvider>
      </Router>
    </SocketProvider>
  );
}

export default App;