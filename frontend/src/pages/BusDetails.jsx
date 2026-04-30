import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaMapMarkerAlt, FaStar, FaClock, FaBus, FaPhoneAlt, FaCheckCircle } from 'react-icons/fa';

export default function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/buses/${id}`);
        setBus(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, [id]);

  const handleSeatClick = (seatObj) => {
    if (bus.bookedSeats.includes(seatObj.id)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatObj.id) 
        ? prev.filter(s => s !== seatObj.id) 
        : [...prev, seatObj.id]
    );
  };

  const handleProceed = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login strictly before booking seats!");
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
      return;
    }

    navigate(`/checkout/${id}`, { state: { bus, selectedSeats } });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: '#f8bbd0', borderTopColor: 'transparent' }} />
        <p className="font-black text-base animate-pulse" style={{ color: '#f48fb1' }}>Loading bus details...</p>
      </div>
    </div>
  );

  if (!bus) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="text-center">
        <h2 className="text-xl font-black mb-2" style={{ color: '#4a0028' }}>Bus Not Found</h2>
        <p className="text-sm" style={{ color: '#ad1457' }}>We couldn't find the bus you're looking for.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 rounded-xl text-sm text-white font-bold" style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>Go Home</button>
      </div>
    </div>
  );

  // Generate 60 Mock Seats for visual 2x1 Sleeper grid
  const seatLayout = Array.from({ length: 60 }, (_, i) => {
    const rowNumber = Math.floor(i / 3) + 1;
    const colNumber = i % 3;
    const colLetter = ['A', 'B', 'C'][colNumber];
    return { id: `${rowNumber}${colLetter}` };
  });

  const lowerDeck = seatLayout.slice(0, 30);
  const upperDeck = seatLayout.slice(30, 60);

  return (
    <div className="min-h-screen pt-20 pb-6" style={{ background: '#ffffff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left: Stopages & Details */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex-[1.5]">
          
          <div className="rounded-3xl shadow-xl overflow-hidden mb-5"
               style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(248,187,208,0.5)', boxShadow: '0 15px 40px rgba(194,24,91,0.08)' }}>
            
            <div className="p-4 md:p-5" style={{ background: 'linear-gradient(135deg, rgba(24ce,228,236,0.5) 0%, rgba(255,255,255,0) 100%)', borderBottom: '1.5px solid #fce4ec' }}>
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1" style={{ color: '#4a0028' }}>{bus.operatorName}</h1>
                  <p className="text-base font-bold flex items-center gap-1.5" style={{ color: '#c2185b' }}>
                    <FaBus className="w-3.5 h-3.5" /> {bus.busName} • {bus.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 font-black text-lg mb-0.5" style={{ color: '#4a0028' }}>
                    <FaStar style={{ color: '#f59e0b' }} className="w-4 h-4 mb-0.5" /> {bus.rating?.toFixed(1) || '4.5'}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f48fb1' }}>({bus.reviews || 120} Reviews)</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5 space-y-5">
              {/* Route Summary Graphic */}
              <div className="flex items-center justify-between p-4 rounded-2xl relative" style={{ background: '#fff0f5', border: '1.5px solid #fce4ec' }}>
                <div className="text-center w-1/3">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#f48fb1' }}>Departure</p>
                  <p className="text-xl md:text-2xl font-black leading-none" style={{ color: '#4a0028' }}>{bus.departureTime}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#ad1457' }}>{bus.from}</p>
                </div>
                
                <div className="w-1/3 flex flex-col items-center justify-center relative">
                  <div className="w-full h-1 border-t-2 border-dashed absolute top-1/2 -translate-y-1/2" style={{ borderColor: '#f8bbd0' }}></div>
                  <div className="z-10 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" style={{ background: '#ffffff', color: '#c2185b', border: '1.5px solid #f8bbd0' }}>
                    <FaClock className="w-2.5 h-2.5" /> {bus.duration}
                  </div>
                </div>

                <div className="text-center w-1/3">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#f48fb1' }}>Arrival</p>
                  <p className="text-xl md:text-2xl font-black leading-none" style={{ color: '#4a0028' }}>{bus.arrivalTime}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#ad1457' }}>{bus.to}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #fce4ec' }}>
                  <h3 className="font-black text-sm mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: '#4a0028' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#fce4ec', color: '#c2185b' }}><FaPhoneAlt className="w-2.5 h-2.5" /></div>
                    Driver Info
                  </h3>
                  <div className="space-y-2 font-semibold text-[13px]" style={{ color: '#880e4f' }}>
                    <p className="flex justify-between"><span style={{ color: '#f48fb1' }}>Name</span> <span>{bus.driver?.name || 'Assigned Before Trip'}</span></p>
                    <p className="flex justify-between"><span style={{ color: '#f48fb1' }}>Contact</span> <span>{bus.driver?.contact || '+91 - Available later'}</span></p>
                    <p className="flex justify-between pt-1.5 mt-1.5 border-t" style={{ borderColor: '#fce4ec' }}>
                      <span style={{ color: '#f48fb1' }}>Coach</span> <span>{bus.coachInfo || 'Premium AC Sleeper'}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #fce4ec' }}>
                   <h3 className="font-black text-sm mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: '#4a0028' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#fce4ec', color: '#c2185b' }}><FaMapMarkerAlt className="w-2.5 h-2.5" /></div>
                    Points
                  </h3>
                  <div className="space-y-2 font-semibold text-[13px]" style={{ color: '#880e4f' }}>
                    <p className="flex justify-between"><span style={{ color: '#f48fb1' }}>Pickup</span> <span className="text-right truncate ml-2 max-w-[120px]">{bus.pickupPoints?.[0]?.point || bus.from}</span></p>
                    <p className="flex justify-between"><span style={{ color: '#f48fb1' }}>Drop</span> <span className="text-right truncate ml-2 max-w-[120px]">{bus.dropPoints?.[0]?.point || bus.to}</span></p>
                    <p className="flex justify-between pt-1.5 mt-1.5 border-t" style={{ borderColor: '#fce4ec' }}>
                      <span style={{ color: '#f48fb1' }}>Offer</span> <span className="text-right" style={{ color: '#c2185b' }}>{bus.offer || 'Free water bottle'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-sm uppercase tracking-wide mb-3" style={{ color: '#4a0028' }}>Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {(bus.facilities || ['WiFi', 'Charging Point', 'Blankets', 'Water Bottle']).map((facility, index) => (
                    <span key={index} className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold shadow-sm"
                          style={{ background: '#ffffff', color: '#c2185b', border: '1px solid #fce4ec' }}>
                      <FaCheckCircle className="w-2.5 h-2.5" style={{ color: '#f48fb1' }} /> {facility}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="rounded-3xl shadow-xl overflow-hidden mb-5"
               style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(248,187,208,0.5)' }}>
             <div className="p-4 md:p-5" style={{ borderBottom: '1.5px solid #fce4ec' }}>
              <h3 className="font-black text-lg flex items-center gap-2 uppercase tracking-wide" style={{ color: '#4a0028' }}>
                 <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fce4ec', color: '#c2185b' }}>
                    <FaMapMarkerAlt className="w-3.5 h-3.5" />
                 </div>
                 Route Stoppages
              </h3>
            </div>
            <div className="p-4 md:p-5">
              <div className="space-y-4 pl-4 relative">
                <div className="absolute top-1.5 bottom-1.5 left-[21px] w-0.5" style={{ background: '#fce4ec' }}></div>
                {bus.stoppages.map((stop, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute w-3 h-3 rounded-full -left-1.5 top-1 border-2 border-white shadow-sm z-10"
                         style={{ background: idx === 0 || idx === bus.stoppages.length - 1 ? '#c2185b' : '#f8bbd0' }}></div>
                    <div>
                      <h4 className="font-black text-[15px] leading-none" style={{ color: '#4a0028' }}>{stop.stopName}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f48fb1' }}>Arrival: {stop.arrivalTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Seat Selection */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1">
          <div className="rounded-3xl shadow-xl p-5 md:p-6 sticky top-24"
               style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(248,187,208,0.5)', boxShadow: '0 15px 40px rgba(194,24,91,0.08)' }}>
            
            <h2 className="text-xl font-black mb-5" style={{ color: '#4a0028' }}>Select Your Seats</h2>
            
            <div className="flex items-center justify-center gap-4 mb-6 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md" style={{ background: '#ffffff', border: '1px solid #f8bbd0' }}></div> <span style={{ color: '#ad1457' }}>Available</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md shadow-inner" style={{ background: '#e91e8c' }}></div> <span style={{ color: '#4a0028' }}>Selected</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md opacity-50" style={{ background: '#e2e8f0' }}></div> <span style={{ color: '#94a3b8' }}>Booked</span></div>
            </div>

            <div className="flex flex-row justify-center gap-4 mb-6">
              {/* Lower Deck */}
              <div className="flex-1 max-w-[140px] rounded-2xl p-3 relative" style={{ background: '#ffffff', border: '1px solid #fce4ec' }}>
                <h4 className="text-center font-black mb-5 text-[9px] tracking-[0.2em] uppercase" style={{ color: '#f48fb1' }}>Lower Deck</h4>
                <div className="absolute right-3 top-[32px] w-4 h-4 rounded-full flex items-center justify-center opacity-70" style={{ border: '1.5px solid #f8bbd0' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ border: '1px solid #f8bbd0' }}></div>
                </div>
                
                <div className="grid grid-cols-[auto_auto_1rem_auto] gap-y-2 gap-x-1.5 w-max mx-auto">
                  {lowerDeck.map((seat, index) => {
                    const isBooked = bus.bookedSeats.includes(seat.id);
                    const isSelected = selectedSeats.includes(seat.id);
                    const isAisle = index % 3 === 1;

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-7 h-10 rounded-md font-black text-[9px] transition-all flex items-center justify-center relative overflow-hidden
                            ${isBooked 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
                              : isSelected 
                                ? 'text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:-translate-y-0.5'
                            }
                          `}
                          style={{
                            ...(isSelected ? { background: '#e91e8c' } : !isBooked ? { border: '1px solid #f8bbd0' } : {})
                          }}
                        >
                          <div className={`absolute top-1 w-4 h-1 rounded-[1px] ${isSelected ? 'bg-black/20' : isBooked ? 'bg-slate-200' : 'bg-pink-100'}`}></div>
                          <span className="mt-1.5 scale-90">{seat.id}</span>
                        </button>
                        {isAisle && <div className="w-3"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Upper Deck */}
              <div className="flex-1 max-w-[140px] rounded-2xl p-3 relative" style={{ background: '#ffffff', border: '1px solid #fce4ec' }}>
                <h4 className="text-center font-black mb-5 text-[9px] tracking-[0.2em] uppercase" style={{ color: '#f48fb1' }}>Upper Deck</h4>
                <div className="grid grid-cols-[auto_auto_1rem_auto] gap-y-2 gap-x-1.5 w-max mx-auto mt-5">
                  {upperDeck.map((seat, index) => {
                    const isBooked = bus.bookedSeats.includes(seat.id);
                    const isSelected = selectedSeats.includes(seat.id);
                    const isAisle = index % 3 === 1;

                    return (
                      <React.Fragment key={seat.id}>
                         <button
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-7 h-10 rounded-md font-black text-[9px] transition-all flex items-center justify-center relative overflow-hidden
                            ${isBooked 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
                              : isSelected 
                                ? 'text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:-translate-y-0.5'
                            }
                          `}
                          style={{
                            ...(isSelected ? { background: '#e91e8c' } : !isBooked ? { border: '1px solid #f8bbd0' } : {})
                          }}
                        >
                          <div className={`absolute top-1 w-4 h-1 rounded-[1px] ${isSelected ? 'bg-black/20' : isBooked ? 'bg-slate-200' : 'bg-pink-100'}`}></div>
                          <span className="mt-1.5 scale-90">{seat.id}</span>
                        </button>
                        {isAisle && <div className="w-3"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed mb-5" style={{ borderColor: '#f8bbd0' }}>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#f48fb1' }}>Selected ({selectedSeats.length})</p>
                  <p className="text-base font-black truncate max-w-[120px]" style={{ color: '#4a0028' }}>{selectedSeats.join(', ') || 'None'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#f48fb1' }}>Total Amount</p>
                  <p className="text-2xl font-black flex items-center justify-end leading-none" style={{ color: '#c2185b' }}>
                    <FaRupeeSign className="w-4 h-4 mr-0.5 opacity-80" />
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
              className="w-full text-white py-4 rounded-xl font-black text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-md"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}
            >
              Proceed To Checkout
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
