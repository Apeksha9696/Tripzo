import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const STORAGE_TOKEN = 'token';
const STORAGE_USER = 'user';

const parseUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('Failed to parse stored user', err);
    return null;
  }
};

const setAuthStorage = (token, user) => {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN, token);
  }
  if (user) {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, ready: false });

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const user = parseUser();

    console.debug('AuthProvider initializing', { tokenExists: Boolean(token), userLoaded: Boolean(user) });

    if (token && user) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setAuth({ token, user, ready: true });
    } else {
      delete axios.defaults.headers.common.Authorization;
      setAuth({ token: null, user: null, ready: true });
    }
  }, []);

  useEffect(() => {
    const reloadAuth = () => {
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
    console.debug('AuthProvider login', { user });
    setAuthStorage(token, user);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    setAuth({ token, user, ready: true });
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    console.debug('AuthProvider logout');
    clearAuthStorage();
    delete axios.defaults.headers.common.Authorization;
    setAuth({ token: null, user: null, ready: true });
    window.dispatchEvent(new Event('authChange'));
  };

  const isAuthenticated = Boolean(auth.token && auth.user);

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated }}>
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
