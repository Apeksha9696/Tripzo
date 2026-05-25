const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Admin Dashboard stats summary
router.get('/dashboard', auth, authorize('admin'), adminController.getDashboard);

module.exports = router;
