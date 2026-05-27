const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/email');

// ================= OTP STORE (TEMP MEMORY) =================
const otpStore = {}; // { email: { otp, expires } }

// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("🔐 OTP:", otp);

    // ⏳ Save OTP with expiry (5 mins)
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    // ⏱️ Delay to avoid Gmail blocking
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("📨 Sending OTP to:", email);

    // 📩 Send Email
    await sendOTPEmail(email, otp);

    console.log("✅ OTP email sent successfully");

    res.json({ message: 'OTP sent successfully' });

  } catch (err) {
    console.error("❌ OTP SEND ERROR:", err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});


// ================= LOGIN WITH OTP =================
router.post('/login', async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    return res.status(400).json({
      message: 'Email, password and OTP are required.'
    });
  }

  try {
    // 🔍 Check user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 🔐 Check OTP
    const storedOTP = otpStore[email];

    if (!storedOTP) {
      return res.status(400).json({ message: 'OTP not requested.' });
    }

    if (storedOTP.expires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired.' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // 🧹 Clear OTP after use
    delete otpStore[email];

    // 🎟️ Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    console.log("✅ Login successful:", user.email);

    res.json({ token, user: safeUser });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ================= PROFILE =================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, address, role, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("❌ Profile error:", err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ================= UPDATE PROFILE =================
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name=$1, phone=$2, address=$3 
       WHERE id=$4 
       RETURNING id, name, email, phone, address, role`,
      [name, phone, address, req.user.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("❌ Update profile error:", err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;