const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendLoginEmail, sendOTPEmail } = require('../utils/email');

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required.'
    });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: 'Email already registered.'
      });
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

    console.log("✅ User registered:", user.email);

    res.status(201).json({ token, user });

  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.'
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials.'
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    console.log("✅ User logged in:", user.email);

    // ✅ EMAIL AFTER LOGIN
    sendLoginEmail(user.email, user.name)
      .then(() => console.log("📩 Login email sent"))
      .catch(err => console.error("❌ Email failed:", err.message));

    res.json({ token, user: safeUser });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expires]
    );

    await sendOTPEmail(email, otp);

    console.log("📩 OTP sent:", email, otp);

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error("❌ Send OTP error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


// ================= VERIFY OTP =================
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM otps WHERE email=$1 AND otp=$2 ORDER BY id DESC LIMIT 1',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const record = result.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ✅ Check user
    let userRes = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    let user;

    if (userRes.rows.length === 0) {
      const newUser = await pool.query(
        'INSERT INTO users (email, name) VALUES ($1,$2) RETURNING *',
        [email, "User"]
      );
      user = newUser.rows[0];
    } else {
      user = userRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("✅ OTP login success:", email);

    // ✅ SEND WELCOME EMAIL
    sendLoginEmail(user.email, user.name)
      .then(() => console.log("📩 Welcome email sent"))
      .catch(err => console.error("❌ Email failed:", err.message));

    res.json({ token, user });

  } catch (err) {
    console.error("❌ OTP verify error:", err.message);
    res.status(500).json({ message: "OTP verification failed" });
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
      return res.status(404).json({
        message: 'User not found.'
      });
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