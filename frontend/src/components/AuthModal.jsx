import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBus } from 'react-icons/fa';
import { FiX, FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal({ type: initialType, onClose }) {
  const [type, setType]       = useState(initialType || 'login');
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [error, setError]     = useState('');
  const [gLoading, setGLoad]  = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const validDomain = (e) => ['gmail.com','outlook.com'].includes(e.split('@')[1]?.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!validDomain(form.email)) { setError('Only gmail.com and outlook.com addresses are allowed.'); return; }
    try {
      const ep = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${ep}`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      window.dispatchEvent(new Event('authChange'));
      onClose();
      if (res.data.user.role === 'admin')  window.location.href = '/admin-dashboard';
      else if (res.data.user.role === 'driver') window.location.href = '/driver-dashboard';
      else window.location.reload();
    } catch (err) { setError(err.response?.data?.error || (type === 'login' ? 'Login failed' : 'Registration failed')); }
  };

  const handleGoogle = async () => {
    setGLoad(true); setError('');
    try {
      const res2 = await signInWithPopup(auth, new GoogleAuthProvider());
      const token = await res2.user.getIdToken();
      const res = await axios.post('http://localhost:5000/api/auth/google', { token });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      window.dispatchEvent(new Event('authChange'));
      onClose();
      if (res.data.user.role === 'admin')  window.location.href = '/admin-dashboard';
      else if (res.data.user.role === 'driver') window.location.href = '/driver-dashboard';
      else window.location.reload();
    } catch (err) { setError(err.response?.data?.error || err.message || 'Google login failed.'); }
    finally { setGLoad(false); }
  };

  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all input-glass";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background:'rgba(26,32,44,0.35)', backdropFilter:'blur(12px)' }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-w-sm w-full rounded-3xl overflow-hidden"
          style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(24px) saturate(180%)', border:'1px solid rgba(45,212,191,0.2)', boxShadow:'0 32px 80px rgba(45,212,191,0.18)' }}
          initial={{ opacity:0, y:28, scale:0.95 }}
          animate={{ opacity:1, y:0, scale:1, transition:{ type:'spring', damping:24, stiffness:280 } }}
          exit={{ opacity:0, scale:0.95 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Accent bar */}
          <div className="h-1" style={{ background:'linear-gradient(90deg,#2dd4bf,#14b8a6,rgba(45,212,191,0.3))' }} />

          {/* Header */}
          <div className="px-6 pt-6 pb-5 relative" style={{ background:'linear-gradient(135deg,rgba(45,212,191,0.08),rgba(255,255,255,0))' }}>
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background:'rgba(45,212,191,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(45,212,191,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(45,212,191,0.1)'}
            >
              <FiX className="w-4 h-4" style={{ color:'#0f766e' }} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#2dd4bf,#14b8a6)', boxShadow:'0 4px 12px rgba(45,212,191,0.3)' }}>
                <FaBus className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-base" style={{ color:'#1a202c' }}>Tripzo</span>
            </div>
            <h2 className="text-xl font-black" style={{ color:'#1a202c' }}>
              {type === 'login' ? 'Welcome back 👋' : 'Create account'}
            </h2>
            <p className="text-xs mt-1" style={{ color:'#718096' }}>
              {type === 'login' ? 'Sign in to continue your journey' : 'Join thousands of happy travelers'}
            </p>
          </div>

          {/* Form */}
          <div className="px-6 pb-6">
            {error && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                className="flex items-center gap-2.5 p-3 rounded-xl text-xs mb-4 font-semibold"
                style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626' }}>
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {type === 'signup' && (
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'#2dd4bf' }} />
                  <input type="text" required value={form.name} placeholder="Full Name"
                    onChange={e => setForm({ ...form, name:e.target.value })}
                    className={inputCls}
                    onFocus={e => e.currentTarget.style.borderColor='#2dd4bf'}
                    onBlur={e => e.currentTarget.style.borderColor='rgba(45,212,191,0.2)'}
                  />
                </div>
              )}
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'#2dd4bf' }} />
                <input type="email" required value={form.email} placeholder="you@gmail.com"
                  onChange={e => setForm({ ...form, email:e.target.value })}
                  className={inputCls}
                  onFocus={e => e.currentTarget.style.borderColor='#2dd4bf'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(45,212,191,0.2)'}
                />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'#2dd4bf' }} />
                <input type="password" required value={form.password} placeholder="••••••••"
                  onChange={e => setForm({ ...form, password:e.target.value })}
                  className={inputCls}
                  onFocus={e => e.currentTarget.style.borderColor='#2dd4bf'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(45,212,191,0.2)'}
                />
              </div>

              {type === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => { onClose(); window.location.href='/forgot-password'; }}
                    className="text-xs font-semibold" style={{ color:'#2dd4bf' }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                type="submit"
                className="w-full py-3 text-white rounded-xl font-bold text-sm btn-primary mt-1">
                {type === 'login' ? 'Sign in' : 'Create Account'}
              </motion.button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t" style={{ borderColor:'rgba(45,212,191,0.12)' }} />
              <span className="mx-3 text-xs" style={{ color:'#a0aec0' }}>OR</span>
              <div className="flex-grow border-t" style={{ borderColor:'rgba(45,212,191,0.12)' }} />
            </div>

            <button onClick={handleGoogle} disabled={gLoading} type="button"
              className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
              style={{ background:'#ffffff', border:'1px solid rgba(45,212,191,0.2)', color:'#1a202c' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(45,212,191,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background='#ffffff'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {gLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <p className="mt-4 text-center text-xs" style={{ color:'#a0aec0' }}>
              {type === 'login' ? 'New to Tripzo?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => { setError(''); setType(type === 'login' ? 'signup' : 'login'); }}
                className="font-bold underline underline-offset-2" style={{ color:'#2dd4bf' }}>
                {type === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
