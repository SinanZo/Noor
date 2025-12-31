const express = require('express');
const router = express.Router();

// Placeholder routes
router.get('/businesses', (req, res) => {
  res.json({ message: 'Search halal businesses' });
});

router.get('/business/:id', (req, res) => {
  res.json({ message: `Get business ${req.params.id}` });
});

router.post('/scan', (req, res) => {
  res.json({ message: 'Scan barcode' });
});

module.exports = router;
