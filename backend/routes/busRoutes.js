const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Public route search & listings
router.get('/', busController.getAllBuses);
router.get('/search', busController.searchBuses);

// Support both REST standard '/:id' and legacy frontend '/search/:id'
router.get('/:id', busController.getBusById);
router.get('/search/:id', busController.getBusById);

// Admin-only fleet modifications
router.post('/', auth, authorize('admin'), busController.createBus);
router.put('/:id', auth, authorize('admin'), busController.updateBus);
router.delete('/:id', auth, authorize('admin'), busController.deleteBus);

module.exports = router;
