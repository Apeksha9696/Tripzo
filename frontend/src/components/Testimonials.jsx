import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  { name: 'Simran Kaur', role: 'Regular Passenger', review: "The live bus tracking feature is a lifesaver! I knew exactly where my bus was and didn't have to wait blindly at the stop. The booking process is incredibly smooth.", rating: 5, avatar: 'S', grad: 'linear-gradient(135deg,#c2185b,#f48fb1)' },
  { name: 'Rajiv Sharma', role: 'Bus Driver', review: "As a driver, the dedicated dashboard makes my day effortless. I can see all my upcoming assignments, manage passengers, and update my live location with one tap.", rating: 5, avatar: 'R', grad: 'linear-gradient(135deg,#880e4f,#c2185b)' },
  { name: 'Anjali Verma', role: 'Frequent Traveler', review: "I love the clean, modern interface. It's so fast and easy to navigate. Best bus booking and tracking platform I have ever used in India!", rating: 5, avatar: 'A', grad: 'linear-gradient(135deg,#4a0028,#e91e8c)' },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <span className="inline-block font-bold text-sm px-4 py-2 rounded-full mb-4"
          style={{ background: '#fce4ec', color: '#c2185b' }}>
          Testimonials
        </span>
        <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: '#4a0028' }}>What Our Users Say</h2>
        <p className="font-medium text-lg max-w-xl mx-auto" style={{ color: '#c2185b' }}>
          Hear from passengers and drivers experiencing seamless travel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl p-7 flex flex-col transition-all duration-300"
            style={{ border: '1.5px solid #fce4ec', boxShadow: '0 4px 20px rgba(194,24,91,0.07)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 50px rgba(194,24,91,0.15)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(194,24,91,0.07)'}
          >
            <div className="flex gap-1 mb-5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <FaStar key={i} className="w-4 h-4 text-amber-400" />
              ))}
            </div>
            <FaQuoteLeft className="w-6 h-6 mb-3" style={{ color: '#f8bbd0' }} />
            <p className="font-medium leading-relaxed flex-1 mb-6" style={{ color: '#475569' }}>"{t.review}"</p>
            <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #fff0f5' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base shadow-md"
                style={{ background: t.grad }}>
                {t.avatar}
              </div>
              <div>
                <h4 className="font-black text-sm" style={{ color: '#4a0028' }}>{t.name}</h4>
                <p className="text-xs font-semibold" style={{ color: '#f48fb1' }}>{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
