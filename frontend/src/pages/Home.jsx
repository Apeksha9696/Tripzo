import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaRegCalendarAlt, FaBus, FaRupeeSign, FaExchangeAlt } from 'react-icons/fa';
import { FiArrowRight, FiStar, FiClock, FiShield, FiCheck, FiZap, FiMapPin } from 'react-icons/fi';
import Offers from '../components/Offers';
import Operators from '../components/Operators';
import Testimonials from '../components/Testimonials';
import InfoSection from '../components/InfoSection';
import Footer from '../components/Footer';

const CITIES = ["Delhi","Chandigarh","Mumbai","Bangalore","Chennai","Hyderabad","Kolkata","Pune","Jaipur","Ahmedabad","Surat","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik","Faridabad","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar","Navi Mumbai","Allahabad","Ranchi","Howrah","Coimbatore","Jabalpur","Gwalior","Vijayawada","Jodhpur","Madurai","Raipur","Kota","Guwahati","Gurgaon","Noida","Ambala","Karnal","Panipat","Jalandhar","Patiala","Bathinda","Rohtak","Hisar","Sonipat","Mandi","Shimla","Dehradun","Haridwar","Rishikesh"].sort();

const CityInput = ({ label, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const cities = value ? CITIES.filter(c => c.toLowerCase().includes(value.toLowerCase())) : CITIES.slice(0, 6);
  return (
    <div className="relative flex-1" ref={ref}>
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 cursor-text transition-all input-glass"
        onClick={() => ref.current.querySelector('input')?.focus()}
        onFocus={() => setOpen(true)}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#2dd4bf'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(45,212,191,0.2)'}
      >
        <FiMapPin className="text-base flex-shrink-0" style={{ color: '#2dd4bf' }} />
        <div className="flex flex-col w-full">
          <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#2dd4bf' }}>{label}</span>
          <input type="text" value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent font-semibold text-sm outline-none"
            style={{ color: '#1a202c' }}
          />
        </div>
      </div>
      {open && cities.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 rounded-2xl shadow-xl max-h-56 overflow-y-auto"
          style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(45,212,191,0.2)' }}>
          {cities.map((city, i) => (
            <li key={i} className="px-4 py-2.5 cursor-pointer font-medium flex items-center gap-2.5 text-sm transition-all"
              style={{ color: '#1a202c', borderBottom: '1px solid rgba(45,212,191,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,212,191,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => { onChange(city); setOpen(false); }}
            >
              <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2dd4bf' }} />
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const stats = [
  { icon: FaBus,       value: '1,000+', label: 'Buses'        },
  { icon: FiZap,       value: '500+',   label: 'Routes'       },
  { icon: FiStar,      value: '4.8★',   label: 'Rating'       },
  { icon: FaRupeeSign, value: '₹99',    label: 'Starts From'  },
];

const trust = [
  { icon: FiShield, label: 'Safe & Secure'  },
  { icon: FiClock,  label: '24/7 Support'   },
  { icon: FiCheck,  label: 'Instant Booking'},
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: 'Chandigarh', to: 'Delhi', date: '2026-04-10' });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date) return;
    navigate(`/search?from=${form.from}&to=${form.to}&date=${form.date}`);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: '#ffffff' }}>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <div>
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
                className="badge mb-6">
                <FiStar className="w-3.5 h-3.5" style={{ color:'#2dd4bf' }} />
                #1 Bus Booking & Tracking Platform in India
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
                className="text-5xl sm:text-6xl font-black leading-[1.08] tracking-tight mb-5" style={{ color:'#1a202c' }}>
                Travel Smarter,<br />
                <span className="text-gradient">Track Live.</span>
              </motion.h1>

              <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.2 }}
                className="text-base max-w-md mb-8 leading-relaxed" style={{ color:'#4a5568' }}>
                Book bus tickets instantly, track your ride in real-time, and enjoy premium amenities across 500+ routes nationwide.
              </motion.p>

              {/* Trust */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
                className="flex flex-wrap gap-4 mb-10">
                {trust.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'rgba(45,212,191,0.12)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color:'#2dd4bf' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color:'#4a5568' }}>{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="white-card p-4 text-center">
                    <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color:'#2dd4bf' }} />
                    <p className="font-black text-lg leading-none" style={{ color:'#1a202c' }}>{value}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color:'#718096' }}>{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Search Card */}
            <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.15 }}
              className="white-card p-6 lg:p-7" style={{ boxShadow: '0 8px 40px rgba(45,212,191,0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#2dd4bf,#14b8a6)', boxShadow:'0 4px 14px rgba(45,212,191,0.3)' }}>
                  <FaBus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-base" style={{ color:'#1a202c' }}>Search Buses</p>
                  <p className="text-xs" style={{ color:'#718096' }}>Find the best routes & prices</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-3">
                <CityInput label="From" value={form.from} onChange={v => setForm({ ...form, from: v })} placeholder="Chandigarh" />

                <div className="flex justify-center my-1">
                  <button 
                    type="button"
                    onClick={() => setForm({ ...form, from: form.to, to: form.from })}
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    style={{ background:'rgba(45,212,191,0.1)', border:'1px solid rgba(45,212,191,0.3)' }}
                    title="Swap Location"
                  >
                    <FaExchangeAlt className="w-4 h-4" style={{ color:'#2dd4bf', transform: 'rotate(90deg)' }} />
                  </button>
                </div>

                <CityInput label="To" value={form.to} onChange={v => setForm({ ...form, to: v })} placeholder="Delhi" />

                <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 input-glass transition-all"
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2dd4bf'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(45,212,191,0.2)'}
                >
                  <FaRegCalendarAlt className="flex-shrink-0" style={{ color:'#2dd4bf' }} />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:'#2dd4bf' }}>Date</span>
                    <input type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-transparent font-semibold text-sm outline-none cursor-pointer"
                      style={{ color:'#1a202c' }}
                    />
                  </div>
                </div>

                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  type="submit"
                  className="w-full text-white rounded-2xl px-8 py-4 font-bold text-sm flex items-center justify-center gap-2.5 btn-primary">
                  <FaSearch className="w-4 h-4" />
                  Search Buses
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        <Offers />
        <Operators />
        <Testimonials />
        <InfoSection />
      </main>

      <Footer />
    </div>
  );
}
