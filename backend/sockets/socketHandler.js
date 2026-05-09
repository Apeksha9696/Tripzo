// sockets/socketHandler.js
const { startSimulation, stopSimulation } = require('../utils/simulation');

// In-memory storage
const driverLocations = global.driverLocations || {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    /* ===============================
       JOIN BUS ROOM (USER SIDE)
    =============================== */
    socket.on('join-bus', (busId) => {
      if (!busId) return;

      socket.join(`bus-${busId}`);
      console.log(`📍 ${socket.id} joined bus-${busId}`);
    });

    socket.on('leave-bus', (busId) => {
      socket.leave(`bus-${busId}`);
      console.log(`🚪 ${socket.id} left bus-${busId}`);
    });

    /* ===============================
       DRIVER LOCATION UPDATE
    =============================== */
    socket.on('driverLocationUpdate', ({ busId, lat, lng }) => {
      if (!busId || lat == null || lng == null) {
        console.warn('⚠️ Invalid location data received');
        return;
      }

      const locationData = {
        lat,
        lng,
        timestamp: new Date(),
      };

      // Store latest location
      driverLocations[busId] = locationData;

      const payload = {
        busId,
        ...locationData,
      };

      // Emit ONLY to users tracking this bus
      io.to(`bus-${busId}`).emit('locationUpdate', payload);

      console.log(`📡 Location update for bus ${busId}`);
    });

    /* ===============================
       DISCONNECT
    =============================== */
    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  /* ===============================
     EXTERNAL EMITTER (Controller)
  =============================== */
  const emitLocationUpdate = (busId, location) => {
    if (!busId || !location) return;

    const payload = {
      busId,
      ...location,
    };

    // Emit only to relevant room
    io.to(`bus-${busId}`).emit('locationUpdate', payload);
  };

  /* ===============================
     SIMULATION CONTROL
  =============================== */
  const startSimWithIO = () => startSimulation(io);
  const stopSimWithIO = () => stopSimulation(io);

  return {
    emitLocationUpdate,
    startSimWithIO,
    stopSimWithIO,
    driverLocations,
  };
};