// utils/simulation.js
// Predefined route for simulation (Delhi to Panipat route)
const route = [
  { lat: 28.6100, lng: 77.2000 },
  { lat: 28.6110, lng: 77.2010 },
  { lat: 28.6120, lng: 77.2020 },
  { lat: 28.6130, lng: 77.2030 },
  { lat: 28.6140, lng: 77.2040 },
  { lat: 28.6150, lng: 77.2050 },
  { lat: 28.6160, lng: 77.2060 },
  { lat: 28.6170, lng: 77.2070 },
  { lat: 28.6180, lng: 77.2080 },
  { lat: 28.6190, lng: 77.2090 },
];

// Route stoppages with arrival times
const stoppages = [
  { name: 'Delhi Central', arrival: '07:00', index: 0 },
  { name: 'Ambala', arrival: '07:15', index: 3 },
  { name: 'Karnal', arrival: '08:45', index: 6 },
  { name: 'Panipat', arrival: '09:30', index: 9 },
];

// Simulation state
let isSimulating = false;
let simulationInterval = null;
let currentIndex = 0;

// Function to start simulation
function startSimulation(io) {
  if (isSimulating) {
    return { success: false, message: 'Simulation already running' };
  }

  isSimulating = true;
  currentIndex = 0;

  simulationInterval = setInterval(() => {
    if (currentIndex < route.length) {
      const location = route[currentIndex];
      // Emit to all connected clients
      io.emit('simulationUpdate', {
        driverId: 'simulated-driver', // Use a fixed ID for simulation
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date().toISOString()
      });
      currentIndex++;
    } else {
      // Simulation complete, stop
      stopSimulation();
    }
  }, 2000); // Emit every 2 seconds

  return { success: true, message: 'Simulation started' };
}

// Function to stop simulation
function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  isSimulating = false;
  currentIndex = 0;
  return { success: true, message: 'Simulation stopped' };
}

// Function to get simulation status
function getSimulationStatus() {
  return {
    isRunning: isSimulating,
    currentIndex,
    totalPoints: route.length
  };
}

module.exports = {
  route,
  stoppages,
  startSimulation,
  stopSimulation,
  getSimulationStatus
};