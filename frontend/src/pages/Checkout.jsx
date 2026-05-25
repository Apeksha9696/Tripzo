import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRupeeSign, FaRegCreditCard, FaRegCalendarAlt, FaRegClock, FaCheckCircle, FaArrowLeft, FaBus, FaTicketAlt, FaUser } from 'react-icons/fa';
import { FiShield } from 'react-icons/fi';

export default function Checkout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Core state containing bus and selected seats
  const [bus, setBus] = useState(location.state?.bus || null);
  const [selectedSeats, setSelectedSeats] = useState(location.state?.selectedSeats || []);
  const [loadingBus, setLoadingBus] = useState(!location.state?.bus);

  // Form and flow states
  const [step, setStep] = useState('review'); // 'review' | 'passengers' | 'payment'
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // 1. Refresh Recovery Hook
  useEffect(() => {
    const restoreState = async () => {
      // If we don't have location state, attempt recovery
      if (!bus || selectedSeats.length === 0) {
        try {
          console.log('[Checkout] State missing. Attempting state recovery for bus:', id);
          const storedSeatsStr = sessionStorage.getItem(`selected_seats_${id}`);
          const seats = storedSeatsStr ? JSON.parse(storedSeatsStr) : [];
          
          if (seats.length === 0) {
            console.warn('[Checkout] No seats found in sessionStorage. Recovery aborted.');
            setLoadingBus(false);
            return;
          }
          
          setSelectedSeats(seats);
          console.log('[Checkout] Recovered selected seats:', seats);

          // Fetch bus details from the public search/:id backend endpoint
          const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/buses/search/${id}`);
          if (res.data) {
            setBus(res.data);
            console.log('[Checkout] Recovered bus details successfully:', res.data.operatorName);
          }
        } catch (err) {
          console.error('[Checkout] Failed to recover bus/seats state:', err.message);
        } finally {
          setLoadingBus(false);
        }
      } else {
        setLoadingBus(false);
      }
    };
    restoreState();
  }, [id, bus, selectedSeats.length]);

  // 2. Initialize passenger entries once seats are loaded
  useEffect(() => {
    if (selectedSeats.length > 0 && passengers.length === 0) {
      setPassengers(
        selectedSeats.map((seat) => ({
          seat,
          name: '',
          age: '',
          gender: 'Male'
        }))
      );
    }
  }, [selectedSeats, passengers.length]);

  // Handle passenger input changes
  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Validate passenger inputs before going to payment
  const handleProceedToPayment = () => {
    setValidationError('');
    
    // Check if any passenger fields are empty or invalid
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        setValidationError(`Please enter the name for passenger on seat ${p.seat}`);
        return;
      }
      if (!p.age || isNaN(p.age) || Number(p.age) <= 0 || Number(p.age) > 120) {
        setValidationError(`Please enter a valid age (1-120) for passenger on seat ${p.seat}`);
        return;
      }
    }
    
    // Check authentication before advancing
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
      return;
    }

    setStep('payment');
  };

  // Submit payment & book tickets in DB
  const handlePayment = async () => {
    setLoading(true);
    setValidationError('');
    
    setTimeout(async () => {
      const token = localStorage.getItem('token');
      try {
        // Post booking with passenger details (backend ignores extra parameters, but they are tracked locally on state)
        await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/bookings`,
          { 
            busId: bus._id, 
            seats: selectedSeats,
            passengers // include passenger details for future logs or audits
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Clean up session storage on success
        sessionStorage.removeItem(`selected_seats_${id}`);
        setSuccess(true);
      } catch (err) {
        alert(err.response?.data?.error || 'Booking Reservation Failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  // Loading spinner during state recovery
  if (loadingBus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#e2e8f0', borderTopColor: '#2dd4bf' }} />
          <p className="font-semibold text-sm animate-pulse text-teal-500">Recovering your booking session...</p>
        </div>
      </div>
    );
  }

  // Invalid state handler (e.g. state loss without session storage fallback)
  if (!bus || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="white-card p-8 text-center max-w-sm w-full">
          <h2 className="text-xl font-black mb-2" style={{ color: '#1a202c' }}>Invalid Booking Request</h2>
          <p className="text-sm mb-4" style={{ color: '#718096' }}>Please return to search, select a bus, and choose your seats first.</p>
          <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl text-white text-sm font-bold btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  const totalAmount = selectedSeats.length * bus.price;
  const inputCls = "w-full px-4 py-3 rounded-xl font-medium text-sm outline-none transition-all input-field border border-slate-200 focus:border-teal-500";

  // Ticket Confirmation view
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }}
          className="white-card max-w-md w-full text-center p-8 border border-slate-100 shadow-xl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="mb-5 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
              <FaCheckCircle className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-black mb-1" style={{ color: '#1a202c' }}>Booking Confirmed!</h1>
          <p className="mb-6 text-sm text-slate-500">Your ticket has been booked successfully. Have a great journey!</p>
          
          <div className="rounded-xl p-5 mb-6 text-left space-y-3.5" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-teal-100">
              <span className="text-xs font-semibold text-slate-500">Booking ID</span>
              <span className="font-black text-sm text-slate-800">TRK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Route & Bus</p>
              <p className="font-black text-sm text-slate-800">{bus.operatorName}</p>
              <p className="text-xs text-slate-500 font-semibold">{bus.from} &rarr; {bus.to} • {bus.departureTime}</p>
            </div>
            
            <div className="space-y-1.5 pt-2 border-t border-dashed border-teal-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Passengers ({passengers.length})</p>
              <div className="space-y-1">
                {passengers.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-700">
                    <span className="font-bold">Seat {p.seat}: {p.name}</span>
                    <span className="font-semibold text-slate-500">{p.age} yrs • {p.gender}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-teal-100">
              <span className="text-xs font-semibold text-slate-500">Amount Paid</span>
              <span className="font-black text-base flex items-center text-teal-600"><FaRupeeSign className="w-3.5 h-3.5 mr-0.5" />{totalAmount}</span>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/')}
            className="w-full text-white px-8 py-3.5 rounded-xl font-black text-sm btn-primary shadow-lg shadow-teal-500/25">
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 font-sans">
      <div className="max-w-lg mx-auto px-4 sm:px-6">

        {/* Dynamic Step Header */}
        <div className="flex items-center mb-6 relative justify-center">
          {step !== 'review' && (
            <button 
              onClick={() => setStep(step === 'payment' ? 'passengers' : 'review')}
              className="absolute left-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            >
              <FaArrowLeft className="w-3 h-3" />
            </button>
          )}
          <h2 className="text-2xl font-black text-slate-800">
            {step === 'review' && 'Review Booking'}
            {step === 'passengers' && 'Passenger Details'}
            {step === 'payment' && 'Payment'}
          </h2>
        </div>

        {/* Global Validation Alert */}
        {validationError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-5 border border-red-200 font-semibold"
          >
            {validationError}
          </motion.div>
        )}

        {/* STEP 1: REVIEW BOOKING DETAILS */}
        {step === 'review' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="white-card overflow-hidden mb-6 border border-slate-200 shadow-sm">
              <div className="p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FaTicketAlt className="w-4 h-4 text-white opacity-70" />
                  <span className="text-[10px] font-bold text-white opacity-70 uppercase tracking-widest">E-Ticket Summary</span>
                </div>
                <h1 className="text-xl font-black text-white mb-0.5">{bus.operatorName}</h1>
                <p className="text-xs font-semibold text-teal-100">{bus.busName} • {bus.category || bus.busType}</p>

                <div className="flex items-center justify-between mt-5 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{bus.departureTime}</p>
                    <p className="text-[10px] font-bold mt-0.5 text-teal-100 uppercase tracking-wider">{bus.from}</p>
                  </div>
                  <div className="flex-1 px-4 flex items-center justify-center relative">
                    <div className="w-full border-t border-dashed border-white/20" />
                    <div className="px-2.5 py-0.5 relative z-10 rounded-full text-[9px] font-bold flex items-center gap-1 text-white"
                      style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <FaRegClock className="w-2.5 h-2.5" /> {bus.duration || '4h'}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{bus.arrivalTime}</p>
                    <p className="text-[10px] font-bold mt-0.5 text-teal-100 uppercase tracking-wider">{bus.to}</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black mb-1 flex items-center gap-1 text-slate-400 uppercase tracking-widest">
                      <FaRegCalendarAlt className="w-2.5 h-2.5 text-teal-500" /> Date
                    </p>
                    <p className="font-black text-sm text-slate-800">
                      {new Date(bus.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black mb-1 text-slate-400 uppercase tracking-widest">Seats</p>
                    <p className="font-black text-sm text-slate-800 truncate">{selectedSeats.join(', ')}</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                    <span>Base Fare ({selectedSeats.length} × ₹{bus.price})</span>
                    <span className="text-slate-800">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                    <span>Taxes & Fees</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-700 border border-green-200">Inclusive</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <p className="text-lg font-black text-slate-800">Total Amount</p>
                    <p className="text-2xl font-black flex items-center text-teal-500">
                      <FaRupeeSign className="w-4 h-4 mr-0.5" />{totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) { 
                  window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); 
                  return; 
                }
                setStep('passengers');
              }}
              className="w-full text-white py-4 rounded-xl text-sm font-black btn-primary shadow-lg shadow-teal-500/25"
            >
              Proceed To Passenger Details
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: PASSENGER DETAILS FORM */}
        {step === 'passengers' && (
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
            <div className="space-y-4 mb-6">
              {passengers.map((passenger, idx) => (
                <div key={passenger.seat} className="white-card p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <FaUser className="w-3 h-3" />
                    </div>
                    <h3 className="font-black text-sm text-slate-800">Passenger {idx + 1} (Seat {passenger.seat})</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Jane Doe" 
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        className={inputCls} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Age</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="120"
                          placeholder="e.g. 25" 
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                          className={inputCls} 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Gender</label>
                        <select 
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          className={inputCls}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleProceedToPayment}
              className="w-full text-white py-4 rounded-xl text-sm font-black btn-primary shadow-lg shadow-teal-500/25"
            >
              Proceed To Payment
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: PAYMENT SCREEN */}
        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
            <div className="white-card p-5 border border-slate-200 shadow-sm mb-6">
              {/* Method selector */}
              <div className="flex gap-3 mb-5">
                {['card', 'upi'].map(method => (
                  <button 
                    key={method} 
                    onClick={() => setPaymentMethod(method)}
                    className="flex-1 py-3 px-3 rounded-xl flex flex-col items-center gap-1.5 font-bold text-sm transition-all border shadow-sm"
                    style={{
                      border: paymentMethod === method ? '2px solid #2dd4bf' : '1px solid #e2e8f0',
                      background: paymentMethod === method ? 'rgba(45,212,191,0.06)' : '#ffffff',
                      color: paymentMethod === method ? '#0f766e' : '#718096',
                    }}
                  >
                    {method === 'card' ? <FaRegCreditCard className="w-5 h-5 text-teal-500" /> : <span className="font-black text-base text-teal-500">UPI</span>}
                    {method === 'card' ? 'Credit / Debit Card' : 'UPI Payment'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4 mb-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className={inputCls} />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className={inputCls} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">CVV</label>
                        <input type="password" placeholder="***" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Name on Card</label>
                      <input type="text" placeholder="JOHN DOE" className={`${inputCls} uppercase`} />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4 mb-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">UPI ID</label>
                      <input type="text" placeholder="username@upi" className={inputCls} />
                    </div>
                    <div className="p-3.5 rounded-xl text-xs text-center font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
                      A payment request will be pushed to your UPI device for immediate approval.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                disabled={loading} onClick={handlePayment}
                className="w-full text-white py-4 rounded-xl text-sm font-black btn-primary disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing mock payment...
                  </span>
                ) : <>Pay ₹{totalAmount} & Book Ticket</>}
              </motion.button>

              <p className="text-[10px] font-bold text-center mt-4 flex items-center justify-center gap-1.5 text-slate-400 uppercase tracking-widest">
                <FiShield className="w-3.5 h-3.5 text-teal-500" /> 256-bit SSL Encrypted & Secure Connection
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
