require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const http = require('http'); // FIXED
const socketIo = require('socket.io');

const User = require('./models/User');
const Driver = require('./models/Driver');
const Admin = require('./models/Admin');
const Bus = require('./models/Bus');
const Booking = require('./models/Booking');
const Offer = require('./models/Offer');

// Import modules
const locationRoutes = require('./routes/locationRoutes');
const socketHandler = require('./sockets/socketHandler');
const {
  verifyEmailConfig,
  sendBookingConfirmationEmail,
  sendPasswordResetEmail
} = require('./services/mailService');

const admin = require("firebase-admin");

// Firebase Config
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Email Validation
const allowedEmailDomains = ['gmail.com', 'outlook.com'];

const isAllowedEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const domain = email.split('@')[1]?.toLowerCase();

  return allowedEmailDomains.includes(domain);
};

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://tripzo-app.vercel.app",
  "https://www.tripzo-app.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Bus location memory store
const busLocations = new Map();

global.busLocations = busLocations;
global.driverLocations = busLocations;

// Socket handler
const { emitLocationUpdate, startSimWithIO } = socketHandler(io);

global.emitLocationUpdate = emitLocationUpdate;
global.startSimWithIO = startSimWithIO;

// Routes
app.use('/api', locationRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Tripzo Backend Running');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');

    await ensureDefaultAccounts();

    await verifyEmailConfig();
  })
  .catch(err => {
    console.log('MongoDB Error:', err);
  });

// Create Default Accounts
const ensureDefaultAccounts = async () => {
  try {

    const existingDriver = await Driver.findOne({
      email: 'driver@gmail.com'
    });

    if (!existingDriver) {

      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash('driver123', salt);

      const driver = new Driver({
        name: 'Default Driver',
        email: 'driver@gmail.com',
        password: hashedPassword
      });

      await driver.save();

      console.log('Default Driver Created');
    }

    const existingAdmin = await Admin.findOne({
      email: 'admin@gmail.com'
    });

    if (!existingAdmin) {

      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash('admin123', salt);

      const adminUser = new Admin({
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });

      await adminUser.save();

      console.log('Default Admin Created');
    }

  } catch (err) {
    console.error(err);
  }
};

// Auth Middleware
const authMiddleware = (req, res, next) => {

  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  try {

    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      error: 'Invalid Token'
    });

  }
};

// Register Route
app.post('/api/auth/register', async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        error: 'Only gmail.com and outlook.com allowed'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(201).json({
      token,
      user
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Server Error'
    });

  }

});

// Login Route
app.post('/api/auth/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        error: 'Only gmail.com and outlook.com allowed'
      });
    }

    let user = await Admin.findOne({ email });

    let role = 'admin';

    if (!user) {
      user = await Driver.findOne({ email });
      role = 'driver';
    }

    if (!user) {
      user = await User.findOne({ email });
      role = 'user';
    }

    if (!user) {
      return res.status(400).json({
        error: 'Invalid Credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: 'Invalid Credentials'
      });
    }

    const finalRole = user.role || role;

    const token = jwt.sign(
      {
        id: user._id,
        role: finalRole
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: finalRole
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Server Error'
    });

  }

});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {

  try {

    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;

    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl =
      `https://tripzo-app.vercel.app/reset-password/${token}`;

    await sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.name
    );

    res.json({
      message: 'Reset Email Sent'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Server Error'
    });

  }

});

// Bus Search
app.get('/api/buses/search', async (req, res) => {

  try {

    const { from, to, date } = req.query;

    const query = {};

    if (from) query.from = from;

    if (to) query.to = to;

    if (date) query.date = date;

    const buses = await Bus.find(query);

    res.json(buses);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Server Error'
    });

  }

});

// My Bookings
app.get('/api/bookings/my-bookings',
  authMiddleware,
  async (req, res) => {

    try {

      const bookings = await Booking.find({
        user: req.user.id
      })
        .populate('bus')
        .sort({ bookingDate: -1 });

      res.json(bookings);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: 'Server Error'
      });

    }

  }
);

// Start Server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});