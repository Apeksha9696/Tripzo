import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.02 }
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const allowedDomains = ['gmail.com', 'outlook.com'];

  const isValidDomain = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.includes(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('[Login] Form submitted with email:', formData.email);

    // ✅ Email domain check
    if (!isValidDomain(formData.email)) {
      console.warn('[Login] Email domain not allowed:', formData.email);
      setError('Only gmail.com and outlook.com email addresses are allowed.');
      return;
    }

    try {
      console.log('[Login] Sending login request to backend...');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );

      console.log('[Login] Backend response received:', {
        userId: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role
      });

      login(res.data.token, res.data.user);

      const returnTo = location.state?.returnTo;

      console.log('[Login] Redirecting based on role:', res.data.user.role, 'returnTo:', returnTo);

      if (returnTo) {
        navigate(returnTo, { state: location.state?.returnState, replace: true });
      } else if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (res.data.user.role === 'driver') {
        navigate('/driver-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error('[Login] Error:', err.response?.status, err.response?.data?.error);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-center items-center py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50"
    >
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">

        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
          Welcome back
        </h2>

        {/* ❌ Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-200 font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* 🔐 FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email address
            </label>
            <input 
              type="email"
              required
              value={formData.email}
              autoComplete="off"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="appearance-none block w-full px-5 py-4 border-0 rounded-2xl shadow-inner bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input 
              type="password"
              required
              value={formData.password}
              autoComplete="new-password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="appearance-none block w-full px-5 py-4 border-0 rounded-2xl shadow-inner bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-brand-dark/30 text-sm font-extrabold text-white bg-gradient-to-r from-brand-dark to-brand-primary hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-300"
          >
            Sign in
          </motion.button>
        </form>

        {/* Signup */}
        <p className="mt-10 text-center text-sm font-medium text-gray-500">
          Not registered yet?{' '}
          <Link
            to="/signup"
            state={location.state}
            className="font-extrabold text-brand-dark hover:text-brand-primary transition-colors duration-200"
          >
            Create an account
          </Link>
        </p>

      </div>
    </motion.div>
  );
}