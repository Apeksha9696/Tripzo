const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  seats: [{ type: String, required: true }],
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
