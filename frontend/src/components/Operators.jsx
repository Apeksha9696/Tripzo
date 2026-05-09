import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaBus } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const operators = [
  { name: 'APSRTC',     rating: '3.85', region: 'Andhra Pradesh',    services: '1539 services — Garuda, Garuda Plus & more',       code: 'APSRTCNEW' },
  { name: 'TGSRTC',     rating: '3.71', region: 'Telangana',         services: '1450 services — Garuda Plus, Rajdhani & more',      code: 'FIRST'     },
  { name: 'KERALA RTC', rating: '3.85', region: 'Kerala',            services: '940 services — Swift, AC Multiaxle & more',         code: 'FIRST'     },
  { name: 'KTCL',       rating: '3.83', region: 'Goa',               services: '60 services — Volvo Bus, AC & Non AC & more',       code: 'FIRST'     },
  { name: 'RSRTC',      rating: '3.71', region: 'Rajasthan',         services: '6000 services — Deluxe, Ordinary & more',           code: 'FIRST'     },
  { name: 'SBSTC',      rating: '3.95', region: 'West Bengal',       services: '480 services — Volvo Bus, AC & Non AC & more',      code: 'FIRST'     },
  { name: 'HRTC',       rating: '3.98', region: 'Himachal Pradesh',  services: '480 services — Himgaurav, Himmani & more',          code: 'FIRST'     },
  { name: 'ASTC',       rating: '4.02', region: 'Assam',             services: '200 services — Volvo Bus, AC & Non AC & more',      code: 'FIRST'     },
];

export default function Operators() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto" style={{ borderTop: '1px solid #f1f5f9' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black" style={{ color: '#1a202c' }}>Government Bus Operators</h2>
          <p className="text-sm mt-0.5" style={{ color: '#718096' }}>Trusted state-run fleets across India</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all" style={{ color: '#2dd4bf' }}>
          View all <FiArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {operators.map((op, idx) => (
          <motion.div key={idx} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
            className="white-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(45,212,191,0.1)' }}>
                  <FaBus className="w-5 h-5" style={{ color: '#2dd4bf' }} />
                </div>
                <div>
                  <h3 className="font-black text-sm" style={{ color: '#1a202c' }}>{op.name}</h3>
                  <p className="text-xs" style={{ color: '#a0aec0' }}>{op.region}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-white px-2 py-1 rounded-lg font-bold text-xs"
                style={{ background: parseFloat(op.rating) >= 4 ? '#10b981' : '#2dd4bf' }}>
                <FaStar className="w-2.5 h-2.5" /> {op.rating}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: '#718096' }}>{op.services}</p>
            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(45,212,191,0.1)' }}>
              <span className="text-xs" style={{ color: '#a0aec0' }}>Promo code</span>
              <span className="font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{ background: 'rgba(45,212,191,0.1)', color: '#0f766e', border: '1px solid rgba(45,212,191,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#2dd4bf'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(45,212,191,0.1)'; e.currentTarget.style.color = '#0f766e'; }}
              >{op.code}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
