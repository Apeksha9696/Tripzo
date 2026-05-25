const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const Booking = require('../models/Booking');

/**
 * Retrieve System-Wide Administrative Statistics & Metrics
 */
const getDashboard = async (req, res, next) => {
  try {
    console.log('[ADMIN DASHBOARD] Compiling system statistics...');

    // Run parallel count queries for rapid response latency
    const [
      totalBuses,
      totalDrivers,
      totalOffers,
      totalBookings,
      allBookings
    ] = await Promise.all([
      Bus.countDocuments(),
      Driver.countDocuments(),
      Offer.countDocuments(),
      Booking.countDocuments({ status: 'Booked' }),
      Booking.find({ status: 'Booked' }).lean()
    ]);

    // Sum overall system revenues
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Fetch the 5 most recent ticket reservations in the system
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('bus', 'operatorName from to date departureTime')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalBuses,
        totalDrivers,
        totalOffers,
        totalBookings,
        totalRevenue
      },
      recentBookings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard
};
