import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaBus, FaUsers, FaMapMarkerAlt, FaSearch,
  FaRegCalendarAlt, FaChevronDown, FaChevronUp,
  FaLocationArrow, FaWifi
} from 'react-icons/fa';
import { FiWifiOff, FiLogOut, FiHome } from 'react-icons/fi';

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        const res = await axios.get(
          'http://localhost:5000/api/driver/dashboard',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBuses(res.data);
      } catch (err) {
        setError(
          err?.response?.status === 403
            ? 'Access Denied'
            : 'Failed to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      Object.values(gpsWatchRef.current).forEach(id => navigator.geolocation.clearWatch(id));
      Object.values(gpsIntervalRef.current).forEach(id => clearInterval(id));
    };
  }, [navigate]);

  // ================= START GPS =================
  const startGPS = (busId) => {
    if (gpsWatchRef.current[busId]) return;

    setGpsStatus(prev => ({
      ...prev,
      [busId]: { tracking: true, message: 'Starting GPS...' }
    }));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };

        latestPositionRef.current[busId] = coords;

        setGpsStatus(prev => ({
          ...prev,
          [busId]: { tracking: true, coords, message: 'Live GPS Active' }
        }));
      },
      (err) => {
        setGpsStatus(prev => ({
          ...prev,
          [busId]: { tracking: false, message: err.message }
        }));
      },
      { enableHighAccuracy: true }
    );

    gpsWatchRef.current[busId] = watchId;

    // Send location every 3 sec
    gpsIntervalRef.current[busId] = setInterval(async () => {
      const pos = latestPositionRef.current[busId];
      if (!pos) return;

      try {
        const token = localStorage.getItem('token');

        await axios.post(
          'http://localhost:5000/api/update-location',
          {
            busId,
            lat: pos.lat,
            lng: pos.lng
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUpdateStatus(prev => ({
          ...prev,
          [busId]: { type: 'success', message: 'Synced' }
        }));
      } catch (err) {
        setUpdateStatus(prev => ({
          ...prev,
          [busId]: {
            type: 'error',
            message: err?.message || 'Sync failed'
          }
        }));
      }
    }, 3000);
  };

  // ================= STOP GPS =================
  const stopGPS = (busId) => {
    if (gpsWatchRef.current[busId]) {
      navigator.geolocation.clearWatch(gpsWatchRef.current[busId]);
      delete gpsWatchRef.current[busId];
    }

    if (gpsIntervalRef.current[busId]) {
      clearInterval(gpsIntervalRef.current[busId]);
      delete gpsIntervalRef.current[busId];
    }

    setGpsStatus(prev => ({
      ...prev,
      [busId]: { tracking: false, message: 'GPS stopped' }
    }));
  };

  // ================= MANUAL SEND =================
  const sendManualLocation = async (busId) => {
    const pos = latestPositionRef.current[busId];
    if (!pos) return;

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'http://localhost:5000/api/update-location',
        {
          busId,
          lat: pos.lat,
          lng: pos.lng
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBuses(prev =>
        prev.map(b =>
          b._id === busId
            ? { ...b, currentLocation: res.data.location }
            : b
        )
      );

      setUpdateStatus(prev => ({
        ...prev,
        [busId]: { type: 'success', message: 'Sent successfully' }
      }));
    } catch (err) {
      setUpdateStatus(prev => ({
        ...prev,
        [busId]: { type: 'error', message: 'Send failed' }
      }));
    }
  };

  // ================= UI =================

  if (loading) return <div className="p-8 text-center text-primary-deep font-black animate-pulse mt-10 text-lg">Loading Driver Portal...</div>;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center mt-10">
      <div className="bg-red-50 p-10 rounded-2xl border border-red-200 shadow-sm">
        <h2 className="text-3xl font-black text-red-700 mb-3">Access Error</h2>
        <p className="text-red-600 text-lg font-bold mb-8">{error}</p>
        <button onClick={() => navigate('/')} className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-black hover:shadow-md transition-all duration-200 uppercase tracking-wide">
          Return Home
        </button>
      </div>
    </div>
  );

  const activeBuses = buses.filter(b => b.bookings?.length > 0);

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-bg">


      {/* Driver Top Bar */}
      <div className="relative z-20 flex justify-between items-center px-8 py-4 bg-white/40 backdrop-blur-md border-b border-primary-pale shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
            <FaBus />
          </div>
          <span className="font-black text-primary-deep text-lg tracking-tight">Driver<span className="text-primary-light">Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-primary-dark/70 hidden sm:block">Welcome, {user.name}</span>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary-dark hover:bg-white/60 transition-colors">
            <FiHome /> Home
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-error bg-error/10 hover:bg-error hover:text-white transition-colors">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-5xl font-black text-primary-deep tracking-tight mb-3">Driver Dashboard</h1>
          <p className="text-xl text-primary-dark/70 font-bold">Manage active bookings, view passenger manifests, and control live GPS</p>
        </motion.div>

        {activeBuses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-md rounded-2xl p-20 text-center border border-primary-pale shadow-sm">
            <div className="w-24 h-24 bg-primary-pale border border-primary-lighter rounded-full flex justify-center items-center mx-auto mb-6">
              <FaSearch className="w-10 h-10 text-primary-light" />
            </div>
            <h3 className="text-2xl font-black text-primary-deep mb-3">No Active Bookings</h3>
            <p className="text-primary-dark/70 font-bold text-lg">You currently have no buses with booked seats.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {activeBuses.map((bus, idx) => {
              const isExpanded = expandedBus === bus._id;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  key={bus._id} 
                  className="bg-white/70 backdrop-blur-md rounded-[2rem] shadow-[0_8px_32px_rgba(194,24,91,0.05)] border border-white overflow-hidden transition-all duration-200 hover:shadow-lg"
                >
                  {/* Bus Summary Card */}
                  <div 
                    className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white/40 transition-colors duration-200"
                    onClick={() => setExpandedBus(isExpanded ? null : bus._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm shadow-primary/30">{bus.operatorName}</span>
                        <span className="text-sm text-primary-dark font-bold bg-primary-pale px-3 py-1 rounded-lg">{bus.busType || 'Standard Bus'}</span>
                      </div>
                      <div className="flex items-center text-2xl font-black text-primary-deep gap-3">
                        {bus.from} 
                        <FaMapMarkerAlt className="w-6 h-6 text-primary-light mx-1" />
                        {bus.to}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex gap-10 items-center justify-end md:border-l-2 md:border-primary-pale/50 md:pl-8 pt-6 md:pt-0 mt-4 md:mt-0">
                      <div className="text-right">
                        <p className="text-xs font-black text-primary-light uppercase tracking-widest mb-2">Departure</p>
                        <p className="font-black text-primary-deep text-lg">{bus.date} <span className="text-primary-dark/70 ml-2">{bus.departureTime}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex w-12 h-12 bg-primary-pale rounded-full justify-center items-center text-primary transition-all group-hover:bg-primary-light group-hover:text-white group-hover:scale-110 shrink-0 mx-auto md:mx-0 mt-4 md:mt-0">
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <FaChevronDown className="w-6 h-6 font-black" />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/50 border-t-2 border-primary-pale/50"
                      >
                        <div className="p-8">
                          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
                            
                            {/* GPS Tracker Panel */}
                            <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-primary-pale">
                              <h4 className="text-lg font-black text-primary-deep mb-5 flex items-center gap-2">
                                {gpsStatus[bus._id]?.tracking ? (
                                  <FaWifi className="w-5 h-5 text-primary animate-pulse" />
                                ) : (
                                  <FiWifiOff className="w-5 h-5 text-primary-light/50" />
                                )}
                                Live GPS Tracking
                              </h4>
                              
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${gpsStatus[bus._id]?.tracking ? 'bg-primary animate-pulse' : 'bg-primary-pale'}`}></div>
                                  <span className={`font-bold ${gpsStatus[bus._id]?.tracking ? 'text-primary' : 'text-primary-light/70'}`}>
                                    {gpsStatus[bus._id]?.message || 'GPS Inactive'}
                                  </span>
                                </div>

                                <div className="flex gap-3">
                                  <motion.button
                                    whileHover={!gpsStatus[bus._id]?.tracking ? { scale: 1.02 } : {}}
                                    whileTap={!gpsStatus[bus._id]?.tracking ? { scale: 0.98 } : {}}
                                    onClick={() => startGPS(bus._id)}
                                    disabled={gpsStatus[bus._id]?.tracking}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black transition-colors duration-200 ${
                                      gpsStatus[bus._id]?.tracking
                                        ? 'bg-primary-pale text-primary-light cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                                    }`}
                                  >
                                    <FaLocationArrow className="w-4 h-4" /> Start
                                  </motion.button>
                                  <motion.button
                                    whileHover={gpsStatus[bus._id]?.tracking ? { scale: 1.02 } : {}}
                                    whileTap={gpsStatus[bus._id]?.tracking ? { scale: 0.98 } : {}}
                                    onClick={() => stopGPS(bus._id)}
                                    disabled={!gpsStatus[bus._id]?.tracking}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black transition-colors duration-200 ${
                                      !gpsStatus[bus._id]?.tracking
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-error text-white hover:bg-error/90 shadow-lg shadow-error/20'
                                    }`}
                                  >
                                    Stop
                                  </motion.button>
                                </div>

                                {gpsStatus[bus._id]?.coords && (
                                  <div className="rounded-2xl bg-white border border-primary-pale p-4">
                                    <p className="font-black text-primary-deep mb-2 flex items-center gap-2 text-sm">
                                      <FaMapMarkerAlt className="w-4 h-4 text-primary" /> Active Coordinates
                                    </p>
                                    <div className="space-y-1 text-sm font-semibold text-primary-dark">
                                      <p>Lat: <span className="font-black text-primary">{gpsStatus[bus._id].coords.lat.toFixed(5)}</span></p>
                                      <p>Lng: <span className="font-black text-primary">{gpsStatus[bus._id].coords.lng.toFixed(5)}</span></p>
                                    </div>
                                  </div>
                                )}

                                <motion.button
                                  whileHover={gpsStatus[bus._id]?.coords ? { scale: 1.02 } : {}}
                                  whileTap={gpsStatus[bus._id]?.coords ? { scale: 0.98 } : {}}
                                  onClick={() => sendManualLocation(bus._id)}
                                  disabled={!gpsStatus[bus._id]?.coords}
                                  className={`w-full px-4 py-3 rounded-2xl font-black transition-colors duration-200 ${
                                    gpsStatus[bus._id]?.coords
                                      ? 'bg-primary-deep text-white hover:bg-black shadow-lg shadow-primary-deep/20'
                                      : 'bg-primary-pale text-primary-light cursor-not-allowed'
                                  }`}
                                >
                                  Force Location Sync
                                </motion.button>

                                {updateStatus[bus._id] && (
                                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    className={`text-sm font-semibold p-3 rounded-xl ${
                                    updateStatus[bus._id].type === 'success'
                                      ? 'bg-green-50 text-green-700 border border-green-200'
                                      : 'bg-red-50 text-error border border-error/30'
                                  }`}>
                                    {updateStatus[bus._id].message}
                                  </motion.div>
                                )}
                                
                                {bus.currentLocation && (
                                  <div className="rounded-2xl bg-primary-pale border border-primary-lighter p-4 mt-2">
                                    <p className="font-black text-primary-deep mb-1 text-xs uppercase tracking-wider">Synced Position</p>
                                    <p className="text-sm text-primary-dark font-semibold">Lat: {bus.currentLocation.lat.toFixed(5)}, Lng: {bus.currentLocation.lng.toFixed(5)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Passenger List */}
                            <div>
                              <h3 className="font-black text-primary-deep mb-4 flex items-center gap-3 text-xl">
                                <FaUsers className="w-6 h-6 text-primary" /> Passengers ({bus.bookings.length})
                              </h3>
                              <div className="bg-white/80 rounded-3xl border border-primary-pale overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-gradient-to-r from-primary to-primary-light text-white text-sm">
                                        <th className="px-6 py-4 font-black border-none">Name</th>
                                        <th className="px-6 py-4 font-black border-none">Email</th>
                                        <th className="px-6 py-4 font-black border-none">Seats</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary-pale">
                                      {bus.bookings?.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-primary-pale/30 transition-colors duration-200">
                                          <td className="px-6 py-4 font-bold text-primary-deep">
                                            {booking.user?.name || <span className="text-primary-light italic">Unknown</span>}
                                          </td>
                                          <td className="px-6 py-4 text-primary-dark/80 text-sm font-semibold">
                                            {booking.user?.email || 'N/A'}
                                          </td>
                                          <td className="px-6 py-4">
                                            <span className="inline-block bg-primary-pale text-primary-dark border border-primary-lighter font-black px-3 py-1 rounded-lg text-xs tracking-widest shadow-sm">
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