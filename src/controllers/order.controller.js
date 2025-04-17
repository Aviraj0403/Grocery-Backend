import mongoose from 'mongoose';
import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

/**
 * @desc Place an order using cart data
 * @route POST /api/orders
 * @access Private (User)
 */
export const placeOrderFromCart = async (req, res, next) => {
  try {
    // Ensure that the user is authenticated
    console.log("User ID from token:", req.user.id); // Debugging token data

    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      if (!item?.selectedVariant?.price || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid item in cart' });
      }
      totalAmount += item.selectedVariant.price * item.quantity;
    }

    const order = await Order.create({
      user: userId,
      items: cart.items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'COD',
      paymentStatus: req.body.paymentStatus || 'Pending',
      totalAmount
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Order Placement Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc Get all orders for logged-in user
 * @route GET /api/orders/my
 * @access Private (User)
 */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('GetUserOrders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * @desc Get a specific user order
 * @route GET /api/orders/:id
 * @access Private (User)
 */
export const getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching order' });
  }
};

/**
 * @desc Get all orders (admin)
 * @route GET /api/orders
 * @access Private (Admin)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'userName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch all orders' });
  }
};

/**
 * @desc Update order/payment status (admin)
 * @route PUT /api/orders/:id
 * @access Private (Admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json({ success: true, message: 'Order updated', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
};

/**
 * @desc Delete an order (admin)
 * @route DELETE /api/orders/:id
 * @access Private (Admin)
 */
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
  }
};
