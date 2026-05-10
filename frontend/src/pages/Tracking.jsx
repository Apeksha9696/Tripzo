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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/simulated-route`);
        if (response.data.success && response.data.route) {
          setSimulationRoute(response.data.route);
        }
      } catch (error) {
        console.error('Fetch route failed', error);
      }
    };

    const fetchStoppages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/route-stoppages`);
        if (response.data.success && response.data.stoppages) {
          setStoppages(response.data.stoppages);
        }
      } catch (error) {
        console.error('Fetch stoppages failed', error);
      }
    };

    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/simulation-status`);
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/start-simulation`);
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/stop-simulation`);
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
  <div className="bg-gray-50 min-h-screen">
    <div className="max-w-[1400px] mx-auto px-6 pt-36 pb-10">

      {/* 🔥 STATUS CARD (FULL WIDTH) */}
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

          <div>
            <p className="text-sm text-gray-500 mb-1">Current Status</p>

            <h2 className="text-3xl font-bold text-gray-900">
              {simulationStatus.currentIndex === 0
                ? "Trip not started"
                : currentStoppage
                ? `At ${currentStoppage.name}`
                : "On the way"}
            </h2>

            <p className="text-gray-600 mt-2">
              {simulationStatus.currentIndex === 0
                ? "Waiting for driver to start trip"
                : `Next: ${nextStoppage?.name || "Final Stop"}`}
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-sm text-gray-500">ETA</p>
            <p className="text-2xl font-bold text-green-600">
              {simulationStatus.currentIndex === 0
                ? "--"
                : nextStoppage
                ? "10 min"
                : "Arriving"}
            </p>
          </div>

        </div>
      </div>

      {/* 🔥 GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 🔥 LEFT SIDE (JOURNEY - BIG) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Your Journey
          </h2>

          <div className="space-y-5">
            {stoppages.map((stop, idx) => {
              const isCompleted = simulationStatus.currentIndex > stop.index;
              const isCurrent = currentStoppage?.name === stop.name;

              return (
                <div key={idx} className="flex items-start gap-4">

                  {/* Indicator */}
                  <div className="mt-1">
                    <div className={`w-4 h-4 rounded-full ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-gray-300"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {stop.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {simulationStatus.currentIndex === 0
                        ? "Not started"
                        : isCompleted
                        ? "Passed"
                        : isCurrent
                        ? "Current Stop"
                        : "Upcoming"}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 🔥 RIGHT SIDE (INFO PANEL) */}
        <div className="space-y-6">

          {/* Movement Card */}
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                simulationStatus.currentIndex === 0
                  ? "bg-gray-400"
                  : "bg-green-500 animate-pulse"
              }`} />
              <p className="text-sm font-medium text-gray-700">
                {simulationStatus.currentIndex === 0
                  ? "Trip not started"
                  : "Live Tracking Active"}
              </p>
            </div>

            <p className="text-gray-600 text-sm">
              {simulationStatus.currentIndex === 0
                ? "Driver has not started the trip yet"
                : `Bus is moving towards ${nextStoppage?.name || "destination"}`}
            </p>
          </div>

          {/* Current / Next Stop */}
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="font-bold text-gray-900">
                  {currentStoppage?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Next</p>
                <p className="font-bold text-gray-900">
                  {nextStoppage?.name || "—"}
                </p>
              </div>

            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Trip Progress</p>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    simulationStatus.totalPoints
                      ? (simulationStatus.currentIndex / simulationStatus.totalPoints) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
);
}
