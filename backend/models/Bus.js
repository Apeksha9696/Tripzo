const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  operatorName: { type: String, required: true },
  busName: { type: String, default: '' },
  busType: { type: String, required: true }, // e.g., 'AC Sleeper', 'Volvo'
  category: { type: String, default: '' },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, default: '' },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  totalSeats: { type: Number, default: 40 },
  facilities: [{ type: String }],
  pickupPoints: [{
    time: { type: String },
    location: { type: String },
    address: { type: String },
    contact: { type: String }
  }],
  dropPoints: [{
    time: { type: String },
    location: { type: String },
    address: { type: String },
    contact: { type: String }
  }],
  driver: {
    name: { type: String },
    contact: { type: String },
    license: { type: String }
  },
  offer: { type: String, default: '' },
  bookedSeats: [{ type: String }] // e.g. ["1A", "1B", "2C"]
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
