import React, { useState } from 'react';
import { FiMapPin, FiUsers, FiSmartphone, FiZap, FiChevronDown } from 'react-icons/fi';

const features = [
  { icon: FiMapPin, title: 'Real-Time Live Tracking', desc: 'Watch your bus approach on our interactive map. Never miss your ride again.', bg: '#fce4ec', color: '#c2185b' },
  { icon: FiUsers, title: 'Dedicated Portals', desc: 'Tailored dashboards for Passengers, Drivers, and Administrators.', bg: '#fff0f5', color: '#ad1457' },
  { icon: FiSmartphone, title: 'Instant Ticketing', desc: 'Book your seat, get digital tickets, and process changes with zero friction.', bg: '#fce4ec', color: '#c2185b' },
  { icon: FiZap, title: 'Data-Driven Ops', desc: 'Admins monitor fleet movements while drivers maintain direct feedback loops.', bg: '#fff0f5', color: '#880e4f' },
];

const faqs = [
  { q: 'How accurate is the Live Tracking map?', a: 'Our GPS tracking updates every 5 seconds, providing near real-time accuracy within 10 meters.' },
  { q: 'Can I register as a driver on the platform?', a: 'Yes! Drivers can register through the signup page and select the Driver role during registration.' },
  { q: 'What happens if my assigned bus breaks down?', a: 'Our admin team is notified instantly and will arrange an alternate bus or issue a full refund.' },
  { q: 'Can I cancel my ticket from the user portal?', a: 'Yes, cancellations are available up to 2 hours before departure from your My Bookings page.' },
  { q: 'How do administrators add new routes?', a: 'Admins can add routes, buses, and drivers directly from the Admin Console dashboard.' },
  { q: 'Is the payment gateway integrated?', a: 'Payment integration is coming soon. Currently, seat selection and booking confirmation are fully functional.' },
];

export default function InfoSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">

      {/* Why Choose */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <span className="inline-block font-bold text-sm px-4 py-2 rounded-full mb-4"
            style={{ background: '#fce4ec', color: '#c2185b' }}>
            Why Tripzo?
          </span>
          <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: '#4a0028' }}>Built for Modern Travel</h2>
          <p className="font-medium max-w-xl mx-auto" style={{ color: '#c2185b' }}>
            A complete transportation ecosystem connecting passengers, drivers, and operators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, bg, color }, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1"
              style={{ border: '1.5px solid #fce4ec', boxShadow: '0 4px 20px rgba(194,24,91,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(194,24,91,0.14)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(194,24,91,0.06)'}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: bg }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 className="font-black mb-2" style={{ color: '#4a0028' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-3xl p-8 md:p-12" style={{ background: 'linear-gradient(135deg, #fff0f5, #fce4ec)', border: '1.5px solid #f8bbd0' }}>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: '#4a0028' }}>Frequently Asked Questions</h2>
          <p className="font-medium" style={{ color: '#c2185b' }}>Everything you need to know about Tripzo</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid #f8bbd0', boxShadow: '0 2px 10px rgba(194,24,91,0.05)' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-bold pr-4" style={{ color: '#4a0028' }}>{faq.q}</span>
                <FiChevronDown
                  className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                  style={{ color: '#c2185b', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed pt-3" style={{ color: '#64748b', borderTop: '1px solid #fff0f5' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
