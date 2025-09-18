const express = require('express');
const router = express.Router();
const { commitPurchase, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// POST /api/orders/commit
router.post('/commit', protect, commitPurchase);

// GET /api/orders/user/:userId
router.get('/user/:userId', protect, getUserOrders);



module.exports = router;
