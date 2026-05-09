import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBus, FaRupeeSign, FaSnowflake, FaWifi, FaChargingStation, FaBed } from 'react-icons/fa';
import { FiClock, FiArrowRight, FiMapPin, FiSunrise, FiSun, FiSunset, FiMoon, FiFilter, FiX } from 'react-icons/fi';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get('from');
  const to   = searchParams.get('to');
  const date = searchParams.get('date');
  
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [priceSort, setPriceSort] = useState(''); // 'low-to-high', 'high-to-low', ''
  const [selectedTimes, setSelectedTimes] = useState([]); // array of 'early', 'morning', 'afternoon', 'night'
  const [selectedTypes, setSelectedTypes] = useState([]); // array of strings like 'AC Seater', 'Non-AC Sleeper'

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/buses/search?from=${from}&to=${to}&date=${date}`);
        setBuses(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (from && to) fetchBuses();
  }, [from, to, date]);

  // Extract unique bus types for the filter sidebar
  const availableBusTypes = useMemo(() => {
    const types = new Set(buses.map(b => b.busType).filter(Boolean));
    return Array.from(types);
  }, [buses]);

  const handleTimeToggle = (timeId) => {
    setSelectedTimes(prev => prev.includes(timeId) ? prev.filter(t => t !== timeId) : [...prev, timeId]);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearFilters = () => {
    setSelectedTimes([]);
    setSelectedTypes([]);
    setPriceSort('');
  };

  const filteredBuses = useMemo(() => {
    let result = [...buses];

    // Filter by Time
    if (selectedTimes.length > 0) {
      result = result.filter(bus => {
        const timeStr = bus.departureTime;
        let hours = -1;
        if (timeStr) {
           const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
           if (match) {
              hours = parseInt(match[1]);
              const isPM = match[3] && match[3].toUpperCase() === 'PM';
              if (isPM && hours !== 12) hours += 12;
              if (!isPM && hours === 12) hours = 0;
           }
        }
        
        if (hours === -1) return true; // Include if time cannot be parsed

        return selectedTimes.some(timeId => {
          if (timeId === 'early') return hours >= 0 && hours < 6; // 12 AM - 6 AM
          if (timeId === 'morning') return hours >= 6 && hours < 12; // 6 AM - 12 PM
          if (timeId === 'afternoon') return hours >= 12 && hours < 18; // 12 PM - 6 PM
          if (timeId === 'night') return hours >= 18 && hours <= 24; // 6 PM - 12 AM
          return false;
        });
      });
    }

    // Filter by Type
    if (selectedTypes.length > 0) {
      result = result.filter(bus => selectedTypes.includes(bus.busType));
    }

    // Sort
    if (priceSort === 'low-to-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-to-low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [buses, selectedTimes, selectedTypes, priceSort]);

  const activeFilterCount = selectedTimes.length + selectedTypes.length + (priceSort ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header / Route Summary */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{from}</span>
              <FiArrowRight className="w-5 h-5 text-slate-400" />
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{to}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <FiClock className="w-4 h-4 text-teal-500" />
              <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-bold text-sm border border-teal-100 shadow-sm text-center">
            {filteredBuses.length} Buses Found
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiFilter className="text-teal-500" /> Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                    CLEAR ALL
                  </button>
                )}
              </div>

              {/* Departure Time Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Departure Time</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'early', label: 'Before 6 AM', icon: FiSunrise },
                    { id: 'morning', label: '6 AM - 12 PM', icon: FiSun },
                    { id: 'afternoon', label: '12 PM - 6 PM', icon: FiSunset },
                    { id: 'night', label: 'After 6 PM', icon: FiMoon },
                  ].map(time => {
                    const isActive = selectedTimes.includes(time.id);
                    const Icon = time.icon;
                    return (
                      <button
                        key={time.id}
                        onClick={() => handleTimeToggle(time.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                          isActive ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold text-center">{time.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bus Type Filter */}
              {availableBusTypes.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Bus Type</h4>
                  <div className="space-y-3">
                    {availableBusTypes.map(type => {
                      const isActive = selectedTypes.includes(type);
                      return (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isActive} 
                            onChange={() => handleTypeToggle(type)} 
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isActive ? 'bg-teal-500 border-teal-500' : 'bg-white border-slate-300 group-hover:border-teal-400'
                          }`}>
                            {isActive && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1">
            
            {/* Sorting Toolbar */}
            {!loading && buses.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 flex overflow-hidden">
                <button
                  onClick={() => setPriceSort('')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${priceSort === '' ? 'bg-teal-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Recommended
                </button>
                <div className="w-px bg-slate-200"></div>
                <button
                  onClick={() => setPriceSort('low-to-high')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${priceSort === 'low-to-high' ? 'bg-teal-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Price: Low to High
                </button>
                <div className="w-px bg-slate-200"></div>
                <button
                  onClick={() => setPriceSort('high-to-low')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${priceSort === 'high-to-low' ? 'bg-teal-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Price: High to Low
                </button>
              </div>
            )}

            {/* Loading / Empty / Results */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-24 text-center">
                <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 border-teal-100 border-t-teal-500" />
                <p className="text-slate-500 font-medium">Fetching best routes for you...</p>
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                  <FaBus className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">No buses found</h2>
                <p className="text-slate-500">
                  {buses.length > 0 ? "Try adjusting your filters to see more results." : "We couldn't find any buses for this route on the selected date."}
                </p>
                {buses.length > 0 && (
                  <button onClick={clearFilters} className="mt-6 px-6 py-2.5 bg-teal-500 text-white font-bold rounded-xl shadow-md hover:bg-teal-600 transition-colors">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {filteredBuses.map((bus, idx) => {
                  const isAC = bus.busType?.toLowerCase().includes('ac') && !bus.busType?.toLowerCase().includes('non-ac');
                  const isSleeper = bus.busType?.toLowerCase().includes('sleeper');
                  return (
                    <motion.div key={bus._id}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all overflow-hidden group"
                    >
                      <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* Bus Details */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-black text-slate-800 mb-1 truncate group-hover:text-teal-600 transition-colors">{bus.operatorName}</h2>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                              <FaBus className="text-slate-400" /> {bus.busType}
                            </span>
                            {/* Dummy ratings for professional look */}
                            <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                              ★ 4.5
                            </span>
                          </div>
                          
                          {/* Amenities Tags */}
                          <div className="flex gap-4 text-slate-400">
                            {isAC && <div className="flex items-center gap-1.5 text-xs font-medium" title="Air Conditioning"><FaSnowflake className="text-sky-400" /> A/C</div>}
                            {isSleeper && <div className="flex items-center gap-1.5 text-xs font-medium" title="Sleeper Seats"><FaBed className="text-indigo-400" /> Sleeper</div>}
                            <div className="flex items-center gap-1.5 text-xs font-medium"><FaWifi /> WiFi</div>
                            <div className="flex items-center gap-1.5 text-xs font-medium"><FaChargingStation /> Power Outlets</div>
                          </div>
                        </div>

                        {/* Timing Details */}
                        <div className="flex-1 flex items-center justify-center gap-6">
                          <div className="text-right">
                            <p className="text-2xl font-black text-slate-800">{bus.departureTime}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{bus.from}</p>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 mb-1">---</span>
                            <div className="flex items-center w-24">
                              <div className="w-2 h-2 rounded-full bg-teal-500" />
                              <div className="flex-1 h-[2px] bg-slate-200 relative">
                                <div className="absolute inset-0 bg-teal-500 opacity-20" />
                              </div>
                              <div className="w-2 h-2 rounded-full border-2 border-teal-500 bg-white" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">---</span>
                          </div>

                          <div className="text-left">
                            <p className="text-2xl font-black text-slate-800">{bus.arrivalTime}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{bus.to}</p>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex-shrink-0 flex flex-col items-end border-l-0 lg:border-l border-slate-100 lg:pl-6">
                          <div className="text-sm font-medium text-slate-400 line-through mb-1 flex items-center">
                             <FaRupeeSign className="w-3 h-3" />
                             {Math.floor(bus.price * 1.2)}
                          </div>
                          <div className="flex items-center text-3xl font-black text-slate-800 mb-4">
                            <FaRupeeSign className="w-6 h-6 text-teal-500" />
                            {bus.price}
                          </div>
                          <button onClick={() => navigate(`/bus/${bus._id}`)}
                            className="w-full sm:w-auto px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(45,212,191,0.39)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.23)] hover:-translate-y-0.5"
                          >
                            View Seats
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
