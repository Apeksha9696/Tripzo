// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

const {
  updateLocation,
  getLocation,
  getSimulatedRoute,
  getStoppages,
  startSim,
  stopSim,
  getSimStatus
} = locationController;

// POST /api/update-location
// Body: { busId, lat, lng }
router.post('/update-location', (req, res) => {
  try {
    const result = updateLocation(req.body);
    // Emit real-time update
    if (global.emitLocationUpdate) {
      global.emitLocationUpdate(result.busId, result.location);
    }
    res.json({ success: true, message: 'Location updated', location: result.location });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/get-location/:busId
router.get('/get-location/:busId', getLocation);

// GET /api/simulated-route
router.get('/simulated-route', getSimulatedRoute);

// GET /api/route-stoppages
router.get('/route-stoppages', getStoppages);

// POST /api/start-simulation
router.post('/start-simulation', (req, res) => {
  if (global.startSimWithIO) {
    const result = global.startSimWithIO();
    res.json(result);
  } else {
    res.status(500).json({ error: 'Simulation not available' });
  }
});

// POST /api/stop-simulation
router.post('/stop-simulation', stopSim);

// GET /api/simulation-status
router.get('/simulation-status', getSimStatus);

module.exports = router;