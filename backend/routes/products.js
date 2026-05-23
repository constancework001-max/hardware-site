const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/products - list all products with optional filter
router.get('/', async (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  let query = 'SELECT * FROM products WHERE is_active = true';
  const params = [];

  if (category) { params.push(category); query += ` AND category = $${params.length}`; }
  if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`; }
  if (minPrice) { params.push(minPrice); query += ` AND price >= $${params.length}`; }
  if (maxPrice) { params.push(maxPrice); query += ` AND price <= $${params.length}`; }

  query += ' ORDER BY id';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/products - admin create product
router.post('/', adminMiddleware, async (req, res) => {
  const { name, description, price, stock, category, brand, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price are required.' });
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, category, brand, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, description, price, stock || 0, category, brand, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/products/:id - admin update product
router.put('/:id', adminMiddleware, async (req, res) => {
  const { name, description, price, stock, category, brand, image_url, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5, brand=$6, image_url=$7, is_active=$8 WHERE id=$9 RETURNING *',
      [name, description, price, stock, category, brand, image_url, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
