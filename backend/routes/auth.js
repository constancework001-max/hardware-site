const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendLoginEmail } = require('../utils/email');

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required.'
    });
  }

  try {
    // Check existing user
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: 'Email already registered.'
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hash, phone || null]
    );

    const user = result.rows[0];

    // Create token
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
    // Find user
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

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials.'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    console.log("✅ User logged in:", user.email);

    // ================= EMAIL SEND (NON-BLOCKING) =================
    sendLoginEmail(user.email, user.name)
      .then(() => console.log("📩 Email sent to:", user.email))
      .catch(err => console.error("❌ Email failed:", err.message));

    // ============================================================

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