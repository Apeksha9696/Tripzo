import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Map from '../components/Map';
import axios from 'axios';
import { FaMapMarkerAlt } from 'react-icons/fa';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };
const ANIMATION_DURATION = 1200;

const interpolate = (start, end, progress) => ({
  lat: start.lat + (end.lat - start.lat) * progress,
  lng: start.lng + (end.lng - start.lng) * progress,
});

const easeOutQuad = (t) => t * (2 - t);

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const { socket, isConnected } = useSocket();
  const [liveLocations, setLiveLocations] = useState({});
  const [simulationLocation, setSimulationLocation] = useState(null);
  const [simulationRoute, setSimulationRoute] = useState([]);
  const [stoppages, setStoppages] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [mode, setMode] = useState('live');
  const [simulationStatus, setSimulationStatus] = useState({ isRunning: false, currentIndex: 0, totalPoints: 0 });
  const [activityMessage, setActivityMessage] = useState('Live mode enabled');
  const [activePosition, setActivePosition] = useState(DEFAULT_CENTER);
  const animationFrameRef = useRef(null);
  const currentPositionRef = useRef(DEFAULT_CENTER);
  const busIdFilter = searchParams.get('busId');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  // Calculate current stoppage based on simulation progress
  const currentStoppage = useMemo(() => {
    if (!simulating || simulationStatus.currentIndex === 0) return null;
    
    const active = stoppages.findIndex(
      stop => simulationStatus.currentIndex >= stop.index && 
      (stoppages.indexOf(stop) === stoppages.length - 1 || 
       simulationStatus.currentIndex < stoppages[stoppages.indexOf(stop) + 1].index)
    );
    
    return active >= 0 ? stoppages[active] : null;
  }, [simulating, simulationStatus.currentIndex, stoppages]);

  // Calculate next stoppage
  const nextStoppage = useMemo(() => {
    if (!simulating) return null;
    const nextIdx = stoppages.findIndex(
      stop => simulationStatus.currentIndex < stop.index
    );
    return nextIdx >= 0 ? stoppages[nextIdx] : null;
  }, [simulating, simulationStatus.currentIndex, stoppages]);

  const locationEntries = useMemo(() => {
    return Object.entries(liveLocations).filter(([id]) => !busIdFilter || id === busIdFilter);
  }, [liveLocations, busIdFilter]);

  const modeStyles = mode === 'live'
    ? { label: 'Live', badge: 'bg-brand-bg text-emerald-900', dot: 'bg-brand-primary' }
    : { label: 'Simulation', badge: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' };

  const animateTo = (target) => {
    if (!target) return;
    cancelAnimationFrame(animationFrameRef.current);
    const start = currentPositionRef.current || target;
    const startTime = performance.now();

    const animate = (timestamp) => {
      const elapsed = Math.min((timestamp - startTime) / ANIMATION_DURATION, 1);
      const eased = easeOutQuad(elapsed);
      const nextPosition = interpolate(start, target, eased);
      currentPositionRef.current = nextPosition;
      setActivePosition(nextPosition);
      if (elapsed < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/simulated-route');
        if (response.data.success && response.data.route) {
          setSimulationRoute(response.data.route);
        }
      } catch (error) {
        console.error('Fetch route failed', error);
      }
    };

    const fetchStoppages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/route-stoppages');
        if (response.data.success && response.data.stoppages) {
          setStoppages(response.data.stoppages);
        }
      } catch (error) {
        console.error('Fetch stoppages failed', error);
      }
    };

    const fetchStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/simulation-status');
        if (response.data.success && response.data.status) {
          setSimulationStatus(response.data.status);
          setSimulating(response.data.status.isRunning);
        }
      } catch (error) {
        console.error('Fetch status failed', error);
      }
    };

    fetchRoute();
    fetchStoppages();
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const handleLocationUpdate = (data) => {
      const id = data.busId || data.driverId;
      const location = { ...data, id };
      setLiveLocations(prev => ({ ...prev, [id]: location }));

      if (mode === 'live' && (!busIdFilter || id === busIdFilter)) {
        animateTo({ lat: location.lat, lng: location.lng });
        setActivityMessage('Receiving live GPS updates');
      }
    };

    const handleSimulationUpdate = (data) => {
      const location = { ...data, id: data.busId || data.driverId };
      setSimulationLocation(location);
      if (mode === 'simulation') {
        animateTo({ lat: location.lat, lng: location.lng });
        setActivityMessage('Demo simulation running');
      }
    };

    socket.on('locationUpdate', handleLocationUpdate);
    socket.on('simulationUpdate', handleSimulationUpdate);

    return () => {
      socket.off('locationUpdate', handleLocationUpdate);
      socket.off('simulationUpdate', handleSimulationUpdate);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [socket, mode, busIdFilter]);

  useEffect(() => {
    if (mode === 'simulation' && simulationLocation) {
      animateTo({ lat: simulationLocation.lat, lng: simulationLocation.lng });
    }
  }, [mode, simulationLocation]);

  const startSimulation = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/start-simulation');
      if (response.data.success) {
        setSimulating(true);
        setSimulationStatus(prev => ({ ...prev, isRunning: true }));
        setMode('simulation');
        setActivityMessage('Simulation started');
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const stopSimulation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/stop-simulation');
      if (response.data.success) {
        setSimulating(false);
        setSimulationStatus(prev => ({ ...prev, isRunning: false }));
        setActivityMessage('Simulation stopped');
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  const switchMode = (nextMode) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
      return;
    }
    if (nextMode === mode) return;
    setMode(nextMode);
    if (nextMode === 'live') {
      setActivityMessage('Live mode enabled');
      if (simulationStatus.isRunning) {
        stopSimulation();
      }
    } else {
      setActivityMessage('Simulation mode ready');
      if (!simulationStatus.isRunning) {
        startSimulation();
      }
    }
  };

  const markers = mode === 'simulation'
    ? simulationLocation ? [{
      position: { lat: simulationLocation.lat, lng: simulationLocation.lng },
      title: 'Demo bus',
      color: '#0f766e',
      label: { text: '🚍', color: '#fff', fontSize: '16px' }
    }] : []
    : locationEntries.map(([id, loc]) => ({
      position: { lat: loc.lat, lng: loc.lng },
      title: `Bus ${id}`,
      color: '#2563eb',
      label: { text: '🚌', color: '#fff', fontSize: '12px' }
    }));

  const primaryMarker = activePosition ? {
    position: activePosition,
    title: mode === 'simulation' ? 'Simulation bus' : 'Live tracker',
    color: mode === 'simulation' ? '#0f766e' : '#2563eb',
    label: { text: mode === 'simulation' ? '🚍' : '🟢', color: '#fff', fontSize: '16px' }
  } : null;

  const mapCenter = activePosition || DEFAULT_CENTER;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">{busIdFilter ? `Tracking Bus ${busIdFilter}` : 'Live Bus Tracking'}</h1>
          <p className="max-w-2xl text-gray-600 leading-7">Toggle between real GPS tracking and a demo route animation that runs smoothly with professional controls.</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-4 shadow-sm flex items-center gap-4">
          <span className={`w-3 h-3 rounded-full ${modeStyles.dot}`} />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Mode</p>
            <p className={`font-black ${modeStyles.badge}`}>{modeStyles.label}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr] mb-8">
        <section className="section-card p-6 animate-fadeInUp">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2">Tracking controls</p>
              <h2 className="text-2xl font-black text-gray-900">Live & Demo mode</h2>
            </div>
            <div className="inline-flex rounded-full bg-gray-100 p-1 shadow-sm">
              <button
                onClick={() => switchMode('live')}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${mode === 'live' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
              >Live Mode</button>
              <button
                onClick={() => switchMode('simulation')}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${mode === 'simulation' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
              >Simulation Mode</button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2">Connection</p>
              <p className="text-lg font-black text-gray-900">{isConnected ? 'Connected to server' : 'Disconnected'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Status</p>
              <p className="text-lg font-black text-slate-900">{activityMessage}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={startSimulation}
              disabled={simulating}
              className="btn-primary px-6 py-4 disabled:cursor-not-allowed disabled:opacity-60"
            >Start Simulation</button>
            <button
              onClick={stopSimulation}
              className="btn-secondary px-6 py-4"
            >Stop Simulation</button>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Current feed</p>
              <p className="text-lg font-black text-slate-900">{mode === 'live' ? `${locationEntries.length} active driver update${locationEntries.length === 1 ? '' : 's'}` : `${simulationRoute.length} route points`}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Simulation state</p>
              <p className="text-lg font-black text-slate-900">{simulationStatus.isRunning ? 'Running' : 'Stopped'}</p>
              <p className="text-sm text-slate-500">{simulationStatus.currentIndex} / {simulationStatus.totalPoints}</p>
            </div>
          </div>
        </section>

        <section className="section-card p-6 animate-fadeInUp">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Recent updates</p>
              <h2 className="text-2xl font-black text-slate-900">Latest positions</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{mode === 'live' ? 'Live feed' : 'Demo feed'}</div>
          </div>

          <div className="space-y-3">
            {(mode === 'live' ? locationEntries : [simulationLocation]).filter(Boolean).map((loc) => (
              <div key={loc.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{mode === 'live' ? `Bus ${loc.id}` : 'Demo vehicle'}</p>
                    <p className="text-xl font-black text-slate-900">Lat {loc.lat.toFixed(4)}, Lng {loc.lng.toFixed(4)}</p>
                  </div>
                  <span className="text-sm text-slate-500">{new Date(loc.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {mode === 'live' && locationEntries.length === 0 && (
              <p className="text-slate-500">Waiting for live driver location updates...</p>
            )}
            {mode === 'simulation' && !simulationLocation && (
              <p className="text-slate-500">Start the demo to see the route animate.</p>
            )}
          </div>
        </section>
      </div>

      {/* Route Stoppages Section */}
      {mode === 'simulation' && stoppages.length > 0 && (
        <div className="mb-8 animate-fadeInUp">
          <div className="rounded-3xl border-2 border-slate-900 bg-slate-900 px-8 py-6 shadow-xl mb-6">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <FaMapMarkerAlt className="w-8 h-8" />
              Route Stoppages
            </h2>
          </div>

          <div className="rounded-3xl border-2 border-slate-100 bg-white p-8 shadow-lg">
            <div className="space-y-0">
              {stoppages.map((stoppage, idx) => {
                const isCompleted = simulationStatus.currentIndex > stoppage.index;
                const isCurrent = currentStoppage?.name === stoppage.name;
                const isNext = nextStoppage?.name === stoppage.name;

                return (
                  <div key={idx} className="flex gap-6 pb-8 last:pb-0">
                    {/* Timeline Indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full border-4 transition-all ${
                          isCompleted
                            ? 'bg-brand-primary border-brand-primary'
                            : isCurrent
                            ? 'bg-amber-400 border-amber-400 ring-4 ring-amber-200 animate-pulse'
                            : isNext
                            ? 'bg-slate-300 border-slate-400 ring-2 ring-slate-200'
                            : 'bg-slate-200 border-slate-300'
                        }`}
                      />
                      {idx !== stoppages.length - 1 && (
                        <div
                          className={`w-1 h-16 mt-2 transition-colors ${
                            isCompleted ? 'bg-brand-primary' : isCurrent ? 'bg-amber-400' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Stoppage Content */}
                    <div className="flex-1 pt-1">
                      <div
                        className={`rounded-2xl px-6 py-4 transition-all ${
                          isCurrent
                            ? 'bg-amber-50 border-2 border-amber-300 shadow-md'
                            : isCompleted
                            ? 'bg-brand-bg border-2 border-emerald-200'
                            : isNext
                            ? 'bg-slate-50 border-2 border-slate-200'
                            : 'bg-slate-50 border-2 border-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-black text-slate-900">{stoppage.name}</h3>
                            <p
                              className={`text-sm mt-1 ${
                                isCurrent || isCompleted ? 'font-bold' : 'font-semibold'
                              } ${
                                isCompleted
                                  ? 'text-brand-dark'
                                  : isCurrent
                                  ? 'text-amber-700'
                                  : 'text-slate-600'
                              }`}
                            >
                              Arrival: {stoppage.arrival}
                            </p>
                          </div>
                          <div>
                            {isCompleted && (
                              <span className="inline-block bg-brand-primary text-white text-xs font-black px-3 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                            {isCurrent && (
                              <span className="inline-block bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                                Current Stop
                              </span>
                            )}
                            {isNext && (
                              <span className="inline-block bg-slate-300 text-slate-700 text-xs font-black px-3 py-1 rounded-full">
                                Next Stop
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="section-card overflow-hidden shadow-xl animate-fadeInUp">
        <Map
          apiKey={apiKey}
          center={mapCenter}
          zoom={13}
          primaryMarker={primaryMarker}
          markers={mode === 'live' ? markers : []}
          route={mode === 'simulation' ? simulationRoute : []}
        />
      </div>
    </div>
  );
}
