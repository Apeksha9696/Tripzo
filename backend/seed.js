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
  const serviceNames = ['Zingbus Plus', 'Bharat Benz A/C Seater', 'Bharat Benz A/C Sleeper', 'Royal Express', 'Swift Comfort'];
  const categories = ['2+1 Seater', '2+1 Sleeper'];
  const facilitiesList = [
    ['WiFi', 'Charging Points', 'Water Bottle', 'Blanket', 'Snacks'],
    ['AC', 'Reading Light', 'Curtains', 'Fast Boarding', 'Water Bottle'],
    ['WiFi', 'Power Outlet', 'Blanket', 'Snacks', 'Comfort Seat'],
    ['AC', 'Charging Point', 'Extra Legroom', 'Water Bottle', 'Entertainment']
  ];

  // Create 12 buses for each date
  for (let i = 0; i < 12; i++) {
    const operatorName = operators[i % operators.length];
    const busType = busTypes[i % busTypes.length];
    const serviceName = serviceNames[i % serviceNames.length];
    const category = categories[i % categories.length];
    const facilities = facilitiesList[i % facilitiesList.length];
    const duration = '08h 30m';
    const rating = 4.3 + (i % 3) * 0.15;
    const reviews = 10 + i * 5;
    const offer = 'MyDeal - ₹127 off';

    // Spread departure times out from 06:00 to 20:00
    const departureHours = String(6 + i).padStart(2, '0'); // 06:00 to 17:00
    const arrivalHours = String(14 + i).padStart(2, '0');  // 14:00 to 23:00
    const departureTime = `${departureHours}:00`;
    const arrivalTime = `${arrivalHours}:30`;

    buses.push({
      operatorName: operatorName,
      busName: serviceName,
      busType: busType,
      category: `${serviceName} (${category})`,
      from: 'Chandigarh',
      to: 'Delhi',
      date: dateString,
      departureTime,
      arrivalTime,
      duration,
      price: 500 + (Math.floor(Math.random() * 5) * 100), // Random prices like 500, 600, 700...
      rating: Number(rating.toFixed(1)),
      reviews,
      offer,
      totalSeats: 40,
      facilities,
      pickupPoints: [
        {
          time: departureTime,
          location: 'Kashmere Gate ISBT',
          address: 'Inside ISBT Kashmere Gate, Zingbus Booking Counter No. 28, Exit from Gate 7 & 8 Metro (Not on Government Platform)',
          contact: '8287009889'
        },
        {
          time: '21:20',
          location: 'Akshardham End of Flyover',
          address: 'Akshardham End of Flyover towards Noida Near Over-Head Bridge',
          contact: '8287009889'
        }
      ],
      dropPoints: [
        {
          time: arrivalTime,
          location: 'Naubasta Chauraha',
          address: 'Kanpur Bypass Naubasta Chauraha Starting of Flyover',
          contact: '8287009889'
        }
      ],
      driver: {
        name: 'Ramesh Kumar',
        contact: '8287009889',
        license: 'DL1AB1234'
      },
      stoppages: [
        { stopName: 'Ambala', arrivalTime: `${String(7 + i).padStart(2, '0')}:15` },
        { stopName: 'Karnal', arrivalTime: `${String(8 + i).padStart(2, '0')}:45` },
        { stopName: 'Panipat', arrivalTime: `${String(9 + i).padStart(2, '0')}:30` }
      ],
      bookedSeats: []
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
