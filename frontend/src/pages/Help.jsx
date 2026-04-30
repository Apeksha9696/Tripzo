import React from 'react';
import { FaEnvelope, FaPhone, FaRegCommentDots, FaRegQuestionCircle } from 'react-icons/fa';

export default function Help() {
  const faqs = [
    {
      q: 'Can I track the location of my booked bus online?',
      a: 'Yes! You can use the Tracking feature from the Bus Manifest to see real-time location. The tracking link is also sent via SMS 1 hour prior to departure.'
    },
    {
      q: 'What are the advantages of bus ticket booking with Tripzo?',
      a: 'Tripzo provides you with a seamless and premium booking experience, real-time seat mapping, verified operator ratings, and instant refunds upon cancellation.'
    },
    {
      q: 'How can I cancel my ticket?',
      a: 'You can manage your bookings through the "My Bookings" section. Simply click on an active booking and select "Cancel Ticket". Cancellation policies apply based on the operator.'
    },
    {
      q: 'Are government buses available on Tripzo?',
      a: 'Absolutely! We partner with several State RTCs including APSRTC, TSRTC, HRTC, UPSRTC, and many more, giving you the best government-backed travel options.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-10 w-full animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-brand-bg rounded-2xl flex justify-center items-center mx-auto mb-4 border border-emerald-100">
          <FaRegQuestionCircle className="w-8 h-8 text-brand-dark" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">How can we help?</h1>
        <p className="text-lg text-gray-500">Contact our 24/7 support or browse the frequently asked questions below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 text-center hover:border-emerald-300 transition-colors cursor-pointer shadow-sm">
          <FaPhone className="w-8 h-8 text-gray-700 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
          <p className="text-gray-500 text-sm">1800-123-4567</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 text-center hover:border-emerald-300 transition-colors cursor-pointer shadow-sm">
          <FaRegCommentDots className="w-8 h-8 text-gray-700 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-1">Chat Support</h3>
          <p className="text-gray-500 text-sm">Typical reply ~ 2 mins</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 text-center hover:border-emerald-300 transition-colors cursor-pointer shadow-sm">
          <FaEnvelope className="w-8 h-8 text-gray-700 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-1">Email</h3>
          <p className="text-gray-500 text-sm">support@tripzo.com</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <h4 className="font-bold text-gray-900 text-lg mb-2">{faq.q}</h4>
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
