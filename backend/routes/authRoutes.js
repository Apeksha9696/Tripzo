const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    // check password (hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: 'Server error',
    });
  }
});


// ================= GOOGLE LOGIN =================
router.post('/google', async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    // check existing user
    let user = await User.findOne({ email });

    // create user if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        photo,
        password: 'google-auth',
        role: 'user',
      });
    }

    // create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: 'Google authentication failed',
    });
  }
});


module.exports = router;