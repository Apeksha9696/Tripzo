import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiUsers, FiSmartphone, FiZap, FiChevronDown } from 'react-icons/fi';

const features = [
  { icon: FiMapPin,      title: 'Real-Time Live Tracking', desc: 'Watch your bus approach on our interactive map. Never miss your ride again.'                          },
  { icon: FiUsers,       title: 'Dedicated Portals',       desc: 'Tailored dashboards for Passengers, Drivers, and Administrators.'                                      },
  { icon: FiSmartphone,  title: 'Instant Ticketing',       desc: 'Book your seat, get digital tickets, and process changes with zero friction.'                          },
  { icon: FiZap,         title: 'Data-Driven Ops',         desc: 'Admins monitor fleet movements while drivers maintain direct feedback loops.'                           },
];

const faqs = [
  { q: 'How accurate is the Live Tracking map?',          a: 'Our GPS tracking updates every 5 seconds, providing near real-time accuracy within 10 meters.'                                                    },
  { q: 'Can I register as a driver on the platform?',     a: 'Yes! Drivers can register through the signup page and select the Driver role during registration.'                                                },
  { q: 'What happens if my assigned bus breaks down?',    a: 'Our admin team is notified instantly and will arrange an alternate bus or issue a full refund.'                                                    },
  { q: 'Can I cancel my ticket from the user portal?',    a: 'Yes, cancellations are available up to 2 hours before departure from your My Bookings page.'                                                      },
  { q: 'How do administrators add new routes?',           a: 'Admins can add routes, buses, and drivers directly from the Admin Console dashboard.'                                                             },
  { q: 'Is the payment gateway integrated?',              a: 'Payment integration is coming soon. Currently, seat selection and booking confirmation are fully functional.'                                      },
];

export default function InfoSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">

      {/* Features */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <span className="badge mb-4">Why Tripzo?</span>
          <h2 className="text-3xl font-black mb-2" style={{ color: '#1a202c' }}>Built for Modern Travel</h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#718096' }}>
            A complete transportation ecosystem connecting passengers, drivers, and operators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="white-card p-6 group"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: 'rgba(45,212,191,0.12)' }}>
                <Icon className="w-5 h-5" style={{ color: '#2dd4bf' }} />
              </div>
              <h3 className="font-black text-sm mb-2" style={{ color: '#1a202c' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#718096' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-3xl p-8 md:p-12"
        style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mb-1" style={{ color: '#1a202c' }}>Frequently Asked Questions</h2>
          <p className="text-sm" style={{ color: '#718096' }}>Everything you need to know about Tripzo</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(45,212,191,0.12)' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                style={{ background: open === i ? 'rgba(45,212,191,0.05)' : 'transparent' }}
              >
                <span className="font-semibold text-sm pr-4" style={{ color: '#1a202c' }}>{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#2dd4bf' }} />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#718096', borderTop: '1px solid rgba(45,212,191,0.08)' }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
