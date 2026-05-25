const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');

/**
 * Retrieve list of all onboarded drivers (Admin-only restriction)
 */
const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
};

/**
 * Revoke driver system access / delete driver (Admin-only restriction)
 */
const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    console.log(`[DRIVER DELETE] Revoked system access for driver: ID ${id} (${driver.email})`);
    res.json({ success: true, message: 'Driver access credentials revoked successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Driver ID format' });
    }
    next(err);
  }
};

/**
 * Driver Portal Dashboard Aggregate (Driver-only restriction)
 * Compiles assigned bus routes, dynamically resolving booked seats and passenger manifests
 */
const getDashboard = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    // Fetch the driver's full account profile to get their name
    const driverDoc = await Driver.findById(driverId);
    const driverName = driverDoc ? driverDoc.name : '';

    console.log(`[DRIVER DASHBOARD] Compiling metrics for driver: "${driverName}"`);

    // Match buses assigned to this driver's name or the default driver.
    // Fall back to listing all buses with active booked seats to prevent a blank dashboard during staging/testing.
    let buses = [];
    if (driverName) {
      buses = await Bus.find({
        $or: [
          { 'driver.name': driverName },
          { 'driver.name': 'Default Driver' }
        ]
      }).lean();
    }

    // If no specific buses are assigned, return all buses to keep development environments active
    if (!buses || buses.length === 0) {
      buses = await Bus.find().lean();
    }

    // Dynamically resolve passenger manifest from the Bookings collection for each bus
    for (let bus of buses) {
      const bookings = await Booking.find({ bus: bus._id, status: 'Booked' })
        .populate('user', 'name email')
        .lean();
      
      // Inject passenger manifests on the fly for frontend consumption
      bus.bookings = bookings;
    }

    res.json(buses);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDrivers,
  deleteDriver,
  getDashboard
};
