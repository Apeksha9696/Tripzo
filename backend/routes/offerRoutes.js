const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Public listing
router.get('/', offerController.getAllOffers);

// Admin-only operations (Supports REST standard '/api/offers' and frontend '/api/admin/offers')
router.post('/', auth, authorize('admin'), offerController.createOffer);
router.delete('/:id', auth, authorize('admin'), offerController.deleteOffer);

module.exports = router;
