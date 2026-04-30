// controllers/locationController.js
const { startSimulation, stopSimulation, getSimulationStatus, route, stoppages } = require('../utils/simulation');

// In-memory storage for bus locations (from global)
const busLocations = global.busLocations || global.driverLocations;

// Update bus location
const updateLocation = (body) => {
  try {
    const { busId, lat, lng } = body;

    if (!busId || lat === undefined || lng === undefined) {
      throw new Error('Missing required fields: busId, lat, lng');
    }

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('lat and lng must be numbers');
    }

    // Store location
    const location = {
      lat,
      lng,
      timestamp: new Date().toISOString()
    };
    busLocations.set(String(busId), location);

    // Return data for emission
    return { success: true, busId: String(busId), location };
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Get bus location
const getLocation = (req, res) => {
  try {
    const { busId } = req.params;

    if (!busId) {
      return res.status(400).json({ error: 'Bus ID is required' });
    }

    const location = busLocations.get(String(busId));

    if (!location) {
      return res.status(404).json({ error: 'Location not found for this bus' });
    }

    res.json({ success: true, location });
  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get simulated route
const getSimulatedRoute = (req, res) => {
  res.json({ success: true, route });
};

// Start simulation
const startSim = (req, res) => {
  // Note: io instance will be passed from the route
  // For now, return status; actual start will be in route
  const status = getSimulationStatus();
  if (status.isRunning) {
    return res.json({ success: false, message: 'Simulation already running' });
  }
  res.json({ success: true, message: 'Simulation start requested' });
};

// Stop simulation
const stopSim = (req, res) => {
  const result = stopSimulation();
  res.json(result);
};

// Get simulation status
const getSimStatus = (req, res) => {
  const status = getSimulationStatus();
  res.json({ success: true, status });
};

// Get route stoppages
const getStoppages = (req, res) => {
  res.json({ success: true, stoppages });
};

module.exports = {
  updateLocation,
  getLocation,
  getSimulatedRoute,
  getStoppages,
  startSim,
  stopSim,
  getSimStatus
};