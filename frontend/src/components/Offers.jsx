import React from 'react';
import { motion } from 'framer-motion';
import { FaBus, FaTag } from 'react-icons/fa';
import { FiArrowRight, FiClock } from 'react-icons/fi';

const offers = [
  { desc: 'Save up to ₹250 on bus tickets',           valid: '30 Apr', code: 'FIRST'     },
  { desc: 'Save up to ₹300 on bus tickets',           valid: '17 Apr', code: 'FESTIVE300' },
  { desc: 'Save up to ₹500 with HDFC Bank',           valid: '30 Apr', code: 'HDFC500'   },
  { desc: 'Save up to ₹500 on RBL Bank Credit card',  valid: '30 Apr', code: 'RBLCC500'  },
  { desc: 'Save up to ₹200 with AU Bank Credit Cards', valid: '30 Apr', code: 'AUBUS200'  },
  { desc: 'Get ₹120 off on train tickets',            valid: '30 Apr', code: 'SUMMERNEW' },
  { desc: 'FLAT ₹300 off on train tickets',           valid: '30 Apr', code: 'REDRAILNEW'},
  { desc: 'Save up to ₹500 on bus tickets',           valid: '30 Apr', code: 'RED500'    },
];

export default function Offers() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black" style={{ color: '#1a202c' }}>Exclusive Offers</h2>
          <p className="text-sm mt-0.5" style={{ color: '#718096' }}>Grab the best deals before they expire</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5" style={{ color: '#2dd4bf' }}>
          View all <FiArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex overflow-x-auto pb-3 gap-4 snap-x" style={{ scrollbarWidth: 'none' }}>
        {offers.map((offer, idx) => (
          <motion.div key={idx}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex-none rounded-2xl overflow-hidden snap-start white-card"
            style={{ minWidth: '260px' }}
          >
            {/* Card top */}
            <div className="p-5" style={{ background: 'rgba(45,212,191,0.05)', borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(45,212,191,0.15)', color: '#0f766e', border: '1px solid rgba(45,212,191,0.25)' }}>
                  <FaBus className="w-3 h-3" /> Bus
                </span>
                <FaTag className="w-3.5 h-3.5" style={{ color: '#2dd4bf', opacity: 0.6 }} />
              </div>
              <p className="font-semibold text-sm leading-snug" style={{ color: '#1a202c' }}>{offer.desc}</p>
            </div>
            {/* Card bottom */}
            <div className="bg-white px-4 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(45,212,191,0.1)' }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#a0aec0' }}>
                <FiClock className="w-3.5 h-3.5" /> Valid till {offer.valid}
              </div>
              <button className="px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#2dd4bf,#14b8a6)', boxShadow: '0 2px 10px rgba(45,212,191,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(45,212,191,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(45,212,191,0.3)'}
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
