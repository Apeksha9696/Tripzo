require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const User = require('./models/User');
const Driver = require('./models/Driver');
const bcrypt = require('bcryptjs');

const operators = ['Haryana Roadways Volvo', 'Punia Travels', 'Zimindara Travels', 'Indo Canadian', 'Laxmi Holidays', 'IntrCity SmartBus', 'Zingbus', 'Bhaiya Travels', 'Royal Travels', 'Express Liners'];
const busTypes = ['AC Seater', 'AC Sleeper', 'Non-AC Seater', 'Volvo AC Semi-Sleeper'];

function getBusesForDate(dateString) {
  const buses = [];

  const serviceNames = [
    'Zingbus Plus',
    'Royal Express',
    'IntrCity SmartBus',
    'Volvo Elite',
    'Swift Comfort',
    'Northern Travels',
    'Delhi Express',
    'Haryana Deluxe',
    'Night Rider',
    'Premium Sleeper'
  ];

  const categories = [
    '2+1 Sleeper',
    '2+2 Seater',
    'Semi Sleeper',
    'Volvo Multi-Axle'
  ];

  const facilitiesList = [
    ['WiFi', 'Charging Point', 'Water Bottle'],
    ['Blanket', 'Snacks', 'Reading Light'],
    ['TV', 'AC', 'Charging Point'],
    ['Extra Legroom', 'Pillow', 'WiFi'],
    ['Curtains', 'Emergency Exit', 'Water Bottle'],
    ['Live Tracking', 'USB Charger', 'Blanket']
  ];

  // Generate 25 buses
  for (let i = 0; i < 25; i++) {

    const operatorName = operators[i % operators.length];
    const busType = busTypes[i % busTypes.length];

    const serviceName =
      serviceNames[Math.floor(Math.random() * serviceNames.length)];

    const category =
      categories[Math.floor(Math.random() * categories.length)];

    const facilities =
      facilitiesList[Math.floor(Math.random() * facilitiesList.length)];

    // Different departure timings
    const depHour = 1 + i;
    const departureTime =
      `${String(depHour % 24).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;

    // Duration between 4-7 hrs
    const durationHours = 4 + (i % 4);

    const arrivalHour = (depHour + durationHours) % 24;

    const arrivalTime =
      `${String(arrivalHour).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`;

    // Dynamic prices
    const price = 450 + (i * 50);

    // Ratings
    const rating = (3.8 + Math.random() * 1.2).toFixed(1);

    buses.push({
      operatorName,
      busName: serviceName,
      busType,

      category: `${serviceName} (${category})`,

      from: 'Chandigarh',
      to: 'Delhi',

      date: dateString,

      departureTime,
      arrivalTime,

      duration: `${durationHours}h ${30 + (i % 2) * 15}m`,

      price,

      rating: Number(rating),

      reviews: 20 + (i * 13),

      offer:
        i % 2 === 0
          ? 'Save ₹100 with FIRST'
          : 'Flat ₹75 OFF',

      totalSeats: 40 + (i % 10),

      facilities,

      pickupPoints: [
        {
          time: departureTime,
          location: 'Chandigarh ISBT Sector 43',
          address: 'Sector 43 Bus Stand Chandigarh',
          contact: '8287009889'
        },
        {
          time: departureTime,
          location: 'Zirakpur',
          address: 'Near McDonalds Zirakpur',
          contact: '8287009889'
        }
      ],

      dropPoints: [
        {
          time: arrivalTime,
          location: 'Delhi Kashmere Gate',
          address: 'ISBT Kashmere Gate Delhi',
          contact: '8287009889'
        },
        {
          time: arrivalTime,
          location: 'Majnu Ka Tila',
          address: 'Near Signature Bridge',
          contact: '8287009889'
        }
      ],

      driver: {
        name: `Driver ${i + 1}`,
        contact: `98765432${String(i).padStart(2, '0')}`,
        license: `DL01AB${1000 + i}`
      },

      bookedSeats: [],

      status:
        i % 10 === 0
          ? 'Delayed'
          : 'Active'
    });
  }

  return buses;
}

const seedBuses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    await Bus.deleteMany(); // Clear existing buses
    console.log('Cleared existing buses');

    let allBuses = [];
    const startDate = new Date('2026-04-01');
    
    // Generate dates for the next ~3 months (90 days)
    for (let day = 0; day < 90; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      allBuses = allBuses.concat(getBusesForDate(dateStr));
    }

    await Bus.insertMany(allBuses);
    console.log(`Seeded ${allBuses.length} buses from Chandlergarh to Delhi successfully`);

    // Setup Driver User
    let driver = await Driver.findOne({ email: 'driver@gmail.com' });
    if (!driver) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('driver123', salt);
      driver = new Driver({
        name: 'Default Driver',
        email: 'driver@gmail.com',
        password: hashedPassword
      });
      await driver.save();
      console.log('Seeded default driver account: driver@gmail.com (pass: driver123)');
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedBuses();
