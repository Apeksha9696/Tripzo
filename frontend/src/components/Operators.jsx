import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaBus } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const operators = [
  { name: 'APSRTC', rating: '3.85', region: 'Andhra Pradesh', services: '1539 services — Garuda, Garuda Plus & more', code: 'APSRTCNEW' },
  { name: 'TGSRTC', rating: '3.71', region: 'Telangana', services: '1450 services — Garuda Plus, Rajdhani & more', code: 'FIRST' },
  { name: 'KERALA RTC', rating: '3.85', region: 'Kerala', services: '940 services — Swift, AC Multiaxle & more', code: 'FIRST' },
  { name: 'KTCL', rating: '3.83', region: 'Goa', services: '60 services — Volvo Bus, AC & Non AC & more', code: 'FIRST' },
  { name: 'RSRTC', rating: '3.71', region: 'Rajasthan', services: '6000 services — Deluxe, Ordinary & more', code: 'FIRST' },
  { name: 'SBSTC', rating: '3.95', region: 'West Bengal', services: '480 services — Volvo Bus, AC & Non AC & more', code: 'FIRST' },
  { name: 'HRTC', rating: '3.98', region: 'Himachal Pradesh', services: '480 services — Himgaurav, Himmani & more', code: 'FIRST' },
  { name: 'ASTC', rating: '4.02', region: 'Assam', services: '200 services — Volvo Bus, AC & Non AC & more', code: 'FIRST' },
];

export default function Operators() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto" style={{ borderTop: '1px solid #fce4ec' }}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: '#4a0028' }}>Government Bus Operators</h2>
          <p className="mt-1 font-medium" style={{ color: '#c2185b' }}>Trusted state-run fleets across India</p>
        </div>
        <button className="flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all" style={{ color: '#c2185b' }}>
          View all <FiArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {operators.map((op, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-2xl overflow-hidden group transition-all duration-300"
            style={{ border: '1.5px solid #fce4ec', boxShadow: '0 4px 20px rgba(194,24,91,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(194,24,91,0.15)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(194,24,91,0.06)'}
          >
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #c2185b, #f48fb1)' }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fce4ec' }}>
                    <FaBus className="w-5 h-5" style={{ color: '#c2185b' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight" style={{ color: '#4a0028' }}>{op.name}</h3>
                    <p className="text-xs font-semibold" style={{ color: '#f48fb1' }}>{op.region}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-white px-2 py-1 rounded-lg font-black text-xs"
                  style={{ background: parseFloat(op.rating) >= 4 ? '#10b981' : '#c2185b' }}>
                  <FaStar className="w-2.5 h-2.5" /> {op.rating}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: '#64748b' }}>{op.services}</p>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #fff0f5' }}>
                <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>Promo code</span>
                <span
                  className="font-black text-xs px-3 py-1.5 rounded-lg tracking-wider transition-all cursor-pointer"
                  style={{ background: '#fce4ec', color: '#c2185b' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#c2185b'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fce4ec'; e.currentTarget.style.color = '#c2185b'; }}
                >
                  {op.code}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
