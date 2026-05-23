require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
// app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

// Initialize DB then start server
// initDB().then(() => {
//   app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// }).catch(err => {
//   console.error('Failed to initialize database:', err);
//   process.exit(1);
// });
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));