const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/authMiddleware');

// All booking routes require user login
router.use(auth);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.myBookings);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
