const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/email');

// TEMP OTP STORE (in-memory)
global.otpStore = global.otpStore || {};

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
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
    console.error("❌ Register error:", err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("🔐 OTP:", otp);

    // STORE OTP
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 mins
    };

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
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
    // CHECK USER
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // CHECK OTP
    const record = global.otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // DELETE OTP AFTER USE
    delete global.otpStore[email];

    // CREATE TOKEN
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });

  } catch (err) {
    console.error("❌ Login error:", err.message);
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
       SET name = $1, phone = $2, address = $3 
       WHERE id = $4 
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