import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';

const sections = [
  { title: 'Platform', links: [{ label: 'Search Buses', to: '/' }, { label: 'Live Tracking', to: '/tracking' }, { label: 'Special Offers', to: '/' }] },
  { title: 'Portals',  links: [{ label: 'My Bookings', to: '/my-bookings' }, { label: 'Driver Dashboard', to: '/driver-dashboard' }, { label: 'Admin Console', to: '/admin-dashboard' }] },
  { title: 'Support',  links: [{ label: 'Help Center', to: '/help' }, { label: 'Report an Issue', to: '/help' }, { label: 'System Status', to: '/help' }] },
];
const socials = [
  { icon: FaTwitter,  href: '#', label: 'Twitter'   },
  { icon: FaInstagram,href: '#', label: 'Instagram' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn'  },
  { icon: FaGithub,   href: '#', label: 'GitHub'    },
];

export default function Footer() {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10"
          style={{ borderBottom: '1px solid rgba(45,212,191,0.1)' }}>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#2dd4bf,#14b8a6)', boxShadow: '0 4px 12px rgba(45,212,191,0.3)' }}>
                <FaBus className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black" style={{ color: '#1a202c' }}>
                Trip<span style={{ color: '#2dd4bf' }}>zo</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: '#718096' }}>
              India's next-generation bus booking & real-time tracking platform. Connecting passengers, drivers, and operators seamlessly.
            </p>
            <div className="space-y-2.5">
              {[{ icon: FiMail, text: 'support@tripzo.in' }, { icon: FiPhone, text: '+91 98765 43210' }, { icon: FiMapPin, text: 'Chandigarh, India' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm" style={{ color: '#4a5568' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {sections.map(s => (
            <div key={s.title}>
              <h4 className="font-black text-xs uppercase tracking-widest mb-4" style={{ color: '#1a202c' }}>{s.title}</h4>
              <ul className="space-y-2.5">
                {s.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm flex items-center gap-1.5 group transition-colors" style={{ color: '#718096' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#2dd4bf'}
                      onMouseLeave={e => e.currentTarget.style.color = '#718096'}
                    >
                      <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#a0aec0' }}>
            &copy; {new Date().getFullYear()} Tripzo Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#2dd4bf'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(45,212,191,0.1)'; e.currentTarget.style.color = '#2dd4bf'; }}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
