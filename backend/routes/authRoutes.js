const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // check password (plain for now)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      'secretkey',
      { expiresIn: '1d' }
    );

    // IMPORTANT RESPONSE
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role   // ✅ THIS FIXES YOUR ISSUE
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;