import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRupeeSign, FaRegCreditCard, FaRegCalendarAlt, FaRegClock, FaCheckCircle, FaArrowLeft, FaBus, FaTicketAlt } from 'react-icons/fa';
import { FiShield } from 'react-icons/fi';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.bus || !state.selectedSeats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
        <div className="white-card p-8 text-center max-w-sm w-full">
          <h2 className="text-xl font-black mb-2" style={{ color: '#1a202c' }}>Invalid Request</h2>
          <p className="text-sm mb-4" style={{ color: '#718096' }}>Please go back and select seats first.</p>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-xl text-white text-sm font-bold btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  const { bus, selectedSeats } = state;
  const [step, setStep] = useState('review');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [success, setSuccess] = useState(false);
  const totalAmount = selectedSeats.length * bus.price;

  const handlePayment = async () => {
    setLoading(true);
    setTimeout(async () => {
      const token = localStorage.getItem('token');
      try {
        await axios.post('http://localhost:5000/api/bookings', { busId: bus._id, seats: selectedSeats }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess(true);
      } catch (err) { alert(err.response?.data?.error || 'Booking Failed'); }
      finally { setLoading(false); }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }}
          className="white-card max-w-sm w-full text-center p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="mb-5 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
              <FaCheckCircle className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-black mb-2" style={{ color: '#1a202c' }}>Booking Confirmed!</h1>
          <p className="mb-6 text-sm" style={{ color: '#718096' }}>Your ticket has been booked successfully. Have a great journey!</p>
          <div className="rounded-xl p-4 mb-6 text-left" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold" style={{ color: '#718096' }}>Booking ID</span>
              <span className="font-black text-sm" style={{ color: '#1a202c' }}>TRK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold" style={{ color: '#718096' }}>Amount Paid</span>
              <span className="font-black text-sm flex items-center" style={{ color: '#2dd4bf' }}><FaRupeeSign className="w-3 h-3 mr-0.5" />{totalAmount}</span>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/')}
            className="w-full text-white px-8 py-3 rounded-xl font-black text-sm btn-primary">
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-xl font-medium text-sm outline-none transition-all input-field";

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ background: '#ffffff' }}>
      <div className="max-w-md mx-auto px-4 sm:px-6">

        {step === 'review' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-black text-center mb-5" style={{ color: '#1a202c' }}>Review Booking</h2>

            <div className="white-card overflow-hidden mb-5">
              {/* Ticket header */}
              <div className="p-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <FaTicketAlt className="w-4 h-4 text-white opacity-70" />
                  <span className="text-xs font-bold text-white opacity-70 uppercase tracking-widest">E-Ticket</span>
                </div>
                <h1 className="text-xl font-black text-white mb-1">{bus.operatorName}</h1>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{bus.busName} • {bus.category}</p>

                <div className="flex items-center justify-between mt-4 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{bus.departureTime}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{bus.from}</p>
                  </div>
                  <div className="flex-1 px-4 flex items-center justify-center relative">
                    <div className="w-full border-t border-dashed opacity-30" />
                    <div className="px-2 py-0.5 relative z-10 rounded-full text-[9px] font-bold flex items-center gap-1"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                      <FaRegClock className="w-2.5 h-2.5" /> {bus.duration}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{bus.arrivalTime}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{bus.to}</p>
                  </div>
                </div>
              </div>

              {/* Ticket body */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-4 p-4 rounded-xl"
                  style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.12)' }}>
                  <div>
                    <p className="text-[9px] font-black mb-1 flex items-center gap-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>
                      <FaRegCalendarAlt className="w-2.5 h-2.5" /> Date
                    </p>
                    <p className="font-black text-sm" style={{ color: '#1a202c' }}>
                      {new Date(bus.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black mb-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Seats</p>
                    <p className="font-black text-sm truncate" style={{ color: '#1a202c' }}>{selectedSeats.join(', ')}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium" style={{ color: '#718096' }}>Base Fare ({selectedSeats.length} × ₹{bus.price})</p>
                    <p className="font-black text-sm" style={{ color: '#1a202c' }}>₹{totalAmount}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium" style={{ color: '#718096' }}>Taxes & Fees</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Inclusive</span>
                  </div>
                  <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <p className="text-lg font-black" style={{ color: '#1a202c' }}>Total</p>
                    <p className="text-2xl font-black flex items-center" style={{ color: '#2dd4bf' }}>
                      <FaRupeeSign className="w-4 h-4 mr-0.5" />{totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) { window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' })); return; }
                setStep('payment');
              }}
              className="w-full text-white py-3.5 rounded-xl text-sm font-black btn-primary">
              Proceed To Payment
            </motion.button>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center mb-5 relative">
              <button onClick={() => setStep('review')}
                className="absolute left-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
                style={{ color: '#2dd4bf', border: '1.5px solid rgba(45,212,191,0.25)', background: 'rgba(45,212,191,0.06)' }}>
                <FaArrowLeft className="w-3.5 h-3.5" />
              </button>
              <h2 className="text-2xl font-black text-center w-full" style={{ color: '#1a202c' }}>Payment</h2>
            </div>

            <div className="white-card p-5">
              {/* Method tabs */}
              <div className="flex gap-3 mb-5">
                {['card', 'upi'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className="flex-1 py-3 px-3 rounded-xl flex flex-col items-center gap-1.5 font-bold text-sm transition-all"
                    style={{
                      border: paymentMethod === m ? '2px solid #2dd4bf' : '1.5px solid #e2e8f0',
                      background: paymentMethod === m ? 'rgba(45,212,191,0.06)' : '#ffffff',
                      color: paymentMethod === m ? '#0f766e' : '#718096',
                    }}>
                    {m === 'card' ? <FaRegCreditCard className="w-5 h-5" /> : <span className="font-black text-base">UPI</span>}
                    {m === 'card' ? 'Card' : 'UPI'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3 mb-5">
                    <div>
                      <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className={inputCls}
                        onFocus={e => e.target.style.borderColor = '#2dd4bf'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Expiry</label>
                        <input type="text" placeholder="MM/YY" className={inputCls}
                          onFocus={e => e.target.style.borderColor = '#2dd4bf'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#a0aec0' }}>CVV</label>
                        <input type="password" placeholder="***" className={inputCls}
                          onFocus={e => e.target.style.borderColor = '#2dd4bf'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#a0aec0' }}>Name on Card</label>
                      <input type="text" placeholder="JOHN DOE" className={`${inputCls} uppercase`}
                        onFocus={e => e.target.style.borderColor = '#2dd4bf'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </motion.div>
                )}
                {paymentMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3 mb-5">
                    <div>
                      <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#a0aec0' }}>UPI ID</label>
                      <input type="text" placeholder="username@upi" className={inputCls}
                        onFocus={e => e.target.style.borderColor = '#2dd4bf'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div className="p-3 rounded-xl text-xs text-center font-semibold" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      A payment request will be sent to your UPI app for approval.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                disabled={loading} onClick={handlePayment}
                className="w-full text-white py-3.5 rounded-xl text-sm font-black btn-primary disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : <>Pay ₹{totalAmount} & Confirm</>}
              </motion.button>

              <p className="text-[10px] font-semibold text-center mt-3 flex items-center justify-center gap-1 uppercase tracking-widest" style={{ color: '#a0aec0' }}>
                <FiShield className="w-3 h-3" style={{ color: '#2dd4bf' }} /> 256-bit Encrypted & Secure
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
