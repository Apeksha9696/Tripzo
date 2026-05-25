const Offer = require('../models/Offer');

/**
 * Get All Active Promotional Offers
 */
const getAllOffers = async (req, res, next) => {
  try {
    // Return all offers that are active
    const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new promotional offer campaign (Admin-only restriction)
 */
const createOffer = async (req, res, next) => {
  try {
    const { title, description, code, discountPercentage, flatDiscount, validUntil, termsAndConditions } = req.body;

    if (!title || !description || !code || !validUntil) {
      return res.status(400).json({ error: 'Please enter all required fields: title, description, code, validUntil' });
    }

    // Check if code is already registered
    const existingOffer = await Offer.findOne({ code: code.toUpperCase().trim() });
    if (existingOffer) {
      return res.status(400).json({ error: 'A promotional offer is already configured with this coupon code' });
    }

    const offer = new Offer({
      title,
      description,
      code: code.toUpperCase().trim(),
      discountPercentage: Number(discountPercentage) || 0,
      flatDiscount: Number(flatDiscount) || 0,
      validUntil: new Date(validUntil),
      termsAndConditions: termsAndConditions || '',
      isActive: true
    });

    await offer.save();
    console.log(`[OFFER CREATE] Promo campaign launched successfully: code ${offer.code}`);

    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a promotional campaign (Admin-only restriction)
 */
const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return res.status(404).json({ error: 'Promotional offer campaign not found' });
    }

    console.log(`[OFFER DELETE] Promo campaign deleted successfully: ID ${id}`);
    res.json({ success: true, message: 'Promotional offer campaign deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Offer ID format' });
    }
    next(err);
  }
};

module.exports = {
  getAllOffers,
  createOffer,
  deleteOffer
};
