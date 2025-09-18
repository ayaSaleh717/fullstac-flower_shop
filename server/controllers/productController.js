import mongoose from 'mongoose';
import Product from '../models/product.model.js';

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category', 'name')  // Changed from 'catId' to 'category' and 'catName' to 'name'
      .populate('userId', 'name email');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId })
      .populate('category', 'name')
      .populate('userId', 'name email');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    console.log('=== Request Headers ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
    console.log('=== Request Body ===');
    console.log('Body:', req.body);
    console.log('=== Request File ===');
    console.log('File:', req.file);
    
    // Get form data from either JSON body or form-data
    const name = req.body.name || '';
    const price = req.body.price || 0;
    const category = req.body.category || '';
    const description = req.body.description || '';
    const farm = req.body.farm || '';
    const qunty = Number(req.body.qunty) || 1;
    const imageUrl = req.body.imageUrl;
    
    const userId = req.user?.id; // User ID from auth middleware

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!price) missingFields.push('price');
    if (!category) missingFields.push('category');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    // Validate price is a positive number
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
        field: 'price',
        value: price
      });
    }

    // Handle file upload or image URL
    let imagePath = 'https://th.bing.com/th/id/OIP.B48GIfsNVKZyQrnMorCipwHaFj?w=220&h=180&c=7&r=0&o=7&dpr=1.5'; // Default image
    
    // If file was uploaded via multer
    if (req.file) {
      // Make sure to use a full URL for the client to access
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imagePath = `${baseUrl}/uploads/${req.file.filename}`;
      console.log('Using uploaded file:', imagePath);
    } 
    // If image URL was provided
    else if (imageUrl) {
      try {
        // If it's a relative path, convert to full URL
        if (!imageUrl.startsWith('http')) {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          imagePath = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        } else {
          imagePath = imageUrl;
        }
        console.log('Using image URL:', imagePath);
      } catch (err) {
        console.error('Invalid image URL:', err);
        // Continue with default image instead of failing
        console.log('Using default image due to invalid URL');
      }
    }

    // Create new product
    const newProduct = new Product({
      name,
      price: Number(price),
      category, // Using category field to match schema
      userId,
      description,
      farm,
      qunty: Number(qunty) || 1,
      image: imagePath
    });

    // Save to database
    const savedProduct = await newProduct.save();
    
    // Populate category and user info for response
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('category', 'name')
      .populate('userId', 'name email');
      
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: populatedProduct
    });
    
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists'
      });
    }
    
    // Handle invalid ObjectId for category
    if (error.name === 'CastError' && error.path === 'category') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get products by user
const getProductsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const products = await Product.find({ userId })
      .populate('category', 'name')
      .populate('userId', 'name email');
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: product._id }
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { 
  getProducts, 
  addProduct, 
  getProductsByUser, 
  deleteProduct, 
  getProductsByCategory 
};
