import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBus, FaRupeeSign } from 'react-icons/fa';
import { FiClock, FiArrowRight } from 'react-icons/fi';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/buses/search?from=${from}&to=${to}&date=${date}`);
        setBuses(res.data);
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setLoading(false);
      }
    };
    if (from && to) fetchBuses();
  }, [from, to, date]);

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ border: '1.5px solid #fce4ec', boxShadow: '0 4px 20px rgba(194,24,91,0.07)' }}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black" style={{ color: '#4a0028' }}>{from}</h1>
              <FiArrowRight className="w-5 h-5" style={{ color: '#c2185b' }} />
              <h1 className="text-2xl font-black" style={{ color: '#4a0028' }}>{to}</h1>
            </div>
            <p className="font-semibold text-sm flex items-center gap-2" style={{ color: '#94a3b8' }}>
              <FiClock className="w-4 h-4" /> {date}
            </p>
          </div>
          <div className="px-5 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
            {buses.length} Buses Found
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#f8bbd0', borderTopColor: 'transparent' }} />
            <p className="font-semibold" style={{ color: '#94a3b8' }}>Searching for routes...</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl" style={{ border: '1.5px solid #fce4ec' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fce4ec' }}>
              <FaBus className="w-8 h-8" style={{ color: '#c2185b' }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#4a0028' }}>No buses found</h2>
            <p className="font-semibold" style={{ color: '#94a3b8' }}>Try changing your search date or route.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map((bus) => (
              <div
                key={bus._id}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                style={{ border: '1.5px solid #fce4ec', boxShadow: '0 4px 20px rgba(194,24,91,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f48fb1'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(194,24,91,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#fce4ec'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(194,24,91,0.06)'; }}
              >
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #c2185b, #f48fb1)' }} />
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black mb-1 truncate" style={{ color: '#4a0028' }}>{bus.operatorName}</h2>
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-lg" style={{ background: '#fce4ec', color: '#c2185b' }}>
                      {bus.busType}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-center lg:px-6 lg:border-l lg:border-r" style={{ borderColor: '#fce4ec' }}>
                    <div>
                      <p className="text-2xl font-black" style={{ color: '#4a0028' }}>{bus.departureTime}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: '#94a3b8' }}>{bus.from}</p>
                    </div>
                    <div className="flex flex-col items-center px-3">
                      <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Route</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#c2185b' }} />
                        <div className="w-16 h-0.5" style={{ background: 'linear-gradient(90deg, #c2185b, #f48fb1)' }} />
                        <div className="w-2 h-2 rounded-full" style={{ background: '#f48fb1' }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black" style={{ color: '#4a0028' }}>{bus.arrivalTime}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: '#94a3b8' }}>{bus.to}</p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:items-end gap-3">
                    <div className="flex items-center text-2xl font-black" style={{ color: '#4a0028' }}>
                      <FaRupeeSign className="w-5 h-5 mr-0.5" style={{ color: '#c2185b' }} />
                      {bus.price}
                    </div>
                    <button
                      onClick={() => navigate(`/bus/${bus._id}`)}
                      className="px-6 py-2.5 rounded-xl font-black text-sm text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)', boxShadow: '0 4px 16px rgba(194,24,91,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(194,24,91,0.45)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(194,24,91,0.3)'}
                    >
                      View Seats
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
