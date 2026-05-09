import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaUsers, FaMapMarkerAlt, FaSearch, FaChevronDown, FaLocationArrow } from 'react-icons/fa';
import { FiWifi, FiWifiOff, FiLogOut, FiHome } from 'react-icons/fi';

export default function DriverDashboard() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBus, setExpandedBus] = useState(null);
  const [gpsStatus, setGpsStatus] = useState({});
  const [updateStatus, setUpdateStatus] = useState({});
  const gpsWatchRef = useRef({});
  const gpsIntervalRef = useRef({});
  const latestPositionRef = useRef({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const res = await axios.get('http://localhost:5000/api/driver/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        setBuses(res.data);
      } catch (err) {
        setError(err?.response?.status === 403 ? 'Access Denied' : 'Failed to load dashboard');
      } finally { setLoading(false); }
    };
    fetchDashboardData();
    return () => {
      Object.values(gpsWatchRef.current).forEach(id => navigator.geolocation.clearWatch(id));
      Object.values(gpsIntervalRef.current).forEach(id => clearInterval(id));
    };
  }, [navigate]);

  const startGPS = (busId) => {
    if (gpsWatchRef.current[busId]) return;
    setGpsStatus(prev => ({ ...prev, [busId]: { tracking: true, message: 'Starting GPS...' } }));
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        latestPositionRef.current[busId] = coords;
        setGpsStatus(prev => ({ ...prev, [busId]: { tracking: true, coords, message: 'Live GPS Active' } }));
      },
      (err) => setGpsStatus(prev => ({ ...prev, [busId]: { tracking: false, message: err.message } })),
      { enableHighAccuracy: true }
    );
    gpsWatchRef.current[busId] = watchId;
    gpsIntervalRef.current[busId] = setInterval(async () => {
      const pos = latestPositionRef.current[busId];
      if (!pos) return;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/update-location', { busId, lat: pos.lat, lng: pos.lng }, { headers: { Authorization: `Bearer ${token}` } });
        setUpdateStatus(prev => ({ ...prev, [busId]: { type: 'success', message: 'Synced' } }));
      } catch (err) {
        setUpdateStatus(prev => ({ ...prev, [busId]: { type: 'error', message: err?.message || 'Sync failed' } }));
      }
    }, 3000);
  };

  const stopGPS = (busId) => {
    if (gpsWatchRef.current[busId]) { navigator.geolocation.clearWatch(gpsWatchRef.current[busId]); delete gpsWatchRef.current[busId]; }
    if (gpsIntervalRef.current[busId]) { clearInterval(gpsIntervalRef.current[busId]); delete gpsIntervalRef.current[busId]; }
    setGpsStatus(prev => ({ ...prev, [busId]: { tracking: false, message: 'GPS stopped' } }));
  };

  const sendManualLocation = async (busId) => {
    const pos = latestPositionRef.current[busId];
    if (!pos) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/update-location', { busId, lat: pos.lat, lng: pos.lng }, { headers: { Authorization: `Bearer ${token}` } });
      setBuses(prev => prev.map(b => b._id === busId ? { ...b, currentLocation: res.data.location } : b));
      setUpdateStatus(prev => ({ ...prev, [busId]: { type: 'success', message: 'Sent successfully' } }));
    } catch (err) {
      setUpdateStatus(prev => ({ ...prev, [busId]: { type: 'error', message: 'Send failed' } }));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: '#e2e8f0', borderTopColor: '#2dd4bf' }} />
        <p className="font-semibold text-sm animate-pulse" style={{ color: '#2dd4bf' }}>Loading Driver Portal...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center mt-10">
      <div className="white-card p-10">
        <h2 className="text-2xl font-black mb-3" style={{ color: '#1a202c' }}>Access Error</h2>
        <p className="mb-6 font-medium" style={{ color: '#718096' }}>{error}</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 rounded-xl font-black text-white btn-primary">Return Home</button>
      </div>
    </div>
  );

  const activeBuses = buses.filter(b => b.bookings?.length > 0);

  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>

      {/* Top Bar */}
      <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-4"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 12px rgba(45,212,191,0.3)' }}>
            <FaBus className="w-4 h-4" />
          </div>
          <span className="font-black text-base" style={{ color: '#1a202c' }}>
            Driver<span style={{ color: '#2dd4bf' }}>Portal</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:block" style={{ color: '#718096' }}>Welcome, {user.name}</span>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ color: '#0f766e', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,212,191,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(45,212,191,0.08)'}
          >
            <FiHome className="w-4 h-4" /> Home
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          >
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-2" style={{ color: '#1a202c' }}>Driver Dashboard</h1>
          <p className="font-medium" style={{ color: '#718096' }}>Manage active bookings, view passenger manifests, and control live GPS</p>
        </motion.div>

        {activeBuses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="white-card p-16 text-center">
            <div className="w-20 h-20 rounded-2xl flex justify-center items-center mx-auto mb-5"
              style={{ background: 'rgba(45,212,191,0.08)' }}>
              <FaSearch className="w-8 h-8" style={{ color: '#2dd4bf' }} />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: '#1a202c' }}>No Active Bookings</h3>
            <p className="font-medium" style={{ color: '#718096' }}>You currently have no buses with booked seats.</p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {activeBuses.map((bus, idx) => {
              const isExpanded = expandedBus === bus._id;
              return (
                <motion.div key={bus._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  className="white-card overflow-hidden">

                  {/* Bus header */}
                  <div className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5"
                    onClick={() => setExpandedBus(isExpanded ? null : bus._id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,212,191,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white text-xs font-black px-3 py-1 rounded-full"
                          style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>{bus.operatorName}</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: 'rgba(45,212,191,0.08)', color: '#0f766e', border: '1px solid rgba(45,212,191,0.2)' }}>
                          {bus.busType || 'Standard Bus'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xl font-black" style={{ color: '#1a202c' }}>
                        {bus.from}
                        <FaMapMarkerAlt className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                        {bus.to}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#a0aec0' }}>Departure</p>
                        <p className="font-black text-base" style={{ color: '#1a202c' }}>{bus.date} <span style={{ color: '#718096' }}>{bus.departureTime}</span></p>
                      </div>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <FaChevronDown className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ borderTop: '1px solid #f1f5f9' }}>
                        <div className="p-6">
                          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">

                            {/* GPS Panel */}
                            <div className="rounded-2xl p-5" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)' }}>
                              <h4 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: '#1a202c' }}>
                                {gpsStatus[bus._id]?.tracking
                                  ? <FiWifi className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                                  : <FiWifiOff className="w-4 h-4" style={{ color: '#a0aec0' }} />}
                                Live GPS Tracking
                              </h4>

                              <div className="flex items-center gap-2 mb-4">
                                <span className={`w-2.5 h-2.5 rounded-full ${gpsStatus[bus._id]?.tracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                <span className="text-sm font-medium" style={{ color: gpsStatus[bus._id]?.tracking ? '#0f766e' : '#a0aec0' }}>
                                  {gpsStatus[bus._id]?.message || 'GPS Inactive'}
                                </span>
                              </div>

                              <div className="flex gap-3 mb-4">
                                <button onClick={() => startGPS(bus._id)} disabled={gpsStatus[bus._id]?.tracking}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                                  style={{
                                    background: gpsStatus[bus._id]?.tracking ? '#f1f5f9' : 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
                                    color: gpsStatus[bus._id]?.tracking ? '#a0aec0' : '#ffffff',
                                    cursor: gpsStatus[bus._id]?.tracking ? 'not-allowed' : 'pointer',
                                    boxShadow: gpsStatus[bus._id]?.tracking ? 'none' : '0 4px 14px rgba(45,212,191,0.3)',
                                  }}>
                                  <FaLocationArrow className="w-3.5 h-3.5" /> Start
                                </button>
                                <button onClick={() => stopGPS(bus._id)} disabled={!gpsStatus[bus._id]?.tracking}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                                  style={{
                                    background: !gpsStatus[bus._id]?.tracking ? '#f1f5f9' : '#ef4444',
                                    color: !gpsStatus[bus._id]?.tracking ? '#a0aec0' : '#ffffff',
                                    cursor: !gpsStatus[bus._id]?.tracking ? 'not-allowed' : 'pointer',
                                  }}>
                                  Stop
                                </button>
                              </div>

                              {gpsStatus[bus._id]?.coords && (
                                <div className="rounded-xl p-3 mb-3" style={{ background: '#ffffff', border: '1px solid rgba(45,212,191,0.2)' }}>
                                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#a0aec0' }}>Active Coordinates</p>
                                  <p className="text-sm font-semibold" style={{ color: '#1a202c' }}>
                                    Lat: <span style={{ color: '#2dd4bf' }}>{gpsStatus[bus._id].coords.lat.toFixed(5)}</span>
                                    {' '}Lng: <span style={{ color: '#2dd4bf' }}>{gpsStatus[bus._id].coords.lng.toFixed(5)}</span>
                                  </p>
                                </div>
                              )}

                              <button onClick={() => sendManualLocation(bus._id)} disabled={!gpsStatus[bus._id]?.coords}
                                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                                style={{
                                  background: gpsStatus[bus._id]?.coords ? '#1a202c' : '#f1f5f9',
                                  color: gpsStatus[bus._id]?.coords ? '#ffffff' : '#a0aec0',
                                  cursor: gpsStatus[bus._id]?.coords ? 'pointer' : 'not-allowed',
                                }}>
                                Force Location Sync
                              </button>

                              {updateStatus[bus._id] && (
                                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                  className="mt-3 text-xs font-semibold p-2.5 rounded-xl text-center"
                                  style={{
                                    background: updateStatus[bus._id].type === 'success' ? '#f0fdf4' : '#fef2f2',
                                    color: updateStatus[bus._id].type === 'success' ? '#16a34a' : '#dc2626',
                                    border: `1px solid ${updateStatus[bus._id].type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                                  }}>
                                  {updateStatus[bus._id].message}
                                </motion.div>
                              )}
                            </div>

                            {/* Passenger List */}
                            <div>
                              <h3 className="font-black text-base mb-4 flex items-center gap-2" style={{ color: '#1a202c' }}>
                                <FaUsers className="w-5 h-5" style={{ color: '#2dd4bf' }} />
                                Passengers ({bus.bookings.length})
                              </h3>
                              <div className="white-card overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                                        <th className="px-5 py-3 font-black text-white text-sm">Name</th>
                                        <th className="px-5 py-3 font-black text-white text-sm">Email</th>
                                        <th className="px-5 py-3 font-black text-white text-sm">Seats</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {bus.bookings?.map((booking, i) => (
                                        <tr key={booking._id}
                                          style={{ borderBottom: i < bus.bookings.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,212,191,0.03)'}
                                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                          <td className="px-5 py-3 font-semibold text-sm" style={{ color: '#1a202c' }}>
                                            {booking.user?.name || <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>Unknown</span>}
                                          </td>
                                          <td className="px-5 py-3 text-sm" style={{ color: '#718096' }}>
                                            {booking.user?.email || 'N/A'}
                                          </td>
                                          <td className="px-5 py-3">
                                            <span className="font-bold text-xs px-2.5 py-1 rounded-lg"
                                              style={{ background: 'rgba(45,212,191,0.08)', color: '#0f766e', border: '1px solid rgba(45,212,191,0.2)' }}>
                                              {booking.seats?.join(', ')}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
