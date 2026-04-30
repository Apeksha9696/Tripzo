import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBus } from 'react-icons/fa';
import { FiMenu, FiX, FiMapPin, FiLogOut, FiBookOpen, FiSettings, FiHelpCircle, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  });

  useEffect(() => {
    const handleAuthChange = () => setAuth({
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    });
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/help', label: 'Help', icon: FiHelpCircle },
    ...(auth.token && auth.user && auth.user.role !== 'driver'
      ? [{ to: '/tracking', label: 'Live Tracking', icon: FiMapPin }] : []),
  ];

  const userLinks = auth.user?.role === 'driver'
    ? [{ to: '/driver-dashboard', label: 'Driver Portal', icon: FaBus }]
    : auth.user?.role === 'admin'
    ? [{ to: '/admin-dashboard', label: 'Admin Portal', icon: FiSettings }]
    : [{ to: '/my-bookings', label: 'My Bookings', icon: FiBookOpen }];

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ padding: scrolled ? '0' : '8px 0 0' }}
      >
        <div
          className="mx-auto transition-all duration-500"
          style={{ maxWidth: scrolled ? '100%' : '1280px', padding: scrolled ? '0' : '0 16px' }}
        >
          <div
            className="transition-all duration-500"
            style={{
              background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.70)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: scrolled ? '0' : '20px',
              border: scrolled ? '1px solid rgba(244,143,177,0.2)' : '1px solid rgba(244,143,177,0.35)',
              boxShadow: scrolled
                ? '0 4px 32px rgba(194,24,91,0.08), 0 1px 0 rgba(255,255,255,0.6) inset'
                : '0 8px 40px rgba(194,24,91,0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
              padding: '0 24px',
            }}
          >
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: -12, scale: 1.12 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c, #f48fb1)' }}
                >
                  <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)' }} />
                  <FaBus className="w-4 h-4 text-white relative z-10" />
                </motion.div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black tracking-tight leading-none">
                    <span style={{ color: '#880e4f' }}>Trip</span>
                    <span style={{ background: 'linear-gradient(90deg, #c2185b, #f48fb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zo</span>
                  </span>
                  <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#f48fb1', letterSpacing: '0.15em' }}>Live Bus Tracking</span>
                </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 group"
                    style={{ color: isActive(link.to) ? '#c2185b' : '#ad1457' }}
                  >
                    {isActive(link.to) && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <link.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{link.label}</span>
                    {!isActive(link.to) && (
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: 'rgba(233,30,140,0.06)' }} />
                    )}
                  </Link>
                ))}

                {auth.token && auth.user ? (
                  <div className="flex items-center gap-1 ml-3 pl-3" style={{ borderLeft: '1px solid rgba(244,143,177,0.35)' }}>
                    {userLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 group"
                        style={{ color: isActive(link.to) ? '#c2185b' : '#ad1457' }}
                      >
                        {isActive(link.to) && (
                          <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl"
                            style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)' }} />
                        )}
                        <link.icon className="w-4 h-4 relative z-10" />
                        <span className="hidden lg:inline relative z-10">{link.label}</span>
                        {!isActive(link.to) && (
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ background: 'rgba(233,30,140,0.06)' }} />
                        )}
                      </Link>
                    ))}

                    <div className="relative ml-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setUserDropdown(!userDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
                        style={{
                          background: userDropdown ? 'rgba(233,30,140,0.12)' : 'rgba(252,228,236,0.6)',
                          border: '1px solid rgba(244,143,177,0.4)',
                        }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
                          <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)' }} />
                          <span className="relative z-10">{auth.user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-semibold text-sm hidden lg:block max-w-[80px] truncate" style={{ color: '#880e4f' }}>
                          {auth.user.name}
                        </span>
                        <motion.div animate={{ rotate: userDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <FiChevronDown className="w-3.5 h-3.5" style={{ color: '#c2185b' }} />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {userDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.94 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                            style={{
                              background: 'rgba(255,255,255,0.95)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              border: '1px solid rgba(244,143,177,0.3)',
                              boxShadow: '0 20px 60px rgba(194,24,91,0.18), 0 4px 16px rgba(0,0,0,0.06)',
                            }}
                          >
                            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(244,143,177,0.15)', background: 'rgba(252,228,236,0.4)' }}>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                                  style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
                                  {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-sm leading-none mb-0.5" style={{ color: '#880e4f' }}>{auth.user.name}</p>
                                  <p className="text-xs capitalize" style={{ color: '#f48fb1' }}>{auth.user.role || 'Passenger'}</p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-3 font-semibold text-sm transition-all duration-150"
                              style={{ color: '#ef4444' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
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
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }))}
                      className="px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{ color: '#c2185b', background: 'rgba(252,228,236,0.5)', border: '1px solid rgba(244,143,177,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,228,236,0.9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(252,228,236,0.5)'}
                    >
                      Log in
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(194,24,91,0.45)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signup' }))}
                      className="px-5 py-2 rounded-xl font-bold text-sm text-white relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c, #f48fb1)', boxShadow: '0 4px 20px rgba(194,24,91,0.35)' }}
                    >
                      <span className="relative z-10">Get Started</span>
                    </motion.button>
                  </div>
                )}
              </nav>

              {/* Mobile toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{
                  color: '#c2185b',
                  background: isMenuOpen ? 'rgba(233,30,140,0.12)' : 'rgba(252,228,236,0.5)',
                  border: '1px solid rgba(244,143,177,0.3)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="md:hidden mx-3 mt-2 mb-2 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(244,143,177,0.3)',
                boxShadow: '0 20px 60px rgba(194,24,91,0.15)',
              }}
            >
              {auth.token && auth.user && (
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(244,143,177,0.15)', background: 'rgba(252,228,236,0.3)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                    style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
                    {auth.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#880e4f' }}>{auth.user.name}</p>
                    <p className="text-xs capitalize" style={{ color: '#f48fb1' }}>{auth.user.role || 'Passenger'}</p>
                  </div>
                </div>
              )}

              <div className="p-3 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                    style={{ color: isActive(link.to) ? '#c2185b' : '#ad1457', background: isActive(link.to) ? 'rgba(233,30,140,0.08)' : 'transparent' }}
                    onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'rgba(233,30,140,0.05)'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.08)' }}>
                      <link.icon className="w-4 h-4" style={{ color: '#c2185b' }} />
                    </div>
                    {link.label}
                    {isActive(link.to) && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#c2185b' }} />}
                  </Link>
                ))}

                {auth.token && auth.user && (
                  <>
                    <div className="my-1" style={{ borderTop: '1px solid rgba(244,143,177,0.15)' }} />
                    {userLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                        style={{ color: isActive(link.to) ? '#c2185b' : '#ad1457', background: isActive(link.to) ? 'rgba(233,30,140,0.08)' : 'transparent' }}
                        onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'rgba(233,30,140,0.05)'; }}
                        onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.08)' }}>
                          <link.icon className="w-4 h-4" style={{ color: '#c2185b' }} />
                        </div>
                        {link.label}
                      </Link>
                    ))}
                    <div className="my-1" style={{ borderTop: '1px solid rgba(244,143,177,0.15)' }} />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      Sign out
                    </button>
                  </>
                )}

                {!auth.token && (
                  <div className="pt-2 pb-1 space-y-2" style={{ borderTop: '1px solid rgba(244,143,177,0.15)' }}>
                    <button
                      onClick={() => { window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); setIsMenuOpen(false); }}
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all"
                      style={{ color: '#c2185b', background: 'rgba(252,228,236,0.6)', border: '1px solid rgba(244,143,177,0.3)' }}
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => { window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signup' })); setIsMenuOpen(false); }}
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)', boxShadow: '0 4px 20px rgba(194,24,91,0.3)' }}
                    >
                      Get Started — It's Free
                    </button>
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
