import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaMapMarkerAlt, FaStar, FaClock, FaBus, FaPhoneAlt, FaCheckCircle } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

export default function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/buses/search/${id}`);
        setBus(res.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchBus();
  }, [id]);

  const handleSeatClick = (seatObj) => {
    const bookedSeats = bus?.bookedSeats || [];
    if (bookedSeats.includes(seatObj.id)) return;
    setSelectedSeats(prev => prev.includes(seatObj.id) ? prev.filter(s => s !== seatObj.id) : [...prev, seatObj.id]);
  };

  const handleProceed = () => {
    const token = localStorage.getItem('token');
    if (!token) { window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); return; }
    sessionStorage.setItem(`selected_seats_${id}`, JSON.stringify(selectedSeats));
    navigate(`/checkout/${id}`, { state: { bus, selectedSeats } });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: '#e2e8f0', borderTopColor: '#2dd4bf' }} />
        <p className="font-semibold text-sm animate-pulse" style={{ color: '#2dd4bf' }}>Loading bus details...</p>
      </div>
    </div>
  );

  if (!bus) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <h2 className="text-xl font-black mb-2" style={{ color: '#1a202c' }}>Bus Not Found</h2>
        <p className="text-sm mb-4" style={{ color: '#718096' }}>We couldn't find the bus you're looking for.</p>
        <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-xl text-sm text-white font-bold btn-primary">Go Home</button>
      </div>
    </div>
  );

  const bookedSeats = bus.bookedSeats || [];
  const stoppages = bus.stoppages || [
    ...(bus.pickupPoints || []).map(p => ({ stopName: p.location || p.point || 'Pickup Point', arrivalTime: p.time || bus.departureTime })),
    ...(bus.dropPoints || []).map(d => ({ stopName: d.location || d.point || 'Drop Point', arrivalTime: d.time || bus.arrivalTime }))
  ];

  const seatLayout = Array.from({ length: 60 }, (_, i) => {
    const rowNumber = Math.floor(i / 3) + 1;
    const colLetter = ['A', 'B', 'C'][i % 3];
    return { id: `${rowNumber}${colLetter}` };
  });
  const lowerDeck = seatLayout.slice(0, 30);
  const upperDeck = seatLayout.slice(30, 60);

  return (
    <div className="min-h-screen pt-20 pb-6" style={{ background: '#ffffff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">

        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex-[1.5]">

          <div className="white-card overflow-hidden mb-5">
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #2dd4bf, rgba(45,212,191,0.3))' }} />
            <div className="p-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-black mb-1" style={{ color: '#1a202c' }}>{bus.operatorName}</h1>
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#2dd4bf' }}>
                    <FaBus className="w-3.5 h-3.5" /> {bus.busName} • {bus.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 font-black text-base mb-0.5" style={{ color: '#1a202c' }}>
                    <FaStar style={{ color: '#f59e0b' }} className="w-4 h-4" /> {bus.rating?.toFixed(1) || '4.5'}
                  </div>
                  <p className="text-xs font-medium" style={{ color: '#a0aec0' }}>({bus.reviews || 120} Reviews)</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Route */}
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
                <div className="text-center w-1/3">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#a0aec0' }}>Departure</p>
                  <p className="text-xl font-black" style={{ color: '#1a202c' }}>{bus.departureTime}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#718096' }}>{bus.from}</p>
                </div>
                <div className="w-1/3 flex flex-col items-center justify-center relative">
                  <div className="w-full border-t-2 border-dashed absolute top-1/2 -translate-y-1/2" style={{ borderColor: 'rgba(45,212,191,0.3)' }} />
                  <div className="z-10 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold"
                    style={{ background: '#ffffff', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}>
                    <FaClock className="w-2.5 h-2.5" /> {bus.duration}
                  </div>
                </div>
                <div className="text-center w-1/3">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#a0aec0' }}>Arrival</p>
                  <p className="text-xl font-black" style={{ color: '#1a202c' }}>{bus.arrivalTime}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#718096' }}>{bus.to}</p>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #f1f5f9' }}>
                  <h3 className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: '#1a202c' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                      <FaPhoneAlt className="w-2.5 h-2.5" style={{ color: '#2dd4bf' }} />
                    </div>
                    Driver Info
                  </h3>
                  <div className="space-y-2 text-sm" style={{ color: '#4a5568' }}>
                    <p className="flex justify-between"><span style={{ color: '#a0aec0' }}>Name</span><span className="font-semibold">{bus.driver?.name || 'Assigned Before Trip'}</span></p>
                    <p className="flex justify-between"><span style={{ color: '#a0aec0' }}>Contact</span><span className="font-semibold">{bus.driver?.contact || '+91 - Available later'}</span></p>
                    <p className="flex justify-between pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
                      <span style={{ color: '#a0aec0' }}>Coach</span><span className="font-semibold">{bus.coachInfo || 'Premium AC Sleeper'}</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #f1f5f9' }}>
                  <h3 className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: '#1a202c' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                      <FaMapMarkerAlt className="w-2.5 h-2.5" style={{ color: '#2dd4bf' }} />
                    </div>
                    Points
                  </h3>
                  <div className="space-y-2 text-sm" style={{ color: '#4a5568' }}>
                    <p className="flex justify-between"><span style={{ color: '#a0aec0' }}>Pickup</span><span className="font-semibold truncate ml-2 max-w-[120px]">{bus.pickupPoints?.[0]?.location || bus.pickupPoints?.[0]?.point || bus.from}</span></p>
                    <p className="flex justify-between"><span style={{ color: '#a0aec0' }}>Drop</span><span className="font-semibold truncate ml-2 max-w-[120px]">{bus.dropPoints?.[0]?.location || bus.dropPoints?.[0]?.point || bus.to}</span></p>
                    <p className="flex justify-between pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
                      <span style={{ color: '#a0aec0' }}>Offer</span><span className="font-semibold" style={{ color: '#2dd4bf' }}>{bus.offer || 'Free water bottle'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-black text-sm mb-3" style={{ color: '#1a202c' }}>Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {(bus.facilities || ['WiFi', 'Charging Point', 'Blankets', 'Water Bottle']).map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
                      style={{ background: 'rgba(45,212,191,0.08)', color: '#0f766e', border: '1px solid rgba(45,212,191,0.2)' }}>
                      <FaCheckCircle className="w-3 h-3" style={{ color: '#2dd4bf' }} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stoppages */}
          <div className="white-card overflow-hidden mb-5">
            <div className="p-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h3 className="font-black text-base flex items-center gap-2" style={{ color: '#1a202c' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                  <FaMapMarkerAlt className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
                </div>
                Route Stoppages
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4 pl-4 relative">
                <div className="absolute top-1.5 bottom-1.5 left-[21px] w-0.5" style={{ background: 'rgba(45,212,191,0.2)' }} />
                {stoppages.map((stop, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute w-3 h-3 rounded-full -left-1.5 top-1 border-2 border-white shadow-sm z-10"
                      style={{ background: idx === 0 || idx === stoppages.length - 1 ? '#2dd4bf' : 'rgba(45,212,191,0.3)' }} />
                    <h4 className="font-black text-sm" style={{ color: '#1a202c' }}>{stop.stopName}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#a0aec0' }}>Arrival: {stop.arrivalTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Seat Selection */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1">
          <div className="white-card p-5 sticky top-24" style={{ boxShadow: '0 8px 32px rgba(45,212,191,0.08)' }}>
            <h2 className="text-lg font-black mb-4" style={{ color: '#1a202c' }}>Select Your Seats</h2>

            <div className="flex items-center justify-center gap-4 mb-5 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0' }} />
                <span style={{ color: '#718096' }}>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md" style={{ background: '#2dd4bf' }} />
                <span style={{ color: '#1a202c' }}>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md" style={{ background: '#e2e8f0' }} />
                <span style={{ color: '#a0aec0' }}>Booked</span>
              </div>
            </div>

            <div className="flex flex-row justify-center gap-4 mb-5">
              {[{ label: 'Lower Deck', seats: lowerDeck }, { label: 'Upper Deck', seats: upperDeck }].map(({ label, seats }) => (
                <div key={label} className="flex-1 max-w-[140px] rounded-2xl p-3"
                  style={{ background: '#fafafa', border: '1px solid #f1f5f9' }}>
                  <h4 className="text-center font-black mb-4 text-[9px] tracking-[0.2em] uppercase" style={{ color: '#a0aec0' }}>{label}</h4>
                  <div className="grid grid-cols-[auto_auto_1rem_auto] gap-y-2 gap-x-1.5 w-max mx-auto">
                    {seats.map((seat, index) => {
                      const isBooked = bookedSeats.includes(seat.id);
                      const isSelected = selectedSeats.includes(seat.id);
                      const isAisle = index % 3 === 1;
                      return (
                        <React.Fragment key={seat.id}>
                          <button disabled={isBooked} onClick={() => handleSeatClick(seat)}
                            className="w-7 h-10 rounded-md font-black text-[9px] transition-all flex items-center justify-center"
                            style={{
                              background: isBooked ? '#f1f5f9' : isSelected ? '#2dd4bf' : '#ffffff',
                              color: isBooked ? '#cbd5e0' : isSelected ? '#ffffff' : '#4a5568',
                              border: isBooked ? 'none' : isSelected ? 'none' : '1.5px solid #e2e8f0',
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              opacity: isBooked ? 0.6 : 1,
                              boxShadow: isSelected ? '0 2px 8px rgba(45,212,191,0.35)' : 'none',
                            }}
                          >{seat.id}</button>
                          {isAisle && <div className="w-3" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mb-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#a0aec0' }}>Selected ({selectedSeats.length})</p>
                  <p className="text-sm font-black truncate max-w-[120px]" style={{ color: '#1a202c' }}>{selectedSeats.join(', ') || 'None'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#a0aec0' }}>Total</p>
                  <p className="text-2xl font-black flex items-center justify-end" style={{ color: '#2dd4bf' }}>
                    <FaRupeeSign className="w-4 h-4 mr-0.5" />
                    {selectedSeats.length * bus.price}
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={selectedSeats.length > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedSeats.length > 0 ? { scale: 0.98 } : {}}
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
              className="w-full text-white py-4 rounded-xl font-black text-sm btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              Proceed To Checkout
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
