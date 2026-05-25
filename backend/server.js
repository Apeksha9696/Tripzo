require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const admin = require("firebase-admin");

// Config & Middlewares
const connectDB = require('./config/db');
const { requestLogger } = require('./middleware/loggingMiddleware');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');
const { verifyEmailConfig } = require('./services/mailService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Firebase Admin initialization
if (admin.apps.length === 0 && process.env.FIREBASE_PROJECT_ID) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK successfully initialized on startup');
  } catch (error) {
    console.error('⚠️ Firebase Admin SDK initialization failed on startup:', error.message);
  }
}

const app = express();

// Trust proxy (necessary for Render/Vercel reverse proxy layouts)
app.set('trust proxy', 1);

// CORS Config - Permissive for localhost & Vercel previews while maintaining strict credentials support
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

console.log('[STARTUP] Initializing Tripzo server in', process.env.NODE_ENV || 'development', 'mode');
console.log('[STARTUP] Allowed explicit origins:', allowedOrigins);

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.startsWith('http://localhost:') || 
                      origin.endsWith('.vercel.app');
                      
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.error(`[CORS ERROR] Blocked unauthorized origin: ${origin}`);
      return callback(new Error(`CORS policy violation: Origin "${origin}" not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Set COOP/COEP headers to allow oauth popup windows to communicate
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// JSON request body parser
app.use(express.json());

// Request logger middleware
app.use(requestLogger);

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO setup with matched CORS policies
const io = socketIo(server, {
  path: '/socket.io',
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.startsWith('http://localhost:') || 
                        origin.endsWith('.vercel.app');
      if (isAllowed) return callback(null, true);
      return callback(new Error('Socket CORS policy: Origin not allowed'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Bus location dynamic Map store (used by location controller and socket handler)
const busLocations = new Map();
global.busLocations = busLocations;
global.driverLocations = busLocations;

// Initialize real-time simulation handlers
const socketHandler = require('./sockets/socketHandler');
const { emitLocationUpdate, startSimWithIO } = socketHandler(io);
global.emitLocationUpdate = emitLocationUpdate;
global.startSimWithIO = startSimWithIO;

// Database Connection & Auto Seed Protocol
connectDB().then(() => {
  // Validate email SMTP credentials in background on successful DB load
  verifyEmailConfig();
});

// Root Health Status Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'Tripzo MERN Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount Routes (Fully supporting both standard REST API goals and frontend targets)
app.use('/api', locationRoutes); // Mount legacy root endpoints (/api/update-location etc.)
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/admin/buses', busRoutes); // Alias
app.use('/api/bookings', bookingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin/offers', offerRoutes); // Alias
app.use('/api/drivers', driverRoutes);
app.use('/api/admin/drivers', driverRoutes); // Alias
app.use('/api/driver', driverRoutes); // Alias for Driver Portal (/api/driver/dashboard)
app.use('/api/admin', adminRoutes); // Alias for Admin stats Portal (/api/admin/dashboard)

// Central Error Boundaries
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start listening
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Tripzo Backend Server successfully listening on port ${PORT}`);
});
