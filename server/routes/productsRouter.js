import express from 'express';
import { 
  addProduct, 
  getProducts, 
  getProductsByUser, 
  deleteProduct, 
  getProductsByCategory 
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingleImage, handleUploadError } from '../config/multer.js';

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);

// Protected routes (require authentication)
router.use(protect);

// GET PRODUCTS BY USER
router.get("/user/:userId", getProductsByUser);

// ADD A NEW PRODUCT
router.post("/add", uploadSingleImage, handleUploadError, addProduct);

// DELETE A PRODUCT
router.delete("/:id", deleteProduct);

export default router;
