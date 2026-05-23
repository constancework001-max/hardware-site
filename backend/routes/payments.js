const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payments/create-order - create Razorpay order
router.post('/create-order', authMiddleware, async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount) return res.status(400).json({ message: 'Amount is required.' });

  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay uses paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment gateway error.' });
  }
});

// POST /api/payments/verify - verify payment signature
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, reference_id } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature)
    return res.status(400).json({ message: 'Payment verification failed.' });

  try {
    if (type === 'order') {
      await pool.query(
        "UPDATE orders SET payment_id=$1, payment_status='paid', status='confirmed' WHERE id=$2",
        [razorpay_payment_id, reference_id]
      );
    } else if (type === 'booking') {
      await pool.query(
        "UPDATE service_bookings SET payment_id=$1, payment_status='paid', status='confirmed' WHERE id=$2",
        [razorpay_payment_id, reference_id]
      );
    }
    res.json({ message: 'Payment verified successfully.', payment_id: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating payment.' });
  }
});

module.exports = router;
