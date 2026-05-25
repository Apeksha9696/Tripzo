const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/logout', authController.logout);

// Protected endpoints
router.get('/me', auth, authController.getMe);

// Admin-only driver registration
router.post('/register-driver', auth, authorize('admin'), authController.registerDriver);

module.exports = router;