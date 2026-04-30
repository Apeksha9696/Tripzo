import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaUserTie, FaTags, FaTrash, FaPlus, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { FiUsers, FiTag, FiLogOut, FiHome } from 'react-icons/fi';

const AdminInput = ({ label, type="text", value, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-black uppercase tracking-widest text-primary-light mb-1.5">{label}</label>
    <input 
      type={type} required 
      className="w-full border border-primary-pale rounded-2xl px-5 py-3 text-primary-deep font-bold focus:bg-white focus:border-primary-light focus:ring-4 focus:ring-primary-pale outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.6)' }}
      value={value} onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buses');
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [offers, setOffers] = useState([]);
  
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

  const [showBusForm, setShowBusForm] = useState(false);
  const [newBus, setNewBus] = useState({ 
    operatorName: '', busType: '', from: '', to: '', date: '', departureTime: '', arrivalTime: '', price: '', totalSeats: 40 
  });

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [newOffer, setNewOffer] = useState({ 
    title: '', description: '', code: '', validUntil: '' 
  });

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
        setNewBus({ operatorName: '', busType: '', from: '', to: '', date: '', departureTime: '', arrivalTime: '', price: '', totalSeats: 40 });
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
      const res = await fetch(`http://localhost:5001/api/admin/offers/${id}`, { method: 'DELETE', headers: { Authorization: token } });
      if (res.ok) fetchOffers();
    } catch (err) { console.error(err); }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to remove this driver?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/drivers/${id}`, { method: 'DELETE', headers: { Authorization: token } });
      if (res.ok) fetchDrivers();
    } catch (err) { console.error(err); }
  };

  // Sub-components for forms (moved outside to prevent re-renders)

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-bg">


      {/* Admin Top Bar */}
      <div className="relative z-20 flex justify-between items-center px-8 py-4 bg-white/40 backdrop-blur-md border-b border-primary-pale shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg, #c2185b, #f48fb1)' }}>
            <FaBus />
          </div>
          <span className="font-black text-primary-deep text-lg tracking-tight">Admin<span className="text-primary-light">Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-primary-dark/70 hidden sm:block">Welcome, {user.name}</span>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary-dark hover:bg-white/60 transition-colors">
            <FiHome /> Home
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-error bg-error/10 hover:bg-error hover:text-white transition-colors">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-primary-deep mb-3 tracking-tight">System Control <span className="text-gradient">Center</span></h1>
          <p className="text-primary-dark/70 font-semibold text-lg">Manage operations, fleet details, and user promos directly.</p>
        </motion.div>

        {/* TABS */}
        <div className="flex gap-4 mb-10 overflow-x-auto p-2 rounded-3xl border border-white shadow-[0_8px_32px_rgba(194,24,91,0.05)] inline-flex"
             style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
          {[
            { id: 'buses', label: 'Buses & Routes', icon: FaBus },
            { id: 'drivers', label: 'Personnel', icon: FaUserTie },
            { id: 'offers', label: 'Promotions', icon: FaTags }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-100' : 'bg-transparent text-primary-dark/60 hover:bg-white/50 hover:text-primary-deep scale-95'}`}>
              <tab.icon className={activeTab === tab.id ? "text-white" : "text-primary-light"} /> {tab.label}
            </button>
          ))}
        </div>

        {/* BUSES SECTION */}
        {activeTab === 'buses' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass p-8 rounded-[2rem] gap-6">
              <div>
                <h2 className="text-3xl font-black text-primary-deep mb-2">Fleet Operations</h2>
                <p className="text-primary-dark/70 font-semibold">Live inventory of buses and structured routes.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowBusForm(!showBusForm)} 
                className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-primary-light shadow-xl shadow-primary/20 transition-all">
                {showBusForm ? <FaTimes /> : <FaPlus />} {showBusForm ? 'Close Editor' : 'Register New Bus'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showBusForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleCreateBus} 
                  className="glass p-10 rounded-[2.5rem] overflow-hidden">
                  <h3 className="text-2xl font-black text-primary-deep mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center text-primary"><FaBus size={18} /></span>
                    Bus Registration Protocol
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                    <AdminInput label="Operator Name" value={newBus.operatorName} onChange={v => setNewBus({...newBus, operatorName: v})} />
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
                    className="mt-8 bg-primary-deep text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-colors w-full shadow-xl shadow-primary-deep/20 text-lg">
                    Deploy Bus to Fleet
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {buses.map((bus, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={bus._id} 
                  className="glass p-8 rounded-[2rem] relative group hover:shadow-[0_20px_40px_rgba(194,24,91,0.12)] hover:-translate-y-2 transition-all duration-300">
                  <button onClick={() => handleDeleteBus(bus._id)} className="absolute top-6 right-6 text-error hover:text-error/80 bg-error/10 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaTrash />
                  </button>
                  <div className="flex gap-2 mb-6">
                    <span className="bg-primary-pale text-primary-dark text-xs font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">{bus.operatorName}</span>
                    <span className="bg-slate-100 text-slate-600 text-xs font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">{bus.busType}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-primary-light uppercase tracking-widest mb-1">From</p>
                      <h3 className="text-xl font-black text-primary-deep leading-none">{bus.from}</h3>
                    </div>
                    <div className="w-8 flex justify-center text-primary-lighter"><FaMapMarkerAlt /></div>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-bold text-primary-light uppercase tracking-widest mb-1">To</p>
                      <h3 className="text-xl font-black text-primary-deep leading-none">{bus.to}</h3>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 mb-6 space-y-3" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <div className="flex items-center gap-3 text-sm font-bold text-primary-dark/80">
                      <FaCalendarAlt className="text-primary-light" /> {bus.date}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-primary-dark/80">
                      <FaClock className="text-primary-light" /> {bus.departureTime} - {bus.arrivalTime}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-5 border-t-2 border-primary-pale/50">
                    <div className="flex items-center gap-1">
                      <span className="text-3xl font-black text-primary-deep">₹{bus.price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary-light">
                      <FiUsers /> {bus.totalSeats} Seats
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DRIVERS SECTION */}
        {activeTab === 'drivers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            <div className="glass p-8 rounded-[2rem]">
              <h2 className="text-3xl font-black text-primary-deep mb-2">Personnel Registration</h2>
              <p className="text-primary-dark/70 font-semibold">Active driver accounts with portal access.</p>
            </div>
            
            <div className="glass rounded-[2rem] overflow-hidden border-2 border-primary-pale/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-primary/5 text-primary-dark font-black tracking-widest uppercase text-xs border-b-2 border-primary-pale">
                    <tr>
                      <th className="p-6">Personnel Name</th>
                      <th className="p-6">Registered Email</th>
                      <th className="p-6 text-right">System Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-primary-pale/50 font-semibold text-primary-deep">
                    {drivers.map(driver => (
                      <tr key={driver._id} className="hover:bg-white/40 transition-colors">
                        <td className="p-6 flex items-center gap-4 text-lg">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-light to-primary-lighter flex items-center justify-center text-white shadow-lg shadow-primary/20"><FaUserTie /></div>
                          {driver.name}
                        </td>
                        <td className="p-6 text-primary-dark/70">{driver.email}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleDeleteDriver(driver._id)} className="text-error hover:text-white bg-error/10 hover:bg-error px-5 py-2.5 rounded-xl text-sm font-black transition-all">Revoke Access</button>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass p-8 rounded-[2rem] gap-6">
              <div>
                <h2 className="text-3xl font-black text-primary-deep mb-2">Promotional Engine</h2>
                <p className="text-primary-dark/70 font-semibold">Create and distribute vouchers for customers.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowOfferForm(!showOfferForm)} 
                className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-primary-light shadow-xl shadow-primary/20 transition-all">
                {showOfferForm ? <FaTimes /> : <FaPlus />} {showOfferForm ? 'Discard Draft' : 'Construct Deal'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showOfferForm && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleCreateOffer} className="glass p-10 rounded-[2.5rem] overflow-hidden">
                  <h3 className="text-2xl font-black text-primary-deep mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center text-primary"><FiTag size={20} /></span>
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
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="mt-8 bg-primary-deep text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-colors shadow-xl shadow-primary-deep/20 text-lg w-full md:w-auto">
                    Launch Campaign
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-3 gap-8">
              {offers.map((offer, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={offer._id} 
                  className="relative group p-1 rounded-[2rem] bg-gradient-to-br from-primary-lighter via-[#fff8fb] to-primary-pale overflow-hidden">
                  <div className="glass h-full p-8 rounded-[1.85rem] transition-colors" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <button onClick={() => handleDeleteOffer(offer._id)} className="absolute top-6 right-6 text-error hover:text-error/80 bg-error/10 hover:bg-error/20 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10">
                      <FaTrash />
                    </button>
                    
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2 rounded-xl text-sm font-black tracking-widest mb-6 shadow-md shadow-primary/20">
                      <FiTag /> {offer.code}
                    </div>
                    
                    <h3 className="text-2xl font-black text-primary-deep mb-3 leading-tight">{offer.title}</h3>
                    <p className="text-primary-dark/70 font-semibold mb-6">{offer.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-black text-primary-light uppercase tracking-widest pt-5 border-t-2 border-primary-pale">
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
