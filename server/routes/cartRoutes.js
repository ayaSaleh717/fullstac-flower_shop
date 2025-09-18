import express from 'express';
import { updateCartQuantities } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes with authentication middleware
router.use(protect);

// @desc    Validate cart items and check quantities
// @route   POST /api/cart/validate
// @access  Private
router.post('/validate', updateCartQuantities);

export default router;
