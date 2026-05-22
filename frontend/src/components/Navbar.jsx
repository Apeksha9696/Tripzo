import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBus } from 'react-icons/fa';
import { FiMenu, FiX, FiMapPin, FiLogOut, FiBookOpen, FiSettings, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { auth, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setIsMenuOpen(false); setUserDropdown(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (p) => location.pathname === p;

  const navLinks = [
    { to: '/help', label: 'Help', icon: FiHelpCircle },
    ...(isAuthenticated && auth.user?.role !== 'driver'
      ? [{ to: '/tracking', label: 'Live Tracking', icon: FiMapPin }] : []),
  ];

  const userLinks = auth.user?.role === 'driver'
    ? [{ to: '/driver-dashboard', label: 'Driver Portal', icon: FaBus }]
    : auth.user?.role === 'admin'
    ? [{ to: '/admin-dashboard', label: 'Admin Portal', icon: FiSettings }]
    : [{ to: '/my-bookings', label: 'My Bookings', icon: FiBookOpen }];

  const navStyle = {
    background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: `1px solid ${scrolled ? '#e2e8f0' : 'transparent'}`,
    boxShadow: scrolled ? '0 2px 24px rgba(45,212,191,0.1)' : 'none',
    transition: 'all 0.3s ease',
  };

  const linkStyle = (active) => ({
    color: active ? '#0f766e' : '#4a5568',
    background: active ? 'rgba(45,212,191,0.1)' : 'transparent',
    borderRadius: '0.75rem',
    padding: '0.4rem 0.875rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.15s',
  });

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <motion.div
                whileHover={{ rotate: -12, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 12px rgba(45,212,191,0.35)' }}
              >
                <FaBus className="w-4 h-4 text-white" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tight" style={{ color: '#1a202c' }}>
                  Trip<span style={{ color: '#2dd4bf' }}>zo</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#2dd4bf', opacity: 0.8 }}>Live Bus Tracking</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} style={linkStyle(isActive(link.to))}
                  onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'rgba(45,212,191,0.08)'; e.currentTarget.style.color = '#0f766e'; } }}
                  onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a5568'; } }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && auth.user ? (
                <div className="flex items-center gap-1 ml-2 pl-2" style={{ borderLeft: '1px solid rgba(45,212,191,0.2)' }}>
                  {userLinks.map((link) => (
                    <Link key={link.to} to={link.to} style={linkStyle(isActive(link.to))}
                      onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'rgba(45,212,191,0.08)'; e.currentTarget.style.color = '#0f766e'; } }}
                      onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a5568'; } }}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{link.label}</span>
                    </Link>
                  ))}

                  <div className="relative ml-1">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                      style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs"
                        style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                        {auth.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm hidden lg:block max-w-[80px] truncate" style={{ color: '#1a202c' }}>
                        {auth.user.name}
                      </span>
                      <motion.div animate={{ rotate: userDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <FiChevronDown className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {userDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                          style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(45,212,191,0.2)',
                            boxShadow: '0 16px 48px rgba(45,212,191,0.15)',
                          }}
                        >
                          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(45,212,191,0.1)', background: 'rgba(230,255,250,0.5)' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                                style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                                {auth.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm" style={{ color: '#1a202c' }}>{auth.user.name}</p>
                                <p className="text-xs capitalize" style={{ color: '#2dd4bf' }}>{auth.user.role || 'Passenger'}</p>
                              </div>
                            </div>
                          </div>
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 font-semibold text-sm transition-all"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <FiLogOut className="w-4 h-4" /> Sign out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }))}
                    className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                    style={{ color: '#0f766e', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,212,191,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(45,212,191,0.08)'}
                  >Log in</motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(45,212,191,0.45)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signup' }))}
                    className="px-4 py-2 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 16px rgba(45,212,191,0.35)' }}
                  >Get Started</motion.button>
                </div>
              )}
            </nav>

            {/* Mobile toggle */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ color: '#0f766e', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div key={isMenuOpen ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
                >
                  {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="md:hidden mx-3 mt-1 mb-2 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(45,212,191,0.2)',
                boxShadow: '0 16px 48px rgba(45,212,191,0.12)',
              }}
            >
              {isAuthenticated && auth.user && (
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(45,212,191,0.1)', background: 'rgba(230,255,250,0.4)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                    style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                    {auth.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#1a202c' }}>{auth.user.name}</p>
                    <p className="text-xs capitalize" style={{ color: '#2dd4bf' }}>{auth.user.role || 'Passenger'}</p>
                  </div>
                </div>
              )}
              <div className="p-3 space-y-1">
                {[...navLinks, ...(isAuthenticated && auth.user ? userLinks : [])].map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ color: isActive(link.to) ? '#0f766e' : '#4a5568', background: isActive(link.to) ? 'rgba(45,212,191,0.1)' : 'transparent' }}
                    onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'rgba(45,212,191,0.06)'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                      <link.icon className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                    </div>
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && auth.user ? (
                  <>
                    <hr style={{ borderColor: 'rgba(45,212,191,0.1)', margin: '4px 0' }} />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="pt-2 pb-1 space-y-2" style={{ borderTop: '1px solid rgba(45,212,191,0.1)' }}>
                    <button onClick={() => { window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); setIsMenuOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl font-bold text-sm"
                      style={{ color: '#0f766e', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}
                    >Log in</button>
                    <button onClick={() => { window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signup' })); setIsMenuOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}
                    >Get Started — It's Free</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {userDropdown && <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />}
    </>
  );
}
