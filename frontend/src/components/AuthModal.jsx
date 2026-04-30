import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBus } from 'react-icons/fa';
import { FiX, FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal({ type: initialType, onClose }) {
  const [type, setType] = useState(initialType || 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const allowedDomains = ['gmail.com', 'outlook.com'];
  const isValidDomain = (email) => allowedDomains.includes(email.split('@')[1]?.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidDomain(formData.email)) { setError('Only gmail.com and outlook.com addresses are allowed.'); return; }
    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      window.dispatchEvent(new Event('authChange'));
      onClose();

      // Redirect if role is admin or driver
      if (res.data.user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (res.data.user.role === 'driver') {
        window.location.href = '/driver-dashboard';
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || (type === 'login' ? 'Login failed' : 'Registration failed'));
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const token = await user.getIdToken();
      const res = await axios.post('http://localhost:5000/api/auth/google', { token });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      window.dispatchEvent(new Event('authChange'));
      onClose();

      // Redirect if role is admin or driver
      if (res.data.user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (res.data.user.role === 'driver') {
        window.location.href = '/driver-dashboard';
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error during Google login:', err);
      setError(err.response?.data?.error || err.message || 'Failed to login with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const inputStyle = {
    background: '#fff0f5',
    border: '1.5px solid #f8bbd0',
    color: '#4a0028',
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(74,0,40,0.45)', backdropFilter: 'blur(12px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-w-md w-full rounded-3xl overflow-hidden relative"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid #f8bbd0',
            boxShadow: '0 30px 80px rgba(194,24,91,0.22)',
          }}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #c2185b, #e91e8c, #f48fb1)' }} />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 relative" style={{ background: 'linear-gradient(135deg, #4a0028, #880e4f)' }}>
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              <FiX className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
                <FaBus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">Tripzo</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {type === 'login' ? 'Welcome back 👋' : 'Create account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#f8bbd0' }}>
              {type === 'login' ? 'Sign in to continue your journey' : 'Join thousands of happy travelers'}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl text-sm mb-5 font-semibold"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'signup' && (
                <div>
                  <label className="block text-sm font-bold mb-1.5" style={{ color: '#4a0028' }}>Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#f48fb1' }} />
                    <input type="text" required value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-semibold outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#c2185b'}
                      onBlur={e => e.currentTarget.style.borderColor = '#f8bbd0'}
                      placeholder="John Doe" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#4a0028' }}>Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#f48fb1' }} />
                  <input type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-semibold outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#c2185b'}
                    onBlur={e => e.currentTarget.style.borderColor = '#f8bbd0'}
                    placeholder="you@gmail.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#4a0028' }}>Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#f48fb1' }} />
                  <input type="password" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-semibold outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#c2185b'}
                    onBlur={e => e.currentTarget.style.borderColor = '#f8bbd0'}
                    placeholder="••••••••" />
                </div>
              </div>
              
              {type === 'login' && (
                <div className="flex justify-end">
                  <button type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/forgot-password';
                    }}
                    className="text-xs font-bold transition-colors"
                    style={{ color: '#c2185b' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#880e4f'}
                    onMouseLeave={e => e.currentTarget.style.color = '#c2185b'}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 mt-2 text-white rounded-2xl font-black text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)', boxShadow: '0 10px 30px rgba(194,24,91,0.3)' }}
              >
                {type === 'login' ? 'Sign in' : 'Create Account'}
              </motion.button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-sm text-gray-400 font-medium">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#f8bbd0', color: '#4a0028' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <p className="mt-6 text-center text-sm" style={{ color: '#64748b' }}>
              {type === 'login' ? 'New to Tripzo?' : 'Already have an account?'}{' '}
              <button type="button"
                onClick={() => { setError(''); setType(type === 'login' ? 'signup' : 'login'); }}
                className="font-black underline decoration-2 underline-offset-4 transition-colors"
                style={{ color: '#c2185b' }}
                onMouseEnter={e => e.currentTarget.style.color = '#880e4f'}
                onMouseLeave={e => e.currentTarget.style.color = '#c2185b'}
              >
                {type === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
