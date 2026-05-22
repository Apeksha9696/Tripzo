import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const STORAGE_TOKEN = 'token';
const STORAGE_USER = 'user';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

console.log('[AuthContext] Configured with API URL:', import.meta.env.VITE_API_URL);

const parseUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('[AuthContext] Failed to parse stored user:', err.message);
    return null;
  }
};

const setAuthStorage = (token, user) => {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN, token);
    console.log('[AuthContext] Token stored');
  }
  if (user) {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    console.log('[AuthContext] User stored:', { id: user.id, email: user.email });
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  console.log('[AuthContext] Auth storage cleared');
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, ready: false });
  const [verifyingToken, setVerifyingToken] = useState(false);

  // On mount, restore auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const user = parseUser();

    console.log('[AuthContext] Initializing from localStorage:', {
      tokenExists: Boolean(token),
      userExists: Boolean(user),
      userEmail: user?.email
    });

    if (token && user) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setAuth({ token, user, ready: true });
      console.log('[AuthContext] Session restored from localStorage');

      // Optionally verify token with backend
      verifyTokenWithBackend(token);
    } else {
      delete axios.defaults.headers.common.Authorization;
      setAuth({ token: null, user: null, ready: true });
      console.log('[AuthContext] No session found, ready for login');
    }
  }, []);

  // Verify token validity with backend
  const verifyTokenWithBackend = async (token) => {
    try {
      setVerifyingToken(true);
      console.log('[AuthContext] Verifying token with backend...');

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[AuthContext] Token verified with backend:', {
        userId: response.data.user.id,
        email: response.data.user.email
      });

      // Update user data from backend (in case it changed)
      const user = response.data.user;
      setAuthStorage(token, user);
      setAuth({ token, user, ready: true });
    } catch (err) {
      console.warn('[AuthContext] Token verification failed:', err.response?.status, err.message);
      // Token is invalid/expired, clear auth
      clearAuthStorage();
      delete axios.defaults.headers.common.Authorization;
      setAuth({ token: null, user: null, ready: true });
    } finally {
      setVerifyingToken(false);
    }
  };

  // Listen for storage changes (logout from another tab)
  useEffect(() => {
    const reloadAuth = () => {
      console.log('[AuthContext] Reloading auth from storage');
      const token = localStorage.getItem(STORAGE_TOKEN);
      const user = parseUser();
      if (token && user) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common.Authorization;
      }
      setAuth({ token, user, ready: true });
    };

    const handleStorage = (event) => {
      if (event.key !== STORAGE_TOKEN && event.key !== STORAGE_USER) return;
      console.log('[AuthContext] Storage change detected:', event.key);
      reloadAuth();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('authChange', reloadAuth);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('authChange', reloadAuth);
    };
  }, []);

  const login = (token, user) => {
    console.log('[AuthContext] Login called:', { userId: user.id, email: user.email, role: user.role });
    setAuthStorage(token, user);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    setAuth({ token, user, ready: true });
    window.dispatchEvent(new Event('authChange'));
    console.log('[AuthContext] Login completed and session persisted');
  };

  const logout = async () => {
    console.log('[AuthContext] Logout called');
    try {
      // Optional: Call backend logout endpoint if it exists
      await axios.post('/api/auth/logout').catch(() => {
        // Backend logout endpoint may not exist, that's fine
      });
    } catch (err) {
      console.log('[AuthContext] Backend logout attempt (optional):', err.message);
    }

    clearAuthStorage();
    delete axios.defaults.headers.common.Authorization;
    setAuth({ token: null, user: null, ready: true });
    window.dispatchEvent(new Event('authChange'));
    console.log('[AuthContext] Logout completed');
  };

  const isAuthenticated = Boolean(auth.token && auth.user);

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated, verifyingToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
