import express from 'express';
import { 
  getCategories, 
  addCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import Category from '../models/categorys.model.js';

const router = express.Router();

// Test endpoint to check database connection and categories
router.get('/test', async (req, res) => {
  try {
    const count = await Category.countDocuments();
    const sample = await Category.findOne();
    res.json({
      connected: true,
      totalCategories: count,
      sampleCategory: sample
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// Get all categories
router.get('/', getCategories);

// Add a new category
router.post('/add', addCategory);

// Delete a category
router.delete('/:id', deleteCategory);

export default router;
