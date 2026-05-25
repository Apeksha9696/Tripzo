import React from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

  console.log('[UserRoute] Checking access:', {
    ready: auth.ready,
    authenticated: isAuthenticated,
    role: auth.user?.role,
    path: location.pathname
  });

  if (!auth.ready) {
    console.log('[UserRoute] Auth not ready, showing loading...');
    return null;
  }

  if (!isAuthenticated) {
    console.log('[UserRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (auth.user.role === 'driver') {
    console.log('[UserRoute] User is driver, redirecting to driver-dashboard');
    return <Navigate to="/driver-dashboard" replace />;
  }

  if (auth.user.role === 'admin') {
    console.log('[UserRoute] User is admin, redirecting to admin-dashboard');
    return <Navigate to="/admin-dashboard" replace />;
  }

  console.log('[UserRoute] Access granted for user:', auth.user.email);
  return children;
};


// ✅ DRIVER ROUTE
const DriverRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('[DriverRoute] Checking access:', {
    ready: auth.ready,
    authenticated: isAuthenticated,
    role: auth.user?.role,
    path: location.pathname
  });

  if (!auth.ready) {
    console.log('[DriverRoute] Auth not ready, showing loading...');
    return null;
  }

  if (!isAuthenticated) {
    console.log('[DriverRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (auth.user.role !== 'driver') {
    console.log('[DriverRoute] User is not driver, redirecting to home. Role:', auth.user.role);
    return <Navigate to="/" replace />;
  }

  console.log('[DriverRoute] Access granted for driver:', auth.user.email);
  return children;
};


// ✅ ADMIN ROUTE (FIXED)
const AdminRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('[AdminRoute] Checking access:', {
    ready: auth.ready,
    authenticated: isAuthenticated,
    role: auth.user?.role,
    path: location.pathname
  });

  if (!auth.ready) {
    console.log('[AdminRoute] Auth not ready, showing loading...');
    return null;
  }

  if (!isAuthenticated) {
    console.log('[AdminRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ returnTo: location.pathname, returnState: location.state }} />;
  }

  if (auth.user.role !== 'admin') {
    console.log('[AdminRoute] User is not admin, redirecting to home. Role:', auth.user.role);
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Access granted for admin:', auth.user.email);
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
        <Route path="/search" element={<SearchResults />} />
        <Route path="/bus/:id" element={<BusDetails />} />
        <Route path="/checkout/:id" element={<UserRoute><Checkout /></UserRoute>} />
        <Route path="/my-bookings" element={<UserRoute><MyBookings /></UserRoute>} />

        <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
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
  const { login } = useAuth();
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

  // Handle Firebase redirect result (for production redirect-based OAuth)
  React.useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('[App] Checking for Firebase redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('[App] Firebase redirect result received:', result.user.email);
          
          const idToken = await result.user.getIdToken();
          console.log('[App] Firebase ID token obtained, sending to backend...');
          
          const API_URL = import.meta.env.VITE_API_URL;
          const response = await axios.post(`${API_URL}/api/auth/google`, { token: idToken }, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          });
          
          console.log('[App] Backend response received:', {
            userId: response.data.user.id,
            email: response.data.user.email,
            role: response.data.user.role
          });
          
          // Use auth context to store credentials
          login(response.data.token, response.data.user);
          
          // Redirect based on role
          console.log('[App] Redirecting based on role:', response.data.user.role);
          if (response.data.user.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else if (response.data.user.role === 'driver') {
            navigate('/driver-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('[App] No Firebase redirect result found');
        }
      } catch (err) {
        if (err.code !== 'auth/no-redirect-user') {
          console.error('[App] Error handling Firebase redirect:', err.message);
        }
      }
    };

    handleRedirect();
  }, [navigate, login]);

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