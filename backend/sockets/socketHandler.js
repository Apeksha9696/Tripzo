// sockets/socketHandler.js
const { startSimulation, stopSimulation } = require('../utils/simulation');

// In-memory storage for driver locations (from global)
const driverLocations = global.driverLocations;

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Optional: Client can join a room for specific driver updates
    socket.on('join-driver-room', (driverId) => {
      socket.join(`driver-${driverId}`);
      console.log(`Client ${socket.id} joined room for driver ${driverId}`);
    });

    // Optional: Client can leave a room
    socket.on('leave-driver-room', (driverId) => {
      socket.leave(`driver-${driverId}`);
      console.log(`Client ${socket.id} left room for driver ${driverId}`);
    });
  });

  // Function to emit location update (called from controller)
  const emitLocationUpdate = (busId, location) => {
    const payload = {
      busId,
      ...location
    };

    // Emit to all clients
    io.emit('locationUpdate', payload);

    // Also emit to a room for this bus if clients are listening
    io.to(`bus-${busId}`).emit('locationUpdate', payload);
  };

  // Function to start simulation (with io instance)
  const startSimWithIO = () => {
    return startSimulation(io);
  };

  return {
    emitLocationUpdate,
    startSimWithIO,
    driverLocations // Export for use in controller if needed
  };
};