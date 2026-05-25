const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Driver Portal Dashboard - Driver-only restriction (mounted at '/api/driver/dashboard')
router.get('/dashboard', auth, authorize('driver'), driverController.getDashboard);

// Administrative Driver Directory - Admin-only (mounted at '/api/drivers' & '/api/admin/drivers')
router.get('/', auth, authorize('admin'), driverController.getAllDrivers);
router.delete('/:id', auth, authorize('admin'), driverController.deleteDriver);

module.exports = router;
