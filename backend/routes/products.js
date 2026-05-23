const express = require('express');
const router = express.Router();

// TEMP: Dummy products data
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: "8GB RAM", price: 2500 },
    { id: 2, name: "1TB SSD", price: 5000 },
    { id: 3, name: "Mechanical Keyboard", price: 3500 }
  ]);
});

module.exports = router;