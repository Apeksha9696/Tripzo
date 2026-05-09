import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  { name: 'Simran Kaur',  role: 'Regular Passenger', rating: 5, review: "The live bus tracking feature is a lifesaver! I knew exactly where my bus was and didn't have to wait blindly at the stop. The booking process is incredibly smooth." },
  { name: 'Rajiv Sharma', role: 'Bus Driver',         rating: 5, review: "As a driver, the dedicated dashboard makes my day effortless. I can see all my upcoming assignments, manage passengers, and update my live location with one tap." },
  { name: 'Anjali Verma', role: 'Frequent Traveler',  rating: 5, review: "I love the clean, modern interface. It's so fast and easy to navigate. Best bus booking and tracking platform I have ever used in India!" },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="badge mb-4">Testimonials</span>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#1a202c' }}>What Our Users Say</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: '#718096' }}>
          Hear from passengers and drivers experiencing seamless travel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <motion.div key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="white-card p-6 flex flex-col"
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <FaStar key={i} className="w-3.5 h-3.5 text-amber-400" />
              ))}
            </div>
            <FaQuoteLeft className="w-5 h-5 mb-3" style={{ color: 'rgba(45,212,191,0.4)' }} />
            <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#4a5568' }}>"{t.review}"</p>
            <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(45,212,191,0.1)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#2dd4bf,#14b8a6)', boxShadow: '0 4px 12px rgba(45,212,191,0.3)' }}>
                {t.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: '#1a202c' }}>{t.name}</h4>
                <p className="text-xs" style={{ color: '#2dd4bf' }}>{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
