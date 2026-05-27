const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendLoginEmail, sendOTPEmail } = require('../utils/email');

let otpStore = {}; // memory store

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email=$1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name,email,password,phone)
       VALUES ($1,$2,$3,$4)
       RETURNING id,name,email,role`,
      [name, email, hash, phone || null]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    await sendOTPEmail(email, otp);

    console.log("📩 OTP:", otp);

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // PASSWORD CHECK
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    // OTP CHECK
    if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (otpStore[email].expires < Date.now()) {
      return res.status(401).json({ message: "OTP expired" });
    }

    delete otpStore[email];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    // Send login email (non-blocking)
    sendLoginEmail(user.email, user.name).catch(() => {});

    res.json({ token, user: safeUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= PROFILE =================
router.get('/profile', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT id,name,email FROM users WHERE id=$1',
    [req.user.id]
  );

  res.json(result.rows[0]);
});

module.exports = router;