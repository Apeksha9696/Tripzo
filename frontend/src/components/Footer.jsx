import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const sections = [
  { title: 'Platform', links: [{ label: 'Search Buses', to: '/' }, { label: 'Live Tracking', to: '/tracking' }, { label: 'Special Offers', to: '/' }] },
  { title: 'Portals', links: [{ label: 'My Bookings', to: '/my-bookings' }, { label: 'Driver Dashboard', to: '/driver-dashboard' }, { label: 'Admin Console', to: '/admin-dashboard' }] },
  { title: 'Support', links: [{ label: 'Help Center', to: '/help' }, { label: 'Report an Issue', to: '/help' }, { label: 'System Status', to: '/help' }] },
];

const socials = [
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaGithub, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #4a0028 0%, #880e4f 100%)', color: '#fff' }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12" style={{ borderBottom: '1px solid rgba(244,143,177,0.2)' }}>

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
                <FaBus className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black">
                <span className="text-white">Track</span>
                <span style={{ color: '#f48fb1' }}>Routz</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: '#f8bbd0' }}>
              India's next-generation bus booking & real-time tracking platform. Connecting passengers, drivers, and operators seamlessly.
            </p>
            <div className="space-y-2 text-sm" style={{ color: '#f8bbd0' }}>
              {[
                { icon: FiMail, text: 'support@tripzo.in' },
                { icon: FiPhone, text: '+91 98765 43210' },
                { icon: FiMapPin, text: 'Chandigarh, India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: '#f48fb1' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-black text-white text-sm uppercase tracking-widest mb-5">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm font-medium transition-colors" style={{ color: '#f8bbd0' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f48fb1'}
                      onMouseLeave={e => e.currentTarget.style.color = '#f8bbd0'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#f48fb1' }}>
            &copy; {new Date().getFullYear()} Tripzo Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(244,143,177,0.12)', color: '#f48fb1' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#c2185b'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,143,177,0.12)'; e.currentTarget.style.color = '#f48fb1'; }}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
