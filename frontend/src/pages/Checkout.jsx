import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRupeeSign, FaRegCreditCard, FaRegCalendarAlt, FaRegClock, FaMapMarkerAlt, FaCheckCircle, FaArrowLeft, FaBus, FaTicketAlt } from 'react-icons/fa';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state;
  if (!state || !state.bus || !state.selectedSeats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl" style={{ border: '1.5px solid #f8bbd0' }}>
           <h2 className="text-xl font-black mb-2" style={{ color: '#4a0028' }}>Invalid Request</h2>
           <p className="text-sm" style={{ color: '#ad1457' }}>Please go back and select seats first.</p>
           <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  const { bus, selectedSeats } = state;
  const [step, setStep] = useState('review'); // 'review' | 'payment'
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [success, setSuccess] = useState(false);

  const totalAmount = selectedSeats.length * bus.price;

  const handlePayment = async () => {
    setLoading(true);
    setTimeout(async () => {
      const token = localStorage.getItem('token');
      try {
        await axios.post(
          'http://localhost:5000/api/bookings', 
          { busId: bus._id, seats: selectedSeats },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(true);
      } catch (err) {
        alert(err.response?.data?.error || 'Booking Failed');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }}
          className="max-w-md w-full text-center rounded-3xl p-8 relative overflow-hidden"
          style={{ background: '#ffffff', border: '1.5px solid #f8bbd0', boxShadow: '0 15px 40px rgba(194,24,91,0.12)' }}
        >
          {/* Confetti / background shapes */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" style={{ background: '#e91e8c' }}></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" style={{ background: '#f48fb1' }}></div>
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.2 }} className="mb-5 relative z-10 flex justify-center">
             <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: '3px solid #d1fae5' }}>
               <FaCheckCircle className="w-8 h-8 text-white" />
             </div>
          </motion.div>

          <h1 className="text-2xl font-black mb-2 relative z-10" style={{ color: '#4a0028' }}>Payment Successful!</h1>
          <p className="mb-6 text-sm font-bold leading-relaxed relative z-10" style={{ color: '#ad1457' }}>Your ticket has been booked successfully. Have a great journey!</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left relative z-10" style={{ background: '#fff0f5', border: '1px solid #fce4ec' }}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-xs" style={{ color: '#ad1457' }}>Booking ID</span>
              <span className="font-black text-sm" style={{ color: '#4a0028' }}>TRK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="font-bold text-xs" style={{ color: '#ad1457' }}>Amount Paid</span>
               <span className="font-black text-sm flex items-center" style={{ color: '#c2185b' }}><FaRupeeSign className="w-2.5 h-2.5"/> {totalAmount}</span>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wide relative z-10 w-full"
            style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)', boxShadow: '0 8px 20px rgba(194,24,91,0.3)' }}
          >
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ background: '#ffffff' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {step === 'review' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-black text-center mb-5" style={{ color: '#4a0028' }}>Review Your Booking</h2>
            
            <div className="rounded-3xl overflow-hidden mb-5 shadow-xl relative" style={{ background: '#ffffff', border: '1.5px solid #f8bbd0', boxShadow: '0 15px 40px rgba(194,24,91,0.08)' }}>
              
              {/* Ticket Top - Dark gradient */}
              <div className="p-5 md:p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4a0028, #880e4f)' }}>
                <div className="absolute right-0 top-0 w-48 h-48 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2" style={{ background: '#e91e8c' }}></div>
                
                <div className="flex justify-between items-start relative z-10 mb-5">
                  <div>
                    <h3 className="font-black tracking-widest text-[10px] mb-1 uppercase flex items-center gap-1.5" style={{ color: '#f48fb1' }}><FaTicketAlt className="w-3 h-3"/> E-Ticket</h3>
                    <h1 className="text-2xl font-black text-white mb-0.5">{bus.operatorName}</h1>
                    <p className="font-bold text-xs" style={{ color: '#f8bbd0' }}>{bus.busName} • {bus.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 text-white bg-black/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                  <div className="text-center">
                    <p className="text-2xl font-black">{bus.departureTime}</p>
                    <p className="text-xs mt-0.5 font-bold" style={{ color: '#f8bbd0' }}>{bus.from}</p>
                  </div>
                  
                  <div className="flex-1 px-4 flex items-center justify-center relative">
                    <div className="w-full border-t-2 border-dashed absolute top-1/2 -translate-y-1/2 opacity-30"></div>
                    <div className="px-2 py-0.5 relative z-10 rounded-full font-black text-[9px] uppercase tracking-wider flex items-center gap-1 bg-white/20 backdrop-blur-md">
                      <FaRegClock className="w-2.5 h-2.5"/> {bus.duration}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-black">{bus.arrivalTime}</p>
                    <p className="text-xs mt-0.5 font-bold" style={{ color: '#f8bbd0' }}>{bus.to}</p>
                  </div>
                </div>
              </div>
              
              {/* Ticket Middle */}
              <div className="p-5 md:p-6 bg-white">
                <div className="grid grid-cols-2 gap-3 mb-5 p-4 rounded-xl" style={{ background: '#fff0f5', border: '1px solid #fce4ec' }}>
                  <div>
                    <p className="text-[9px] font-black mb-1 flex items-center gap-1 uppercase tracking-widest" style={{ color: '#c2185b' }}><FaRegCalendarAlt className="w-2.5 h-2.5"/> Date</p>
                    <p className="font-black text-sm" style={{ color: '#4a0028' }}>{new Date(bus.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black mb-1 uppercase tracking-widest" style={{ color: '#c2185b' }}>Seat Number(s)</p>
                    <p className="font-black text-sm truncate" style={{ color: '#4a0028' }}>{selectedSeats.join(', ')}</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-dashed" style={{ borderColor: '#f8bbd0' }}>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm" style={{ color: '#ad1457' }}>Base Fare ({selectedSeats.length} × ₹{bus.price})</p>
                    <p className="font-black text-base" style={{ color: '#4a0028' }}>₹{totalAmount}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm" style={{ color: '#ad1457' }}>Taxes & Fees</p>
                    <p className="font-black text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest" style={{ color: '#10b981', background: '#ecfdf5', borderColor: '#a7f3d0' }}>Inclusive</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 mt-2 border-t" style={{ borderColor: '#fce4ec' }}>
                    <p className="text-xl font-black" style={{ color: '#4a0028' }}>Total Amount</p>
                    <p className="text-2xl font-black flex items-center leading-none" style={{ color: '#c2185b' }}>
                      <FaRupeeSign className="w-5 h-5 mr-0.5" />
                      {totalAmount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edge Cutouts */}
              <div className="absolute -left-3 top-[190px] w-6 h-6 rounded-full z-20" style={{ background: '#ffffff', borderRight: '1.5px solid #f8bbd0' }}></div>
              <div className="absolute -right-3 top-[190px] w-6 h-6 rounded-full z-20" style={{ background: '#ffffff', borderLeft: '1.5px solid #f8bbd0' }}></div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  alert("Please login before proceeding to payment!");
                  window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
                  return;
                }
                setStep('payment');
              }}
              className="w-full text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)', boxShadow: '0 8px 25px rgba(194,24,91,0.3)' }}
            >
              Proceed To Payment
            </motion.button>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center mb-5 relative">
              <button 
                onClick={() => setStep('review')} 
                className="absolute left-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-black hover:bg-white"
                style={{ color: '#c2185b', border: '1px solid #fce4ec' }}
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
              </button>
              <h2 className="text-2xl font-black text-center w-full" style={{ color: '#4a0028' }}>Payment Method</h2>
            </div>
            
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-xl relative overflow-hidden" style={{ border: '1.5px solid #f8bbd0' }}>
              
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className="flex-1 py-3 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 font-black relative overflow-hidden text-sm"
                  style={{
                    borderColor: paymentMethod === 'card' ? '#e91e8c' : '#fce4ec',
                    background: paymentMethod === 'card' ? '#fff0f5' : '#ffffff',
                    color: paymentMethod === 'card' ? '#c2185b' : '#880e4f',
                    borderWidth: paymentMethod === 'card' ? '2px' : '1px'
                  }}
                >
                  <FaRegCreditCard className="w-6 h-6" />
                  Card
                  {paymentMethod === 'card' && <div className="absolute top-0 right-0 w-6 h-6 bg-pink-500 rounded-bl-full flex items-center justify-center text-white"><FaCheckCircle className="w-2 h-2 mb-1 ml-1"/></div>}
                </button>
                
                <button 
                  onClick={() => setPaymentMethod('upi')}
                   className="flex-1 py-3 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 font-black relative overflow-hidden text-sm"
                  style={{
                    borderColor: paymentMethod === 'upi' ? '#e91e8c' : '#fce4ec',
                    background: paymentMethod === 'upi' ? '#fff0f5' : '#ffffff',
                    color: paymentMethod === 'upi' ? '#c2185b' : '#880e4f',
                    borderWidth: paymentMethod === 'upi' ? '2px' : '1px'
                  }}
                >
                  <div className="w-6 h-6 flex items-center justify-center font-black tracking-tighter text-base">UPI</div>
                  UPI
                  {paymentMethod === 'upi' && <div className="absolute top-0 right-0 w-6 h-6 bg-pink-500 rounded-bl-full flex items-center justify-center text-white"><FaCheckCircle className="w-2 h-2 mb-1 ml-1"/></div>}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#ad1457' }}>Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl font-bold border-2 outline-none transition-all placeholder-pink-200 text-sm" 
                        style={{ borderColor: '#fce4ec', color: '#4a0028', background: '#fafafa' }}
                        onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#fce4ec'}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#ad1457' }}>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl font-bold border-2 outline-none transition-all placeholder-pink-200 text-sm" 
                          style={{ borderColor: '#fce4ec', color: '#4a0028', background: '#fafafa' }}
                          onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#fce4ec'}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#ad1457' }}>CVV</label>
                        <input type="password" placeholder="***" className="w-full px-4 py-3 rounded-xl font-bold border-2 outline-none transition-all placeholder-pink-200 text-sm" 
                          style={{ borderColor: '#fce4ec', color: '#4a0028', background: '#fafafa' }}
                          onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#fce4ec'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#ad1457' }}>Name on Card</label>
                      <input type="text" placeholder="JOHN DOE" className="w-full px-4 py-3 rounded-xl font-bold border-2 outline-none transition-all placeholder-pink-200 uppercase text-sm" 
                        style={{ borderColor: '#fce4ec', color: '#4a0028', background: '#fafafa' }}
                        onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#fce4ec'}
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest" style={{ color: '#ad1457' }}>Enter UPI ID</label>
                      <input type="text" placeholder="username@upi" className="w-full px-4 py-3 rounded-xl font-bold border-2 outline-none transition-all placeholder-pink-200 text-sm" 
                        style={{ borderColor: '#fce4ec', color: '#4a0028', background: '#fafafa' }}
                        onFocus={e => e.target.style.borderColor = '#e91e8c'} onBlur={e => e.target.style.borderColor = '#fce4ec'}
                      />
                    </div>
                    <div className="p-4 rounded-xl border border-emerald-200 text-xs text-center font-black" style={{ background: '#ecfdf5', color: '#059669' }}>
                      A payment request will be sent to the entered UPI ID. Please open your UPI app to approve it.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={!loading ? { scale: 1.02 } : {}} 
                whileTap={!loading ? { scale: 0.98 } : {}}
                disabled={loading}
                onClick={handlePayment}
                className="w-full text-white py-3.5 rounded-xl text-sm font-black transition-all duration-200 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>Pay ₹{totalAmount} & Confirm</>
                )}
              </motion.button>
              
              <p className="text-[9px] font-black text-center mt-4 flex items-center justify-center gap-1 uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                <svg className="w-3 h-3" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                256-bit Encrypted
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
