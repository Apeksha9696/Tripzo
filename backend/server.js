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

// Trust proxy (Render/Vercel sit behind proxies)
app.set('trust proxy', 1);

// CORS - allow only configured origins and support credentials
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tripzo.vercel.app';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://tripzo.vercel.app',
  'https://www.tripzo.vercel.app',
  'https://tripzo-app.vercel.app',
  'https://www.tripzo-app.vercel.app',
  FRONTEND_URL
].filter(Boolean);

console.log('[STARTUP] CORS allowed origins:', allowedOrigins);
console.log('[STARTUP] JWT_SECRET present:', Boolean(process.env.JWT_SECRET));
console.log('[STARTUP] JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('[STARTUP] FRONTEND_URL:', FRONTEND_URL);
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);
console.log('[STARTUP] MONGO_URI present:', Boolean(process.env.MONGO_URI));
console.log('[STARTUP] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('[STARTUP] FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('[STARTUP] FIREBASE_PRIVATE_KEY present:', Boolean(process.env.FIREBASE_PRIVATE_KEY));
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('⚠️ [STARTUP] WARNING: JWT_SECRET is missing or too short (must be 32+ chars)!');
}
if (!process.env.MONGO_URI) {
  console.error('⚠️ [STARTUP] WARNING: MONGO_URI is not set!');
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.error(`[CORS ERROR] Origin not allowed: ${origin}`);
    return callback(new Error(`CORS policy: Origin not allowed - ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
}));

// Set COOP/COEP headers to allow popup-based login windows to communicate
// NOTE: we prefer redirect-based OAuth in production; this relaxes popup restrictions
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(express.json());

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = socketIo(server, {
  path: '/socket.io',
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('Socket CORS policy: Origin not allowed'));
    },
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
    console.log('[AUTH MIDDLEWARE] No token provided');
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('[AUTH MIDDLEWARE] CRITICAL: JWT_SECRET not set!');
    return res.status(500).json({
      error: 'Server configuration error'
    });
  }

  try {
    console.log('[AUTH MIDDLEWARE] Verifying JWT token...');
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
    );
    console.log('[AUTH MIDDLEWARE] JWT verified for user:', decoded.id);

    req.user = decoded;

    next();

  } catch (err) {
    console.error('[AUTH MIDDLEWARE] JWT verification failed:', err.message);
    return res.status(401).json({
      error: 'Invalid Token: ' + err.message
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

    if (!process.env.JWT_SECRET) {
      console.error('[REGISTER] CRITICAL: JWT_SECRET not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

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

    console.log('[REGISTER] User registered successfully:', { id: user._id, email: user.email });

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

    console.log('Login success:', { email, role: finalRole });

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
// ================= GOOGLE AUTH =================

// Google authentication endpoint - accepts either Firebase ID token or plain profile
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token, name, email, photo } = req.body;

    console.log('[GOOGLE AUTH] Received auth request for:', email || 'unknown');

    let userEmail = email;
    let userName = name;
    let userPhoto = photo;

    // If a Firebase ID token is provided, verify it and extract user info
    if (token) {
      console.log('[GOOGLE AUTH] Verifying Firebase ID token...');
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        userEmail = decoded.email;
        console.log('[GOOGLE AUTH] Firebase token verified for:', userEmail);
        
        try {
          const userRecord = await admin.auth().getUser(decoded.uid);
          userName = userRecord.displayName || userName;
          userPhoto = userRecord.photoURL || userPhoto;
          console.log('[GOOGLE AUTH] Firebase user record fetched:', { userName, hasPhoto: Boolean(userPhoto) });
        } catch (e) {
          console.warn('[GOOGLE AUTH] Unable to fetch Firebase user record:', e.message);
        }
      } catch (tokenErr) {
        console.error('[GOOGLE AUTH] Firebase token verification failed:', tokenErr.message);
        return res.status(401).json({ error: 'Invalid Firebase token' });
      }
    }

    if (!userEmail) {
      console.error('[GOOGLE AUTH] Email is required but not provided');
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('[GOOGLE AUTH] Processing user:', { email: userEmail, name: userName });

    // Find or create user
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('[GOOGLE AUTH] Creating new user:', userEmail);
      user = new User({
        name: userName || 'Google User',
        email: userEmail,
        photo: userPhoto,
        password: 'google-auth-user',
        role: 'user'
      });
      await user.save();
      console.log('[GOOGLE AUTH] User created successfully:', user._id);
    } else {
      console.log('[GOOGLE AUTH] Existing user found:', user._id);
    }

    // Issue JWT (used by the app for API auth)
    if (!process.env.JWT_SECRET) {
      console.error('[GOOGLE AUTH] CRITICAL: JWT_SECRET not set!');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
    }
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[GOOGLE AUTH] JWT token issued for user:', user._id);

    const responseData = {
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    };

    console.log('[GOOGLE AUTH] Sending response:', { userId: user._id, email: user.email, role: user.role });

    return res.json(responseData);
  } catch (err) {
    console.error('[GOOGLE AUTH] Error:', err.message, err.stack);
    return res.status(500).json({ error: 'Google Authentication Failed: ' + err.message });
  }
});

// ================= AUTH VERIFICATION =================

// Verify current session and get authenticated user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role || 'user';
    console.log('[AUTH ME] Verifying user:', req.user.id, 'role:', role);

    let user = null;
    if (role === 'admin') {
      user = await Admin.findById(req.user.id);
    } else if (role === 'driver') {
      user = await Driver.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }

    // Fallback logic to check other collections in case of role mismatch or old tokens
    if (!user) {
      console.log('[AUTH ME] User not found by role in JWT, searching other collections...');
      user = await User.findById(req.user.id);
      if (!user) {
        user = await Driver.findById(req.user.id);
      }
      if (!user) {
        user = await Admin.findById(req.user.id);
      }
    }

    if (!user) {
      console.log('[AUTH ME] User not found in any collection:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const finalRole = user.role || role;
    console.log('[AUTH ME] User verified successfully:', { id: user._id, email: user.email, role: finalRole });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: finalRole,
        photo: user.photo || null
      }
    });
  } catch (err) {
    console.error('[AUTH ME] Error during token verification:', err.message);
    return res.status(500).json({ error: 'Server Error' });
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
app.get('/api/buses', async (req, res) => {
  try {

    const buses = await Bus.find();

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
