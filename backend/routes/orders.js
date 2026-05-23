const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// POST /api/orders - place an order
router.post('/', authMiddleware, async (req, res) => {
  const { items, shipping_address } = req.body;
  // items = [{ product_id, quantity }]
  if (!items || items.length === 0)
    return res.status(400).json({ message: 'No items in order.' });
  if (!shipping_address)
    return res.status(400).json({ message: 'Shipping address is required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const prodRes = await client.query('SELECT * FROM products WHERE id = $1 AND is_active = true FOR UPDATE', [item.product_id]);
      if (prodRes.rows.length === 0) throw new Error(`Product ${item.product_id} not found.`);
      const product = prodRes.rows[0];
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}.`);
      totalAmount += product.price * item.quantity;
      orderItems.push({ product, quantity: item.quantity, price: product.price });
    }

    const orderRes = await client.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, totalAmount, shipping_address]
    );
    const order = orderRes.rows[0];

    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.product.id, item.quantity, item.price]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product.id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ ...order, items: orderItems.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.price })) });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

// GET /api/orders - get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ordersRes = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const orders = ordersRes.rows;

    for (const order of orders) {
      const itemsRes = await pool.query(
        `SELECT oi.*, p.name, p.image_url FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsRes.rows;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/orders/:id - cancel an order
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (orderRes.rows.length === 0) throw new Error('Order not found.');
    const order = orderRes.rows[0];
    if (['shipped', 'delivered', 'cancelled'].includes(order.status))
      throw new Error(`Cannot cancel a ${order.status} order.`);

    // Restore stock
    const items = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of items.rows) {
      await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    const updated = await client.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [order.id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Order cancelled successfully.', order: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});

// GET /api/orders/admin/all - admin
router.get('/admin/all', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/orders/admin/:id - update order status (admin)
router.put('/admin/:id', adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  try {
    const result = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
