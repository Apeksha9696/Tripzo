import React from 'react';
import { motion } from 'framer-motion';
import { FaBus, FaTrain, FaTag } from 'react-icons/fa';
import { FiArrowRight, FiClock } from 'react-icons/fi';

const offers = [
  { type: 'Bus', desc: 'Save up to ₹250 on bus tickets', valid: '30 Apr', code: 'FIRST', grad: 'linear-gradient(135deg,#c2185b,#e91e8c)' },
  { type: 'Bus', desc: 'Save up to ₹300 on bus tickets', valid: '17 Apr', code: 'FESTIVE300', grad: 'linear-gradient(135deg,#880e4f,#c2185b)' },
  { type: 'Bus', desc: 'Save up to ₹500 with HDFC Bank', valid: '30 Apr', code: 'HDFC500', grad: 'linear-gradient(135deg,#4a0028,#ad1457)' },
  { type: 'Bus', desc: 'Save up to ₹500 on RBL Bank Credit card', valid: '30 Apr', code: 'RBLCC500', grad: 'linear-gradient(135deg,#c2185b,#f48fb1)' },
  { type: 'Bus', desc: 'Save up to ₹200 with AU Bank Credit Cards', valid: '30 Apr', code: 'AUBUS200', grad: 'linear-gradient(135deg,#ad1457,#e91e8c)' },
  { type: 'Train', desc: 'Get ₹120 off on train tickets', valid: '30 Apr', code: 'SUMMERNEW', grad: 'linear-gradient(135deg,#880e4f,#c2185b)' },
  { type: 'Train', desc: 'FLAT ₹300 off on train tickets', valid: '30 Apr', code: 'REDRAILNEW', grad: 'linear-gradient(135deg,#4a0028,#c2185b)' },
  { type: 'Train', desc: 'Flat ₹50 off on Free Cancellation', valid: '30 Apr', code: 'FCFLAT50', grad: 'linear-gradient(135deg,#c2185b,#f48fb1)' },
  { type: 'Bus', desc: 'Save up to ₹500 on bus tickets', valid: '30 Apr', code: 'RED500', grad: 'linear-gradient(135deg,#ad1457,#f48fb1)' },
  { type: 'Bus', desc: 'Get up to 15% discount on FlixBus', valid: '16 May', code: 'FLIX15', grad: 'linear-gradient(135deg,#880e4f,#e91e8c)' },
];

export default function Offers() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: '#4a0028' }}>Exclusive Offers</h2>
          <p className="mt-1 font-medium" style={{ color: '#c2185b' }}>Grab the best deals before they expire</p>
        </div>
        <button className="flex items-center gap-2 font-bold text-sm transition-all hover:gap-3" style={{ color: '#c2185b' }}>
          View all <FiArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-5 cursor-grab active:cursor-grabbing snap-x" style={{ scrollbarWidth: 'none' }}>
        {offers.map((offer, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex-none rounded-2xl overflow-hidden snap-start"
            style={{ minWidth: '272px', boxShadow: '0 8px 30px rgba(194,24,91,0.15)' }}
          >
            <div className="p-5" style={{ background: offer.grad }}>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  {offer.type === 'Bus' ? <FaBus className="w-3 h-3" /> : <FaTrain className="w-3 h-3" />}
                  {offer.type}
                </span>
                <FaTag className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-white font-bold text-base leading-snug">{offer.desc}</p>
            </div>
            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#94a3b8' }}>
                <FiClock className="w-3.5 h-3.5" /> Valid till {offer.valid}
              </div>
              <button
                className="px-4 py-2 rounded-xl font-black text-xs tracking-widest text-white transition-all"
                style={{ background: '#c2185b' }}
                onMouseEnter={e => e.currentTarget.style.background = '#880e4f'}
                onMouseLeave={e => e.currentTarget.style.background = '#c2185b'}
              >
                {offer.code}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
