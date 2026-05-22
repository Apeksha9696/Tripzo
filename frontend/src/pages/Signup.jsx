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

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
    if (!isValidDomain(formData.email)) {
      setError('Only gmail.com and outlook.com email addresses are allowed.');
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
      login(res.data.token, res.data.user);

      const returnTo = location.state?.returnTo;
      if (returnTo) {
        navigate(returnTo, { state: location.state?.returnState });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-center items-center py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50"
    >
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">Create an account</h2>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-200 font-medium">
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="appearance-none block w-full px-5 py-4 border-0 rounded-2xl shadow-inner bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="appearance-none block w-full px-5 py-4 border-0 rounded-2xl shadow-inner bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="appearance-none block w-full px-5 py-4 border-0 rounded-2xl shadow-inner bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-brand-dark/30 text-sm font-extrabold text-white bg-gradient-to-r from-brand-dark to-brand-primary hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-300"
          >
            Register Let's Go!
          </motion.button>
        </form>

        <p className="mt-10 text-center text-sm font-medium text-gray-500">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-extrabold text-brand-dark hover:text-brand-primary transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
