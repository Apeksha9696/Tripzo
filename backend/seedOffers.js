require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('./models/Offer');

const offersData = [
  {
    title: 'First Booking Discount',
    description: 'Get 15% off on your first bus booking.',
    code: 'FIRST15',
    discountPercentage: 15,
    flatDiscount: 0,
    validUntil: new Date('2026-12-31'),
    isActive: true,
    termsAndConditions: 'Valid only for first-time users.'
  },
  {
    title: 'Summer Splash Sale',
    description: 'Flat ₹200 off on all AC buses.',
    code: 'SUMMER200',
    discountPercentage: 0,
    flatDiscount: 200,
    validUntil: new Date('2026-06-30'),
    isActive: true,
    termsAndConditions: 'Minimum booking amount ₹1000.'
  },
  {
    title: 'Weekend Getaway',
    description: 'Save 10% on bookings made for weekends.',
    code: 'WKND10',
    discountPercentage: 10,
    flatDiscount: 0,
    validUntil: new Date('2026-12-31'),
    isActive: true,
    termsAndConditions: 'Journey date must be Saturday or Sunday.'
  },
  {
    title: 'Diwali Dhamaka',
    description: 'Flat ₹500 off on premium sleeper buses.',
    code: 'DIWALI500',
    discountPercentage: 0,
    flatDiscount: 500,
    validUntil: new Date('2026-11-15'),
    isActive: true,
    termsAndConditions: 'Applicable for selected premium operators only.'
  },
  {
    title: 'Cashback Bonanza',
    description: 'Get flat ₹100 instant discount on any route.',
    code: 'CASHBACK100',
    discountPercentage: 0,
    flatDiscount: 100,
    validUntil: new Date('2026-08-31'),
    isActive: true,
    termsAndConditions: 'Can be used once per user.'
  }
];

const seedOffers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Offers Seeding');

    await Offer.deleteMany(); // Clear existing offers
    console.log('Cleared existing offers');

    await Offer.insertMany(offersData);
    console.log(`Seeded ${offersData.length} offers successfully`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedOffers();
