import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaRegCalendarAlt, FaRegClock, FaTicketAlt, FaBus, FaCheckCircle } from 'react-icons/fa';
import { FiArrowRight, FiNavigation } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); return; }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, { headers: { Authorization: `Bearer ${token}` } });
        setBookings(res.data);
      } catch (err) {
        if (err.response?.status === 401) { navigate('/'); window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); return; }
        setError(err.response?.data?.error || 'Failed to fetch your bookings.');
      } finally { setLoading(false); }
    };
    fetchBookings();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: '#e2e8f0', borderTopColor: '#2dd4bf' }} />
        <p className="font-semibold text-sm animate-pulse" style={{ color: '#2dd4bf' }}>Loading your trips...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ background: '#ffffff' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 16px rgba(45,212,191,0.3)' }}>
            <FaTicketAlt className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#1a202c' }}>My Trips</h1>
          <p className="font-medium" style={{ color: '#718096' }}>View all your past and upcoming bookings</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 rounded-xl text-center mb-6 font-semibold text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            {error}
          </motion.div>
        )}

        {bookings.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="white-card p-12 text-center">
            <div className="w-20 h-20 rounded-2xl flex justify-center items-center mx-auto mb-5"
              style={{ background: 'rgba(45,212,191,0.08)' }}>
              <FaTicketAlt className="w-8 h-8" style={{ color: '#2dd4bf' }} />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: '#1a202c' }}>No bookings yet!</h3>
            <p className="mb-6 font-medium" style={{ color: '#718096' }}>Looks like you haven't made any bus bookings yet.</p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl font-black text-white text-sm btn-primary"
            >Search for Buses</motion.button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking, idx) => {
              const bus = booking.bus;
              const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <motion.div key={booking._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  className="white-card overflow-hidden"
                >
                  <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #2dd4bf, rgba(45,212,191,0.2))' }} />
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4"
                      style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white text-xs font-black px-3 py-1 rounded-full"
                            style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                            {bus ? bus.operatorName : 'Unknown Operator'}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                            style={{ background: 'rgba(45,212,191,0.08)', color: '#0f766e', border: '1px solid rgba(45,212,191,0.2)' }}>
                            <FaBus className="w-3 h-3" /> {bus ? bus.busType : 'Bus'}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                            <FaCheckCircle className="w-3 h-3" /> {booking.status}
                          </span>
                        </div>
                        {bus ? (
                          <div className="flex items-center gap-2 text-xl font-black" style={{ color: '#1a202c' }}>
                            {bus.from}
                            <FiArrowRight className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                            {bus.to}
                          </div>
                        ) : (
                          <p className="text-base italic font-medium" style={{ color: '#a0aec0' }}>Bus details unavailable</p>
                        )}
                      </div>
                      {bus && (
                        <div className="flex gap-6">
                          <div>
                            <p className="text-[10px] font-black mb-1 flex items-center gap-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>
                              <FaRegCalendarAlt className="w-3 h-3" /> Date
                            </p>
                            <p className="font-black text-sm" style={{ color: '#1a202c' }}>{bus.date}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black mb-1 flex items-center gap-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>
                              <FaRegClock className="w-3 h-3" /> Time
                            </p>
                            <p className="font-black text-sm" style={{ color: '#1a202c' }}>{bus.departureTime}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] font-black mb-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Seats</p>
                          <p className="font-black text-sm" style={{ color: '#1a202c' }}>{booking.seats.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black mb-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Booked On</p>
                          <p className="font-bold text-sm" style={{ color: '#718096' }}>{bookingDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black mb-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Total Paid</p>
                        <p className="text-xl font-black flex items-center justify-end" style={{ color: '#2dd4bf' }}>
                          <FaRupeeSign className="w-4 h-4 mr-0.5" /> {booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)' }}>
                      {booking.bus?.currentLocation ? (
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-1" style={{ color: '#1a202c' }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Live Location
                            </p>
                            <p className="font-medium text-xs" style={{ color: '#718096' }}>
                              Lat: {booking.bus.currentLocation.lat.toFixed(4)}, Lng: {booking.bus.currentLocation.lng.toFixed(4)}
                            </p>
                          </div>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => navigate(`/tracking?busId=${booking.bus._id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-white text-xs btn-primary"
                          >
                            <FiNavigation className="w-3.5 h-3.5" /> Track Bus
                          </motion.button>
                        </div>
                      ) : (
                        <p className="font-medium text-xs" style={{ color: '#a0aec0' }}>
                          Live location not available yet for this booked bus.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
