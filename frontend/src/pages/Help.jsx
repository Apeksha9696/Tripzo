import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { FiHeadphones, FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi';

const faqs = [
  { q: 'Can I track the location of my booked bus online?',        a: 'Yes! You can use the Tracking feature from the Bus Manifest to see real-time location. The tracking link is also sent via SMS 1 hour prior to departure.' },
  { q: 'What are the advantages of bus ticket booking with Tripzo?', a: 'Tripzo provides you with a seamless and premium booking experience, real-time seat mapping, verified operator ratings, and instant refunds upon cancellation.' },
  { q: 'How can I cancel my ticket?',                               a: 'You can manage your bookings through the "My Bookings" section. Simply click on an active booking and select "Cancel Ticket". Cancellation policies apply based on the operator.' },
  { q: 'Are government buses available on Tripzo?',                 a: 'Absolutely! We partner with several State RTCs including APSRTC, TSRTC, HRTC, UPSRTC, and many more, giving you the best government-backed travel options.' },
];

const contacts = [
  { icon: FiPhone,      title: 'Call Us',       detail: '1800-123-4567',    sub: 'Mon–Sat, 9am–6pm'      },
  { icon: FiHeadphones, title: 'Chat Support',  detail: 'Start a chat',     sub: 'Typical reply ~ 2 mins' },
  { icon: FiMail,       title: 'Email Us',      detail: 'support@tripzo.in', sub: 'Reply within 24 hours' },
];

export default function Help() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen pt-28 pb-12" style={{ background: '#ffffff' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background:'linear-gradient(135deg,#2dd4bf,#14b8a6)', boxShadow:'0 6px 20px rgba(45,212,191,0.3)' }}>
            <FiHelpCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color:'#1a202c' }}>How can we help?</h1>
          <p className="text-sm" style={{ color:'#718096' }}>Contact our 24/7 support or browse the FAQs below.</p>
        </motion.div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {contacts.map(({ icon: Icon, title, detail, sub }, idx) => (
            <motion.div key={title}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.08 }}
              className="white-card p-5 text-center cursor-pointer">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background:'rgba(45,212,191,0.1)' }}>
                <Icon className="w-5 h-5" style={{ color:'#2dd4bf' }} />
              </div>
              <h3 className="font-black text-sm mb-1" style={{ color:'#1a202c' }}>{title}</h3>
              <p className="font-semibold text-sm" style={{ color:'#2dd4bf' }}>{detail}</p>
              <p className="text-xs mt-0.5" style={{ color:'#a0aec0' }}>{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="glass-card overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom:'1px solid rgba(45,212,191,0.1)' }}>
            <h2 className="text-lg font-black" style={{ color:'#1a202c' }}>Frequently Asked Questions</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid rgba(45,212,191,0.08)' : 'none' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left transition-colors"
                  style={{ background: open === i ? 'rgba(45,212,191,0.04)' : 'transparent' }}
                >
                  <span className="font-semibold text-sm" style={{ color:'#1a202c' }}>{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration:0.2 }}>
                    <FaChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color:'#2dd4bf' }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
                      <p className="px-6 pb-4 text-sm leading-relaxed" style={{ color:'#718096' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
