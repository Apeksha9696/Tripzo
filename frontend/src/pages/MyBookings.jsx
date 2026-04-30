import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaMapMarkerAlt, FaRegCalendarAlt, FaRegClock, FaTicketAlt, FaBus, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/');
          window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
          return;
        }
        setError(err.response?.data?.error || 'Failed to fetch your bookings. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: '#f8bbd0', borderTopColor: 'transparent' }} />
        <p className="font-black text-base animate-pulse" style={{ color: '#f48fb1' }}>Loading your trips...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ background: '#ffffff' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#4a0028' }}>My Trips</h1>
          <p className="text-lg font-bold" style={{ color: '#ad1457' }}>View all your past and upcoming bookings</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl text-center mb-6 font-bold text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            {error}
          </motion.div>
        )}

        {bookings.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-12 text-center shadow-xl"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(248,187,208,0.5)', boxShadow: '0 15px 40px rgba(194,24,91,0.08)' }}>
            <div className="w-20 h-20 rounded-full flex justify-center items-center mx-auto mb-5 shadow-sm"
              style={{ background: '#fff0f5', border: '1.5px solid #f8bbd0' }}>
              <FaTicketAlt className="w-8 h-8" style={{ color: '#c2185b' }} />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: '#4a0028' }}>No bookings yet!</h3>
            <p className="mb-6 font-semibold text-base" style={{ color: '#94a3b8' }}>Looks like you haven't made any bus bookings yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl font-black text-white uppercase tracking-widest text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}
            >
              Search for Buses
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, idx) => {
              const bus = booking.bus;
              const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <motion.div key={booking._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="rounded-3xl overflow-hidden relative transition-all duration-300 group shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(248,187,208,0.5)', boxShadow: '0 15px 40px rgba(194,24,91,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f48fb1'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(194,24,91,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(248,187,208,0.5)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(194,24,91,0.08)'; }}
                >
                  <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #c2185b, #f48fb1)' }} />

                  <div className="absolute top-1.5 right-0 font-black px-4 py-1.5 rounded-bl-xl text-[9px] uppercase tracking-widest shadow-sm"
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderTop: 'none', borderRight: 'none' }}>
                    <span className="flex items-center gap-1"><FaCheckCircle className="w-2.5 h-2.5"/> {booking.status}</span>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6"
                      style={{ borderBottom: '1.5px solid #fce4ec' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #4a0028, #880e4f)' }}>
                            {bus ? bus.operatorName : 'Unknown Operator'}
                          </span>
                          <span className="text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest"
                            style={{ background: '#fff0f5', color: '#c2185b', border: '1px solid #f8bbd0' }}>
                            <span className="flex items-center gap-1"><FaBus className="w-2.5 h-2.5"/> {bus ? bus.busType : 'Bus'}</span>
                          </span>
                        </div>
                        {bus ? (
                          <div className="flex items-center text-2xl font-black gap-3" style={{ color: '#4a0028' }}>
                            {bus.from}
                            <div className="flex items-center text-[#f8bbd0]">
                               ------ <FaMapMarkerAlt className="w-4 h-4 mx-1" style={{ color: '#c2185b' }} /> ------
                            </div>
                            {bus.to}
                          </div>
                        ) : (
                          <div className="text-lg italic font-bold" style={{ color: '#94a3b8' }}>Bus details unavailable</div>
                        )}
                      </div>

                      {bus && (
                        <div className="flex-1 flex gap-8 items-center pl-6 pt-3 md:pt-0"
                          style={{ borderLeft: '1.5px solid #fce4ec' }}>
                          <div>
                            <p className="text-[9px] font-black mb-1.5 flex items-center gap-1 uppercase tracking-widest" style={{ color: '#f48fb1' }}>
                              <FaRegCalendarAlt className="w-3 h-3" /> Date
                            </p>
                            <p className="font-black text-base" style={{ color: '#4a0028' }}>{bus.date}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black mb-1.5 flex items-center gap-1 uppercase tracking-widest" style={{ color: '#f48fb1' }}>
                              <FaRegClock className="w-3 h-3" /> Time
                            </p>
                            <p className="font-black text-base" style={{ color: '#4a0028' }}>{bus.departureTime}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 gap-5">
                      <div className="flex gap-10">
                        <div>
                          <p className="text-[9px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#f48fb1' }}>Seats Booked</p>
                          <p className="font-black text-base" style={{ color: '#4a0028' }}>{booking.seats.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#f48fb1' }}>Booked On</p>
                          <p className="font-bold text-base" style={{ color: '#ad1457' }}>{bookingDate}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#f48fb1' }}>Total Paid</p>
                        <p className="text-2xl font-black flex items-center justify-end leading-none" style={{ color: '#c2185b' }}>
                          <FaRupeeSign className="w-5 h-5 mr-0.5" /> {booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl p-5" style={{ background: '#ffffff', border: '1.5px solid #fce4ec' }}>
                      {booking.bus?.currentLocation ? (
                        <div className="space-y-2.5">
                          <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#4a0028' }}><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live bus location</p>
                          <p className="font-bold text-xs" style={{ color: '#ad1457' }}>Lat: {booking.bus.currentLocation.lat.toFixed(4)}, Lng: {booking.bus.currentLocation.lng.toFixed(4)}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#f48fb1' }}>Last updated: {new Date(booking.bus.currentLocation.timestamp).toLocaleTimeString()}</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/tracking?busId=${booking.bus._id}`)}
                            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-black text-white text-[10px] uppercase tracking-widest transition-all shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}
                          >
                            Track this bus
                          </motion.button>
                        </div>
                      ) : (
                        <div className="font-bold text-xs" style={{ color: '#ad1457' }}>
                          Live location not available yet for this booked bus.
                        </div>
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
