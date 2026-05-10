require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const http = require('http');
const socketIo = require('socket.io');

const User = require('./models/User');
const Driver = require('./models/Driver');
const Admin = require('./models/Admin');
const Bus = require('./models/Bus');
const Booking = require('./models/Booking');
const Offer = require('./models/Offer');

// Import new modules
const locationRoutes = require('./routes/locationRoutes');
const socketHandler = require('./sockets/socketHandler');
const locationController = require('./controllers/locationController');
const { verifyEmailConfig, sendBookingConfirmationEmail, sendPasswordResetEmail } = require('./services/mailService');
const admin = require("firebase-admin");

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const allowedEmailDomains = ['gmail.com', 'outlook.com'];
const isAllowedEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedEmailDomains.includes(domain);
};

const app = express();

// Enable CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // Added 5173 as your Vite frontend runs there
  credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// In-memory storage for bus locations
const busLocations = new Map();

// Make it global for controllers
global.busLocations = busLocations;

global.driverLocations = busLocations; // legacy alias for older modules

// Initialize socket handler
const { emitLocationUpdate, startSimWithIO } = socketHandler(io);

// Make emitLocationUpdate globally available for routes
global.emitLocationUpdate = emitLocationUpdate;
global.startSimWithIO = startSimWithIO;
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Mount location and simulation routes without changing existing API behavior
app.use('/api', locationRoutes);

// DB connection
const ensureDefaultAccounts = async () => {
  try {
    const existingDriver = await Driver.findOne({ email: 'driver@gmail.com' });
    if (!existingDriver) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('driver123', salt);
      const driver = new Driver({ name: 'Default Driver', email: 'driver@gmail.com', password: hashedPassword });
      await driver.save();
      console.log('Created default driver account: driver@gmail.com / driver123');
    }

    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = new Admin({ name: 'System Admin', email: 'admin@gmail.com', password: hashedPassword, role: 'admin' });
      await admin.save();
      console.log('Created default admin account: admin@gmail.com / admin123');
    }
  } catch (err) {
    console.error('Error creating default accounts:', err);
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await ensureDefaultAccounts();
    // Verify email configuration on startup
    await verifyEmailConfig();
  })
  .catch(err => console.log(err));

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const dec = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = dec;
    // console.log("Authorized user ID:", dec.id);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com addresses are allowed' });
    }

    const existingUser = await User.findOne({ email });
    const existingDriver = await Driver.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingUser || existingDriver || existingAdmin) return res.status(400).json({ error: 'Account already exists with that email' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role: 'user' });
    await user.save();
    
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register-driver', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com addresses are allowed' });
    }

    const existingUser = await User.findOne({ email });
    const existingDriver = await Driver.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingUser || existingDriver || existingAdmin) return res.status(400).json({ error: 'Account already exists with that email' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const driver = new Driver({ name, email, password: hashedPassword });
    await driver.save();

    const payload = { id: driver._id, role: 'driver' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: driver._id, name: driver.name, email: driver.email, role: 'driver' } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com addresses are allowed' });
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

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const finalRole = user.role || role;
    const payload = { id: user._id, role: finalRole };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: finalRole } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name } = decodedToken;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com addresses are allowed' });
    }

    // Check if user exists in any role
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

    // If no user found, automatically register them as a standard user
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = new User({ 
        name: name || 'Google User', 
        email, 
        password: hashedPassword, 
        role: 'user' 
      });
      await user.save();
      role = 'user';
    }

    const finalRole = user.role || role;
    const payload = { id: user._id, role: finalRole };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: finalRole } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google Token or Server Error' });
  }
});

// --- FORGOT & RESET PASSWORD ROUTES ---
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

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
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    
    // Send email
    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    // Find user by token across all collections where expiry is > now
    let user = await Admin.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      user = await Driver.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    }
    if (!user) {
      user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    }

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- BUS ROUTES ---
app.get('/api/buses/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    // Simple exact match logic
    const query = {};
    if (from) query.from = from;
    if (to) query.to = to;
    if (date) query.date = date; // simple string match for exact date
    
    const buses = await Bus.find(query);
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/buses/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- BOOKING ROUTES ---
app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const { busId, seats } = req.body;
    
    if (!seats || seats.length === 0) {
        return res.status(400).json({ error: 'No seats provided' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // Verify seats are not already booked
    const alreadyBooked = seats.some(seat => bus.bookedSeats.includes(seat));
    if (alreadyBooked) {
      return res.status(400).json({ error: 'One or more requested seats are already booked' });
    }

    const totalPrice = seats.length * bus.price;

    const booking = new Booking({
      user: req.user.id,
      bus: busId,
      seats,
      totalPrice
    });

    await booking.save();

    // Mark seats as booked on Bus
    bus.bookedSeats.push(...seats);
    await bus.save();

    // Send booking confirmation email (async, don't wait)
    // Fetch user details for email
    const user = await User.findById(req.user.id);
    if (user) {
      const bookingData = {
        passengerName: user.name,
        passengerEmail: user.email,
        busName: bus.busName || 'N/A',
        busOperator: bus.operatorName,
        busType: bus.busType,
        from: bus.from,
        to: bus.to,
        departureDate: bus.date,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        seats: seats,
        totalPrice: totalPrice,
        bookingId: booking._id.toString(),
        bookingDate: new Date(booking.bookingDate).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };

      // Send email asynchronously (don't block the booking response)
      sendBookingConfirmationEmail(bookingData).catch(err => {
        console.error('Email send failed but booking succeeded:', err);
      });
    }

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings/my-bookings', authMiddleware, async (req, res) => {
  try {
    let bookings = await Booking.find({ user: req.user.id })
      .populate('bus')
      .sort({ bookingDate: -1 });

    bookings = bookings.map(booking => {
      const currentLocation = busLocations.get(String(booking.bus?._id));
      return {
        ...booking.toObject(),
        bus: booking.bus ? {
          ...booking.bus.toObject(),
          currentLocation: currentLocation || null
        } : null
      };
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- LOCATION ROUTES (Real-time tracking) ---
app.use('/api', locationRoutes);

// --- OFFERS ROUTES ---
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- DRIVER ROUTES ---
app.get('/api/driver/dashboard', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Access denied. Only drivers can access this resource.' });
    }

    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(403).json({ error: 'Access denied. Driver account not found.' });
    }

    // Fetch all buses
    const buses = await Bus.find().lean();
    
    // Fetch all bookings for all buses, map them
    const bookings = await Booking.find().populate('user', 'name email').lean();

    // Group bookings by bus
    const busesWithBookings = buses.map(bus => {
      const busBookings = bookings.filter(b => String(b.bus) === String(bus._id));
      const currentLocation = busLocations.get(String(bus._id)) || null;
      return {
        ...bus,
        currentLocation,
        bookings: busBookings
      };
    });

    res.json(busesWithBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- ADMIN SECURED ROUTES ---

// Bus CRUD
app.get('/api/admin/buses', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const buses = await Bus.find().lean();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/buses', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/buses/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/buses/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Driver CRUD
app.get('/api/admin/drivers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password').lean();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      totalBuses,
      totalDrivers,
      totalUsers,
      totalBookings,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Management
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Booking Management
app.get('/api/admin/bookings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('bus', 'busName operatorName from to')
      .sort({ bookingDate: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/bookings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      // Remove booked seats from bus
      const bus = await Bus.findById(booking.bus);
      if (bus) {
        bus.bookedSeats = bus.bookedSeats.filter(seat => !booking.seats.includes(seat));
        await bus.save();
      }
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/drivers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/drivers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Offer CRUD
app.post('/api/admin/offers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
