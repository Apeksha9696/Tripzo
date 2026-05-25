const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { sendBookingConfirmationEmail } = require('../services/mailService');

/**
 * Create a new seat booking reservation
 */
const createBooking = async (req, res, next) => {
  try {
    const { busId, seats } = req.body;

    if (!busId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Please specify busId and an array of seats to book' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ error: 'Selected bus route does not exist' });
    }

    // Check if any of the requested seats are already booked
    const alreadyBooked = seats.filter(seat => bus.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({ 
        error: `Seats collision: The following seat(s) are already booked: ${alreadyBooked.join(', ')}` 
      });
    }

    // Compute total price
    const totalPrice = seats.length * bus.price;

    // Create the booking document
    const booking = new Booking({
      user: req.user.id,
      bus: busId,
      seats,
      totalPrice,
      status: 'Booked'
    });

    await booking.save();

    // Lock seats on the bus model
    bus.bookedSeats.push(...seats);
    await bus.save();

    console.log(`[BOOKING CREATE] Booking registered successfully: ID ${booking._id} for user ${req.user.id}`);

    // Proactively send a professional confirmation email in the background
    // Retrieve full user profile to fetch their real name and email address
    User.findById(req.user.id)
      .then(async (userProfile) => {
        if (userProfile && userProfile.email) {
          const emailData = {
            passengerName: userProfile.name || 'Passenger',
            passengerEmail: userProfile.email,
            busName: bus.busName || 'Standard',
            busOperator: bus.operatorName,
            busType: bus.busType,
            from: bus.from,
            to: bus.to,
            departureDate: bus.date,
            departureTime: bus.departureTime,
            arrivalTime: bus.arrivalTime,
            seats,
            totalPrice,
            bookingId: `TRK-${booking._id.toString().substring(0, 9).toUpperCase()}`,
            bookingDate: new Date(booking.bookingDate).toLocaleDateString()
          };
          await sendBookingConfirmationEmail(emailData);
        }
      })
      .catch((mailErr) => {
        console.error('⚠️ Failed to resolve user profile for booking confirmation email:', mailErr.message);
      });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve booking history of logged-in user
 */
const myBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('bus')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a booking reservation
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking reservation not found' });
    }

    // Verify ownership or admin access
    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access Denied: You are not authorized to cancel this booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ error: 'Booking reservation is already cancelled' });
    }

    // Release seats on the associated bus model
    const bus = await Bus.findById(booking.bus);
    if (bus) {
      bus.bookedSeats = bus.bookedSeats.filter(seat => !booking.seats.includes(seat));
      await bus.save();
    }

    // Update booking status
    booking.status = 'Cancelled';
    await booking.save();

    console.log(`[BOOKING CANCEL] Booking reservation cancelled: ID ${id}`);

    res.json({
      success: true,
      message: 'Booking reservation has been cancelled successfully and seats released',
      booking
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Booking ID format' });
    }
    next(err);
  }
};

module.exports = {
  createBooking,
  myBookings,
  cancelBooking
};
