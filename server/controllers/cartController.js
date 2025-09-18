import Product from '../models/product.model.js';
import mongoose from 'mongoose';

export const updateCartQuantities = async (req, res) => {
  const { cartItems } = req.body;

  if (!Array.isArray(cartItems)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid cart items data.'
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check product availability and quantities
    const updates = [];
    const insufficientStock = [];

    for (const item of cartItems) {
      const product = await Product.findById(item._id).session(session);
      
      if (!product) {
        insufficientStock.push({
          productId: item._id,
          message: 'Product not found'
        });
        continue;
      }

      const requestedQty = parseInt(item.qunty, 10);
      
      if (isNaN(requestedQty) || requestedQty <= 0) {
        insufficientStock.push({
          productId: item._id,
          message: 'Invalid quantity'
        });
        continue;
      }

      if (product.quantity < requestedQty) {
        insufficientStock.push({
          productId: item._id,
          name: product.proName,
          available: product.quantity,
          requested: requestedQty,
          message: 'Insufficient stock'
        });
      }

      // If we got here, the product is available
      updates.push({
        _id: item._id,
        available: product.quantity,
        price: product.price,
        name: product.proName
      });
    }

    if (insufficientStock.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Some items have insufficient stock',
        insufficientStock,
        availableItems: updates
      });
    }

    // If we get here, all items are available
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Cart items validated',
      items: updates
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error validating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating cart',
      error: error.message
    });
  }
};

export const updateProductQuantities = async (cartItems, session) => {
  const updatedProducts = [];
  
  for (const item of cartItems) {
    const product = await Product.findById(item._id).session(session);
    if (!product) {
      throw new Error(`Product not found: ${item._id}`);
    }

    const quantity = parseInt(item.qunty, 10);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for product: ${product.proName}`);
    }

    if (product.qunty < quantity) {
      throw new Error(`Insufficient stock for ${product.proName}. Available: ${product.qunty}`);
    }

    // Update product quantity
    product.qunty -= quantity;
    // Add sold tracking if needed (uncomment if you add this field)
    // product.sold = (product.sold || 0) + quantity;
    await product.save({ session });
    
    updatedProducts.push({
      productId: product._id,
      name: product.proName,
      quantity,
      remaining: product.qunty
    });
  }

  return updatedProducts;
};
