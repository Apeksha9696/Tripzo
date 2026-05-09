import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaUserTie, FaTags, FaTrash, FaPlus, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { FiUsers, FiTag, FiLogOut, FiHome, FiSearch, FiEdit2, FiTrash2, FiArrowRight } from 'react-icons/fi';

const AdminInput = ({ label, type="text", value, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
    <input 
      type={type} required 
      className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none transition-all"
      style={{ background: '#f8fafc' }}
      value={value} onChange={e => onChange(e.target.value)}
    />
  </div>
);

const AdminSelect = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
    <select 
      className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-slate-800 font-bold focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none transition-all appearance-none"
      style={{ background: '#f8fafc' }}
      value={value} onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buses');
  
  // Data State
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [offers, setOffers] = useState([]);
  
  // Controls & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('All');
  const [busTypeFilter, setBusTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('departureTime');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchOffers();
  }, [activeTab]);

  const fetchBuses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/buses', { headers: { Authorization: token } });
      if (res.ok) setBuses(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/drivers', { headers: { Authorization: token } });
      if (res.ok) setDrivers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/offers');
      if (res.ok) setOffers(await res.json());
    } catch (err) { console.error(err); }
  };

  // Form states
  const [showBusForm, setShowBusForm] = useState(false);
  const [newBus, setNewBus] = useState({ 
    operatorName: '', busName: '', busType: '', from: '', to: '', date: '', departureTime: '', arrivalTime: '', price: '', totalSeats: 40 
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [newOffer, setNewOffer] = useState({ 
    title: '', description: '', code: '', validUntil: '' 
  });

  const [showDriverForm, setShowDriverForm] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', email: '', password: '' });

  // --- Bus Filtering & Sorting Logic ---
  const uniqueRoutes = useMemo(() => [...new Set(buses.map(b => `${b.from} - ${b.to}`))], [buses]);
  const uniqueBusTypes = useMemo(() => [...new Set(buses.map(b => b.busType))], [buses]);

  const { filteredBuses, currentBuses, totalPages } = useMemo(() => {
    let filtered = buses.filter(bus => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        bus.busName?.toLowerCase().includes(searchLower) || 
        bus.operatorName?.toLowerCase().includes(searchLower) || 
        bus.from.toLowerCase().includes(searchLower) || 
        bus.to.toLowerCase().includes(searchLower);
      
      const matchesRoute = routeFilter === 'All' || `${bus.from} - ${bus.to}` === routeFilter;
      const matchesType = busTypeFilter === 'All' || bus.busType === busTypeFilter;
      const matchesStatus = statusFilter === 'All' || (bus.status || 'Active') === statusFilter;

      return matchesSearch && matchesRoute && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'departureTime') return a.departureTime.localeCompare(b.departureTime);
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'seats') {
        const aAvailable = a.totalSeats - (a.bookedSeats?.length || 0);
        const bAvailable = b.totalSeats - (b.bookedSeats?.length || 0);
        return bAvailable - aAvailable;
      }
      return 0;
    });

    const totalPagesCount = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return { filteredBuses: filtered, currentBuses: paginated, totalPages: totalPagesCount };
  }, [buses, searchQuery, routeFilter, busTypeFilter, statusFilter, sortBy, currentPage]);

  // --- CRUD Operations ---
  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(newBus)
      });
      if (res.ok) {
        fetchBuses();
        setShowBusForm(false);
        setNewBus({ operatorName: '', busName: '', busType: '', from: '', to: '', date: '', departureTime: '', arrivalTime: '', price: '', totalSeats: 40 });
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateBus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/admin/buses/${editingBus._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(editingBus)
      });
      if (res.ok) {
        fetchBuses();
        setShowEditModal(false);
        setEditingBus(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/buses/${id}`, { method: 'DELETE', headers: { Authorization: token } });
      if (res.ok) fetchBuses();
    } catch (err) { console.error(err); }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(newOffer)
      });
      if (res.ok) {
        fetchOffers();
        setShowOfferForm(false);
        setNewOffer({ title: '', description: '', code: '', validUntil: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/offers/${id}`, { method: 'DELETE', headers: { Authorization: token } });
      if (res.ok) fetchOffers();
    } catch (err) { console.error(err); }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(newDriver)
      });
      if (res.ok) {
        fetchDrivers();
        setShowDriverForm(false);
        setNewDriver({ name: '', email: '', password: '' });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to register driver');
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to remove this driver?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/drivers/${id}`, { method: 'DELETE', headers: { Authorization: token } });
      if (res.ok) fetchDrivers();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-slate-50 font-sans pb-12">

      {/* Admin Top Bar */}
      <div className="relative z-20 flex justify-between items-center px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 14px rgba(45,212,191,0.3)' }}>
            <FaBus />
          </div>
          <span className="font-black text-slate-800 text-lg tracking-tight">Admin<span className="text-teal-500">Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500 hidden sm:block">Welcome, {user.name}</span>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            <FiHome /> Home
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-3 tracking-tight">
            System Control <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf, #0d9488)' }}>Center</span>
          </h1>
          <p className="text-slate-500 font-semibold text-lg">Manage operations, fleet details, and user promos directly.</p>
        </motion.div>

        {/* TABS */}
        <div className="flex gap-4 mb-10 overflow-x-auto p-2 rounded-3xl border border-slate-200 bg-white shadow-sm inline-flex">
          {[
            { id: 'buses', label: 'Buses & Routes', icon: FaBus },
            { id: 'drivers', label: 'Personnel', icon: FaUserTie },
            { id: 'offers', label: 'Promotions', icon: FaTags }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }} 
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-white shadow-md' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 scale-95'
              }`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', transform: 'scale(1)' } : {}}
            >
              <tab.icon className={activeTab === tab.id ? "text-white" : "text-slate-400"} /> {tab.label}
            </button>
          ))}
        </div>

        {/* BUSES SECTION */}
        {activeTab === 'buses' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 shadow-sm p-8 rounded-3xl gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Fleet Operations</h2>
                <p className="text-slate-500 font-semibold">Live inventory of buses and structured routes.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowBusForm(!showBusForm)} 
                className="text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 transition-all"
                style={showBusForm ? { background: '#64748b' } : { background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 14px rgba(45,212,191,0.3)' }}
              >
                {showBusForm ? <FaTimes /> : <FaPlus />} {showBusForm ? 'Close Editor' : 'Register New Bus'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showBusForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleCreateBus} 
                  className="bg-white border border-slate-200 shadow-sm p-10 rounded-3xl overflow-hidden">
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500"><FaBus size={18} /></span>
                    Bus Registration Protocol
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
                    <AdminInput label="Operator Name" value={newBus.operatorName} onChange={v => setNewBus({...newBus, operatorName: v})} />
                    <AdminInput label="Bus Name/Model" value={newBus.busName} onChange={v => setNewBus({...newBus, busName: v})} />
                    <AdminInput label="Bus Type (e.g. AC Sleeper)" value={newBus.busType} onChange={v => setNewBus({...newBus, busType: v})} />
                    <AdminInput label="Total Seats" type="number" value={newBus.totalSeats} onChange={v => setNewBus({...newBus, totalSeats: v})} />
                    <AdminInput label="Departure City" value={newBus.from} onChange={v => setNewBus({...newBus, from: v})} />
                    <AdminInput label="Destination City" value={newBus.to} onChange={v => setNewBus({...newBus, to: v})} />
                    <AdminInput label="Date" type="date" value={newBus.date} onChange={v => setNewBus({...newBus, date: v})} />
                    <AdminInput label="Departure Time" type="time" value={newBus.departureTime} onChange={v => setNewBus({...newBus, departureTime: v})} />
                    <AdminInput label="Arrival Time" type="time" value={newBus.arrivalTime} onChange={v => setNewBus({...newBus, arrivalTime: v})} />
                    <AdminInput label="Ticket Price (₹)" type="number" value={newBus.price} onChange={v => setNewBus({...newBus, price: v})} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                    className="mt-8 text-white px-10 py-4 rounded-2xl font-black transition-colors w-full shadow-lg shadow-teal-500/20 text-lg"
                    style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
                    Deploy Bus to Fleet
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* DATA TABLE SECTION */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              {/* Controls Toolbar */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search bus, operator, or city..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <select value={routeFilter} onChange={e => { setRouteFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none appearance-none cursor-pointer hover:bg-slate-50">
                    <option value="All">All Routes</option>
                    {uniqueRoutes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  
                  <select value={busTypeFilter} onChange={e => { setBusTypeFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none appearance-none cursor-pointer hover:bg-slate-50">
                    <option value="All">All Types</option>
                    {uniqueBusTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none appearance-none cursor-pointer hover:bg-slate-50">
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none appearance-none cursor-pointer hover:bg-slate-50">
                    <option value="departureTime">Sort by Time</option>
                    <option value="newest">Latest Added</option>
                    <option value="seats">Seat Availability</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-slate-50 text-slate-500 font-black tracking-widest uppercase text-xs border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-5 whitespace-nowrap">Bus & Operator</th>
                      <th className="p-5 whitespace-nowrap">Route</th>
                      <th className="p-5 whitespace-nowrap">Schedule</th>
                      <th className="p-5 whitespace-nowrap">Seats</th>
                      <th className="p-5 whitespace-nowrap">Status</th>
                      <th className="p-5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {currentBuses.map(bus => {
                      const status = bus.status || 'Active';
                      let statusColor = 'bg-teal-50 text-teal-600 border-teal-100';
                      if (status === 'Delayed') statusColor = 'bg-yellow-50 text-yellow-600 border-yellow-100';
                      if (status === 'Cancelled') statusColor = 'bg-red-50 text-red-600 border-red-100';
                      const availableSeats = bus.totalSeats - (bus.bookedSeats?.length || 0);

                      return (
                        <tr key={bus._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-5">
                            <div className="font-bold text-slate-800">{bus.operatorName}</div>
                            <div className="text-xs text-slate-500 mt-1">{bus.busType} • {bus.busName || 'Standard'}</div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{bus.from}</span>
                              <FiArrowRight className="text-slate-400" />
                              <span className="font-bold">{bus.to}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="text-sm font-bold text-slate-700">{bus.departureTime} - {bus.arrivalTime}</div>
                            <div className="text-xs text-slate-500 mt-1">{bus.date}</div>
                          </td>
                          <td className="p-5">
                            <div className="text-sm font-bold">{availableSeats} / {bus.totalSeats}</div>
                            <div className="text-xs text-slate-400 font-medium">Available</div>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2">
                            <button onClick={() => { setEditingBus({...bus, status: bus.status || 'Active'}); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                              <FiEdit2 />
                            </button>
                            <button onClick={() => handleDeleteBus(bus._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {currentBuses.length === 0 && (
                  <div className="p-12 text-center text-slate-500 font-semibold">
                    No buses found matching your criteria.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <span className="text-sm font-semibold text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBuses.length)} of {filteredBuses.length} entries
                  </span>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors shadow-sm">
                      Previous
                    </button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors shadow-sm">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EDIT MODAL */}
            <AnimatePresence>
              {showEditModal && editingBus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <FiEdit2 /> Edit Bus Details
                      </h3>
                      <button onClick={() => setShowEditModal(false)} className="text-teal-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                      <form id="edit-bus-form" onSubmit={handleUpdateBus} className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                        <AdminInput label="Operator Name" value={editingBus.operatorName} onChange={v => setEditingBus({...editingBus, operatorName: v})} />
                        <AdminInput label="Bus Name/Model" value={editingBus.busName} onChange={v => setEditingBus({...editingBus, busName: v})} />
                        <AdminInput label="Bus Type" value={editingBus.busType} onChange={v => setEditingBus({...editingBus, busType: v})} />
                        <AdminInput label="Total Seats" type="number" value={editingBus.totalSeats} onChange={v => setEditingBus({...editingBus, totalSeats: v})} />
                        <AdminInput label="Departure City" value={editingBus.from} onChange={v => setEditingBus({...editingBus, from: v})} />
                        <AdminInput label="Destination City" value={editingBus.to} onChange={v => setEditingBus({...editingBus, to: v})} />
                        <AdminInput label="Date" type="date" value={editingBus.date} onChange={v => setEditingBus({...editingBus, date: v})} />
                        <AdminInput label="Departure Time" type="time" value={editingBus.departureTime} onChange={v => setEditingBus({...editingBus, departureTime: v})} />
                        <AdminInput label="Arrival Time" type="time" value={editingBus.arrivalTime} onChange={v => setEditingBus({...editingBus, arrivalTime: v})} />
                        <AdminInput label="Ticket Price (₹)" type="number" value={editingBus.price} onChange={v => setEditingBus({...editingBus, price: v})} />
                        
                        <AdminSelect 
                          label="Operational Status" 
                          value={editingBus.status} 
                          onChange={v => setEditingBus({...editingBus, status: v})}
                          options={[
                            { value: 'Active', label: 'Active (On Time)' },
                            { value: 'Delayed', label: 'Delayed' },
                            { value: 'Cancelled', label: 'Cancelled' }
                          ]}
                        />
                      </form>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" form="edit-bus-form" className="px-8 py-3 rounded-xl font-black text-white hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/30" style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* DRIVERS SECTION */}
        {activeTab === 'drivers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 shadow-sm p-8 rounded-3xl gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Personnel Registration</h2>
                <p className="text-slate-500 font-semibold">Active driver accounts with portal access.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDriverForm(!showDriverForm)} 
                className="text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 transition-all"
                style={showDriverForm ? { background: '#64748b' } : { background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 14px rgba(45,212,191,0.3)' }}
              >
                {showDriverForm ? <FaTimes /> : <FaPlus />} {showDriverForm ? 'Close Form' : 'Register New Driver'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showDriverForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleCreateDriver} 
                  className="bg-white border border-slate-200 shadow-sm p-10 rounded-3xl overflow-hidden">
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500"><FaUserTie size={18} /></span>
                    New Driver Onboarding
                  </h3>
                  <div className="grid md:grid-cols-3 gap-x-8 gap-y-2">
                    <AdminInput label="Full Name" value={newDriver.name} onChange={v => setNewDriver({...newDriver, name: v})} />
                    <AdminInput label="Email Address" type="email" value={newDriver.email} onChange={v => setNewDriver({...newDriver, email: v})} />
                    <AdminInput label="Password" type="password" value={newDriver.password} onChange={v => setNewDriver({...newDriver, password: v})} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                    className="mt-8 text-white px-10 py-4 rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 text-lg w-full md:w-auto"
                    style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
                    Create Driver Account
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
            
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-black tracking-widest uppercase text-xs border-b border-slate-200">
                    <tr>
                      <th className="p-6">Personnel Name</th>
                      <th className="p-6">Registered Email</th>
                      <th className="p-6 text-right">System Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {drivers.map(driver => (
                      <tr key={driver._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 flex items-center gap-4 text-lg">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-500/20" style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}><FaUserTie /></div>
                          {driver.name}
                        </td>
                        <td className="p-6 text-slate-500">{driver.email}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleDeleteDriver(driver._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-5 py-2.5 rounded-xl text-sm font-black transition-all">Revoke Access</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* OFFERS SECTION */}
        {activeTab === 'offers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 shadow-sm p-8 rounded-3xl gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Promotional Engine</h2>
                <p className="text-slate-500 font-semibold">Create and distribute vouchers for customers.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowOfferForm(!showOfferForm)} 
                className="text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 transition-all"
                style={showOfferForm ? { background: '#64748b' } : { background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)', boxShadow: '0 4px 14px rgba(45,212,191,0.3)' }}
              >
                {showOfferForm ? <FaTimes /> : <FaPlus />} {showOfferForm ? 'Discard Draft' : 'Construct Deal'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showOfferForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleCreateOffer} 
                  className="bg-white border border-slate-200 shadow-sm p-10 rounded-3xl overflow-hidden">
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500"><FiTag size={20} /></span>
                    Promotion Construction
                  </h3>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                    <AdminInput label="Campaign Title" value={newOffer.title} onChange={v => setNewOffer({...newOffer, title: v})} />
                    <AdminInput label="Coupon Code" value={newOffer.code} onChange={v => setNewOffer({...newOffer, code: v})} />
                    <div className="md:col-span-2">
                      <AdminInput label="Short Description / Subtitle" value={newOffer.description} onChange={v => setNewOffer({...newOffer, description: v})} />
                    </div>
                    <AdminInput label="Expiration Date" type="date" value={newOffer.validUntil} onChange={v => setNewOffer({...newOffer, validUntil: v})} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                    className="mt-8 text-white px-10 py-4 rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 text-lg w-full md:w-auto"
                    style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
                    Launch Campaign
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-3 gap-8">
              {offers.map((offer, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={offer._id} 
                  className="relative group bg-white border border-slate-200 shadow-sm hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300">
                  <div className="p-8">
                    <button onClick={() => handleDeleteOffer(offer._id)} className="absolute top-6 right-6 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10">
                      <FaTrash />
                    </button>
                    
                    <div className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-black tracking-widest mb-6 shadow-md shadow-teal-500/20"
                      style={{ background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)' }}>
                      <FiTag /> {offer.code}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">{offer.title}</h3>
                    <p className="text-slate-500 font-semibold mb-6">{offer.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-black text-teal-600 uppercase tracking-widest pt-5 border-t border-slate-100">
                      <FaCalendarAlt /> Valid Until: {new Date(offer.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
