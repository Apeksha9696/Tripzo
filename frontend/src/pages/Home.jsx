import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaRegCalendarAlt, FaBus } from 'react-icons/fa';
import { FiArrowRight, FiStar, FiClock, FiShield, FiCheck, FiZap } from 'react-icons/fi';
import Offers from '../components/Offers';
import Operators from '../components/Operators';
import Testimonials from '../components/Testimonials';
import InfoSection from '../components/InfoSection';
import Footer from '../components/Footer';

const CITIES = [
  "Delhi","Chandigarh","Mumbai","Bangalore","Chennai","Hyderabad","Kolkata","Pune",
  "Jaipur","Ahmedabad","Surat","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal",
  "Visakhapatnam","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik","Faridabad",
  "Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar","Navi Mumbai",
  "Allahabad","Ranchi","Howrah","Coimbatore","Jabalpur","Gwalior","Vijayawada","Jodhpur",
  "Madurai","Raipur","Kota","Guwahati","Gurgaon","Noida","Ambala","Karnal","Panipat",
  "Jalandhar","Patiala","Bathinda","Rohtak","Hisar","Sonipat","Mandi","Shimla","Dehradun",
  "Haridwar","Rishikesh"
].sort();

const CityInput = ({ label, value, onChange, placeholder }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = value
    ? CITIES.filter(c => c.toLowerCase().includes(value.toLowerCase()))
    : CITIES.slice(0, 6);

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-3.5 cursor-text transition-all"
        style={{ background: '#fcfafb', border: '1.5px solid #f8bbd0' }}
        onClick={() => wrapperRef.current.querySelector('input')?.focus()}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#e91e8c'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#f8bbd0'}
      >
        <FaMapMarkerAlt style={{ color: '#c2185b' }} className="text-lg flex-shrink-0" />
        <div className="flex flex-col w-full">
          <span className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#f48fb1' }}>{label}</span>
          <input
            type="text"
            value={value}
            onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full bg-transparent font-bold text-base outline-none"
            style={{ color: '#4a0028' }}
          />
        </div>
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#f48fb1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {showDropdown && filteredCities.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 rounded-2xl shadow-2xl max-h-60 overflow-y-auto"
          style={{ background: 'rgba(255,255,255,0.98)', border: '1.5px solid #f8bbd0' }}>
          {filteredCities.map((city, idx) => (
            <li key={idx}
              className="px-5 py-3 cursor-pointer font-semibold flex items-center gap-3 text-sm transition-all"
              style={{ color: '#880e4f', borderBottom: '1px solid #fff0f5' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff0f5'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => { onChange(city); setShowDropdown(false); }}
            >
              <FaMapMarkerAlt className="w-3 h-3" style={{ color: '#f48fb1' }} />
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const stats = [
  { icon: FaBus, value: '1000+', label: 'Buses' },
  { icon: FiZap, value: '500+', label: 'Routes' },
  { icon: FiStar, value: '4.8★', label: 'Rating' },
];

export default function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ from: 'Chandigarh', to: 'Delhi', date: '2026-04-10' });

  // eslint-disable-next-line no-unused-vars
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/offers');
        if (res.ok) { const data = await res.json(); setOffers(data.slice(0, 3)); }
      } catch (e) { console.error(e); }
    };
    fetchOffers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.date) return;
    navigate(`/search?from=${formData.from}&to=${formData.to}&date=${formData.date}`);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#ffffff' }}>

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        style={{ background: '#ffffff' }}
      >
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-6"
            style={{ background: 'rgba(244,143,177,0.18)', border: '1px solid #f8bbd0', color: '#c2185b' }}
          >
            <FiStar className="w-4 h-4" style={{ color: '#e91e8c' }} />
            #1 Bus Booking & Tracking Platform in India
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            style={{ color: '#4a0028' }}
          >
            Travel Smarter,<br />
            <span style={{ background: 'linear-gradient(90deg, #c2185b, #f48fb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Track Live.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl max-w-xl mb-8 leading-relaxed"
            style={{ color: '#ad1457' }}
          >
            Book bus tickets instantly, track your ride in real-time, and enjoy
            premium amenities across 500+ routes nationwide.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-6 mb-12"
          >
            {[
              { icon: FiShield, label: 'Safe & Secure' },
              { icon: FiClock, label: '24/7 Support' },
              { icon: FiCheck, label: 'Instant Booking' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ color: '#c2185b' }}>
                <Icon className="w-5 h-5" style={{ color: '#f48fb1' }} />
                <span className="font-semibold text-sm">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="rounded-3xl shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(248,187,208,0.5)',
              boxShadow: '0 25px 60px rgba(194,24,91,0.12)',
            }}
          >
            <div className="h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #c2185b, #e91e8c, #f48fb1)' }} />
            <div className="p-5 md:p-6">
              <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <CityInput label="From" value={formData.from} onChange={(v) => setFormData({ ...formData, from: v })} placeholder="Chandigarh" />
                <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                  style={{ background: '#fce4ec', color: '#c2185b' }}>
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <CityInput label="To" value={formData.to} onChange={(v) => setFormData({ ...formData, to: v })} placeholder="Delhi" />

                <div
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all flex-1 lg:flex-none lg:w-52"
                  style={{ background: '#fff0f5', border: '1.5px solid #f8bbd0' }}
                >
                  <FaRegCalendarAlt style={{ color: '#c2185b' }} className="text-lg flex-shrink-0" />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#f48fb1' }}>Date</span>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-transparent font-bold text-base outline-none cursor-pointer"
                      style={{ color: '#4a0028' }}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full lg:w-auto text-white rounded-2xl px-8 py-4 font-black text-base flex items-center justify-center gap-3 transition-all min-h-[60px]"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)', boxShadow: '0 10px 30px rgba(194,24,91,0.35)' }}
                >
                  <FaSearch className="w-4 h-4" />
                  Search Buses
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-8 mt-10"
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(244,143,177,0.2)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#c2185b' }} />
                </div>
                <div>
                  <p className="font-black text-lg leading-none" style={{ color: '#4a0028' }}>{value}</p>
                  <p className="text-xs font-semibold" style={{ color: '#f48fb1' }}>{label}</p>
                </div>
              </div>
            ))}
          </motion.div>

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
