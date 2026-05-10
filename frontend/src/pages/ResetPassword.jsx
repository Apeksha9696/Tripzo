import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
      setSuccess(res.data.message || 'Password reset successfully.');
      setPassword('');
      setConfirmPassword('');
      // Redirect to home and open login modal after 2 seconds
      setTimeout(() => {
        navigate('/');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
        }, 300);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#f0fdfa', // teal-50
    border: '1.5px solid #99f6e4', // teal-200
    color: '#134e4a', // teal-900
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#f8fafc' }}>
      <motion.div
        className="max-w-md w-full rounded-3xl overflow-hidden relative"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid #ccfbf1',
          boxShadow: '0 30px 80px rgba(45,212,191,0.12)',
        }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
      >
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #2dd4bf, #14b8a6, #0d9488)' }} />

        <div className="px-8 pt-8 pb-6 relative" style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
          <h2 className="text-2xl font-black text-white">
            Create New Password
          </h2>
          <p className="text-sm mt-1" style={{ color: '#ccfbf1' }}>
            Enter your new password below.
          </p>
        </div>

        <div className="px-8 py-7">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl text-sm mb-5 font-semibold"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl text-sm mb-5 font-semibold"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
              <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#134e4a' }}>New Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2dd4bf' }} />
                <input type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-semibold outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#14b8a6'}
                  onBlur={e => e.currentTarget.style.borderColor = '#99f6e4'}
                  placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#134e4a' }}>Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2dd4bf' }} />
                <input type="password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-semibold outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#14b8a6'}
                  onBlur={e => e.currentTarget.style.borderColor = '#99f6e4'}
                  placeholder="••••••••" />
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !!success}
              className="w-full py-4 mt-2 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 10px 30px rgba(45,212,191,0.3)' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
