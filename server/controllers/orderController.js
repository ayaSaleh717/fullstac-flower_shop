import User from '../models/users.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import mongoose from 'mongoose';
import { updateProductQuantities } from './cartController.js';
// Commit a purchase
export const commitPurchase = async (req, res) => {
  const { userId, cart, total } = req.body;

  if (!userId || !cart || !Array.isArray(cart) || cart.length === 0 || total === undefined) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid purchase data.' 
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check user's balance and get user
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    if (user.balance < total) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient balance.' 
      });
    }

    // 2. Update product quantities and get order items
    const updatedProducts = await updateProductQuantities(cart, session);

    // 3. Deduct total from user's balance
    user.balance -= Number(total);
    await user.save({ session });

    // 4. Create order items
    const orderItems = await Promise.all(cart.map(async (item) => {
      const product = await Product.findById(item._id).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item._id}`);
      }

      const quantity = parseInt(item.qunty, 10);
      
      return {
        productId: product._id,
        name: product.proName || 'Product',
        quantity: quantity,
        price: Number(product.price) || 0,
        image: product.img || ''
      };
    }));

    const order = new Order({
      userId,
      cart: orderItems,
      total: Number(total),
      status: 'completed',
      paymentStatus: 'paid'
    });

    await order.save({ session });
    await session.commitTransaction();
    
    res.status(200).json({ 
      success: true,
      message: 'Purchase completed successfully', 
      orderId: order._id,
      remainingBalance: user.balance
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing purchase:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing purchase', 
      error: error.message 
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  console.log("getUserOrders called");
  console.log("Request user:", req.user);
  console.log("Request params:", req.params);
  
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Convert both IDs to string for reliable comparison
    const userIdStr = String(userId);
    const reqUserIdStr = String(req.user._id);
    
    console.log("Comparing user IDs:", { requested: userIdStr, authenticated: reqUserIdStr });
    
    // Verify the user is requesting their own orders or is an admin
    if (userIdStr !== reqUserIdStr && req.user.role !== 'admin') {
      console.log("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders',
        requestedUserId: userIdStr,
        authenticatedUserId: reqUserIdStr
      });
    }

    // Find orders where userId matches the requested user ID
    const orders = await Order.find({ userId: userId })
      .populate({
        path: 'cart.productId',
        select: 'proName img price description category'
      })
      .sort({ createdAt: -1 });
    
    // Format the orders data for better frontend consumption
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.cart.map(item => ({
        _id: item._id,
        product: item.productId ? {
          _id: item.productId._id,
          name: item.productId.proName,
          image: item.productId.img,
          price: item.productId.price,
          category: item.productId.category
        } : {
          name: item.name,
          price: item.price,
          image: item.image
        },
        quantity: item.quantity,
        price: item.price
      }))
    }));
    
    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  console.log("proccing")
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('cart.productId', 'proName img price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
};
