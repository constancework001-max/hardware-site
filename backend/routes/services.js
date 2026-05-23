const express = require('express');
const router = express.Router();

// TEMP: Dummy data (no database)
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: "Screen Repair", price: 500 },
    { id: 2, name: "Battery Replacement", price: 800 },
    { id: 3, name: "OS Installation", price: 300 }
  ]);
});

module.exports = router;