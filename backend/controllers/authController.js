const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const admin = require("firebase-admin");

const User = require('../models/User');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const { sendPasswordResetEmail } = require('../services/mailService');

// Safe Firebase initialization checking
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
    console.log('✅ Firebase Admin SDK Initialized in authController');
  } catch (error) {
    console.error('⚠️ Failed to initialize Firebase Admin SDK in authController:', error.message);
  }
}

// Domain filter for standard user signups
const allowedEmailDomains = ['gmail.com', 'outlook.com'];
const isAllowedEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedEmailDomains.includes(domain);
};

/**
 * Register standard user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all required fields: name, email, password' });
    }

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com domains are allowed for registration' });
    }

    const existingUser = await User.findOne({ email }) || 
                         await Admin.findOne({ email }) || 
                         await Driver.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email address' });
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

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[REGISTER] CRITICAL: JWT_SECRET not configured!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log(`[AUTH REGISTER] User registered successfully: ${user.email}`);

    // Return sanitized response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log in User, Admin, or Driver
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password' });
    }

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com domains are allowed' });
    }

    // Try finding in respective collections
    let account = await Admin.findOne({ email });
    let role = 'admin';

    if (!account) {
      account = await Driver.findOne({ email });
      role = 'driver';
    }

    if (!account) {
      account = await User.findOne({ email });
      role = 'user';
    }

    if (!account) {
      return res.status(400).json({ error: 'Invalid credentials: user not found' });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials: incorrect password' });
    }

    const finalRole = account.role || role;
    console.log(`[AUTH LOGIN] Successful authentication: ${email} (role: ${finalRole})`);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[LOGIN] CRITICAL: JWT_SECRET not configured!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: account._id, role: finalRole },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: finalRole
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Firebase-based Google Authentication Sign-In
 */
const googleLogin = async (req, res, next) => {
  try {
    const { token, name, email, photo } = req.body;

    console.log(`[AUTH GOOGLE] Received Google authentication request for: ${email || 'unknown'}`);

    let userEmail = email;
    let userName = name;
    let userPhoto = photo;

    // Verify Firebase token if present
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userEmail = decodedToken.email;
        
        try {
          const userRecord = await admin.auth().getUser(decodedToken.uid);
          userName = userRecord.displayName || userName;
          userPhoto = userRecord.photoURL || userPhoto;
        } catch (firebaseErr) {
          console.warn('[AUTH GOOGLE] Firebase user record query failed, falling back to body parameters:', firebaseErr.message);
        }
      } catch (tokenErr) {
        console.error('[AUTH GOOGLE] Firebase ID token validation failed:', tokenErr.message);
        return res.status(401).json({ error: 'Invalid Firebase ID token' });
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'Email address is required for Google login' });
    }

    // Find or create the user in the database
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`[AUTH GOOGLE] First-time Google login. Registering user: ${userEmail}`);
      user = new User({
        name: userName || 'Google User',
        email: userEmail,
        photo: userPhoto || null,
        password: 'google-auth-user', // Stand-in password
        role: 'user'
      });
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH GOOGLE] CRITICAL: JWT_SECRET not configured!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log(`[AUTH GOOGLE] Session token issued successfully for: ${userEmail}`);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get active session user
 */
const getMe = async (req, res, next) => {
  try {
    const role = req.user.role || 'user';
    let account = null;

    if (role === 'admin') {
      account = await Admin.findById(req.user.id);
    } else if (role === 'driver') {
      account = await Driver.findById(req.user.id);
    } else {
      account = await User.findById(req.user.id);
    }

    // Comprehensive backup scan across collections if roles mismatch or outdated tokens are used
    if (!account) {
      account = await User.findById(req.user.id) || 
                await Driver.findById(req.user.id) || 
                await Admin.findById(req.user.id);
    }

    if (!account) {
      return res.status(404).json({ error: 'Authenticated account profile not found' });
    }

    const finalRole = account.role || role;

    res.json({
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: finalRole,
        photo: account.photo || null
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Request Password Reset Email Token
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Try finding the user in User, Driver, or Admin collections
    let account = await User.findOne({ email }) || 
                  await Driver.findOne({ email }) || 
                  await Admin.findOne({ email });

    if (!account) {
      return res.status(404).json({ error: 'No account registered with this email address' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    account.resetPasswordToken = token;
    account.resetPasswordExpires = Date.now() + 3600000; // 1 Hour lifespan
    await account.save();

    // Frontend landing link
    const resetUrl = `https://tripzo-app.vercel.app/reset-password/${token}`;
    await sendPasswordResetEmail(account.email, resetUrl, account.name);

    console.log(`[AUTH FORGOT] Password reset link sent to: ${email}`);

    res.json({
      message: 'Password reset link sent successfully. Please check your inbox'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    // Scan all three collections for this active reset token
    let account = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!account) {
      account = await Driver.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!account) {
      account = await Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!account) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    // Hash and store the new password
    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(password, salt);
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;
    await account.save();

    console.log(`[AUTH RESET] Password changed successfully for user: ${account.email}`);

    res.json({
      message: 'Password has been updated successfully. You can now log in'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Register a driver (Admin-only restriction)
 */
const registerDriver = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter name, email, and password for onboarding' });
    }

    if (!isAllowedEmail(email)) {
      return res.status(400).json({ error: 'Only gmail.com and outlook.com allowed for driver onboarding' });
    }

    const existingAccount = await User.findOne({ email }) || 
                            await Admin.findOne({ email }) || 
                            await Driver.findOne({ email });

    if (existingAccount) {
      return res.status(400).json({ error: 'An account is already registered with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const driver = new Driver({
      name,
      email,
      password: hashedPassword
    });

    await driver.save();
    console.log(`[AUTH DRIVER-REG] Driver onboarding success: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Driver onboarding completed successfully',
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Client Session Termination Stub
 */
const logout = async (req, res, next) => {
  try {
    res.json({ message: 'Session terminated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  forgotPassword,
  resetPassword,
  registerDriver,
  logout
};
