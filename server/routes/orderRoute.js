import express from 'express';
import { 
  commitPurchase, 
  getUserOrders, 
  getOrderDetails 
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes with authentication middleware
router.use(protect);

// @desc    Create a new order (commit purchase)
// @route   POST /api/orders/commit
// @access  Private
router.post('/commit', commitPurchase);

// @desc    Get logged in user's orders
// @route   GET /api/orders/user/:userId
// @access  Private
router.get('/user/:userId', getUserOrders);

// @desc    Get order by ID
// @route   GET /api/orders/order/:orderId
// @access  Private
router.get('/order/:orderId', getOrderDetails);

export default router;
