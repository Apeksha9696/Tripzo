const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, default: 0 },
  flatDiscount: { type: Number, default: 0 },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  termsAndConditions: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
