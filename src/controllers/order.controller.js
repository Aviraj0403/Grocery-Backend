import mongoose from 'mongoose';
import Cart from '../models/cart.model.js';
import users from '../models/user.model.js';
import orders from '../models/order.model.js';
import Product from '../models/product.model.js';

/**
 * @desc Place an order using cart data
 * @route POST /api/orders
 * @access Private (User)
 */
export const placeOrderFromCart = async (req, res, next) => {
  try {
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

    // Extract optional discount fields from request body
    const {
      shippingAddress,
      paymentMethod = 'COD',
      paymentStatus = 'Pending',
      discountAmount = 0,
      discountCode = null,
      offerApplied = null, // ObjectId if using Offer model
    } = req.body;

    const finalAmount = totalAmount - discountAmount;

    const order = await orders.create({
      user: userId,
      items: cart.items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      discountAmount,
      discountCode,
      offerApplied,
      totalAmount: finalAmount
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Order Placement Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      totalAmount,
      finalAmount,
      discount,
      offerApplied,
      shipping,
      paymentMethod
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }

    // Create order
    const newOrder = await orders.create({
      user: userId,
      items,
      shippingAddress: {
        fullName: shipping.fullName,
        phone: shipping.phoneNumber,
        addressLine1: shipping.street,
        addressLine2: shipping.addressLine2 || "",
        city: shipping.city,
        state: shipping.state,
        pinCode: shipping.postalCode,
        country: shipping.country
      },
      paymentMethod,
      paymentStatus: paymentMethod === "ONLINE" ? "Paid" : "Pending",
      orderStatus: "Pending",
      totalAmount: finalAmount,
      discountAmount: discount,
      offerApplied: offerApplied || null,
    });

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    // Populate items.product if it references a Product model (optional but recommended)
    await newOrder.populate({
      path: "items.product",
      select: "name price variants" // adjust fields as needed
    });

    // Prepare the response order object to match frontend expectations
    const orderResponse = {
      id: newOrder._id.toString(),
      userId: newOrder.user.toString(),
      items: newOrder.items.map(item => ({
        product: item.product._id.toString(),
        name: item.product.name,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || null,
        price: item.selectedVariant?.price || item.product.price || 0,
      })),
      totalAmount: newOrder.totalAmount,
      finalAmount: newOrder.totalAmount, // or use separate field if needed
      discount: newOrder.discountAmount || 0,
      shipping: {
        fullName: newOrder.shippingAddress.fullName,
        phoneNumber: newOrder.shippingAddress.phone,
        street: newOrder.shippingAddress.addressLine1,
        addressLine2: newOrder.shippingAddress.addressLine2,
        city: newOrder.shippingAddress.city,
        state: newOrder.shippingAddress.state,
        postalCode: newOrder.shippingAddress.pinCode,
        country: newOrder.shippingAddress.country,
        email: shipping.email || "N/A", // add email if your schema stores it, else fallback
      },
      paymentMethod: newOrder.paymentMethod,
      orderDate: newOrder.createdAt, // ensure timestamps enabled in schema
      status: newOrder.orderStatus
    };

    return res.status(201).json({ success: true, message: "Order placed", order: orderResponse });
  } catch (err) {
    console.error("Order error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



/**
 * @desc Get all orders for logged-in user
 * @route GET /api/orders/my
 * @access Private (User)
 */
export const getUserOrders = async (req, res) => {
  try {
    const order1 = await orders.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, order1 });
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
    const order = await orders.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching order' });
  }
};
//admin
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user existence (optional)
    const userExists = await users.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch orders for that user
    const userOrders = await orders.find({ user: userId })
      .populate('items.product', 'name price images variants')
      .populate('user', 'userName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders: userOrders });
  } catch (error) {
    console.error('Admin getOrdersByUserId Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: error.message });
  }
};

/**
 * @desc Get all orders (admin)
 * @route GET /api/orders
 * @access Private (Admin)
 */
export const getAllOrders = async (req, res) => {
  const { month, year } = req.query;

  const filter = {};

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1); // next month start

    filter.createdAt = { $gte: startDate, $lt: endDate };
  }
  try {
    const allOrders = await orders.find(filter)
      .populate('user', 'userName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("Get All Orders Error:", error); // ✅ Log actual error
    return res.status(500).json({ success: false, message: 'Failed to fetch all orders', error: error.message });
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

    const order = await orders.findById(req.params.id);
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
    const deleted = await orders.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
  }
};

export const getOrderDetailsAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orders.findById(orderId)
      .populate('items.product', 'name price images variants') // populate product info & variants
      .populate('user', 'userName email')
      .populate('offerApplied', 'code description discountPercent'); // optional offer details if used

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Format order data (optional, you can do it here or on frontend)
    const orderData = {
      _id: order._id,
      user: order.user,
      items: order.items.map(item => ({
        product: item.product,
        selectedVariant: item.selectedVariant,
        quantity: item.quantity,
      })),
      shipping: {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pinCode: order.shippingAddress.pinCode,
        country: order.shippingAddress.country,
      },
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      discountCode: order.discountCode,
      offerApplied: order.offerApplied,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      placedAt: order.placedAt,
    };

    return res.status(200).json({ success: true, order: orderData });
  } catch (error) {
    console.error('Admin getOrderDetailsAdmin Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details', error: error.message });
  }
};

/**
 * @desc Get orders with flexible date filter (admin)
 * @route GET /api/orders/filter
 * @access Private (Admin)
 * 
 * Query params supported:
 * - range = "today" | "15days" | "1month" | "custom"
 * - startDate, endDate (ISO strings) for custom range
 */
export const getFilteredOrders = async (req, res) => {
  try {
    const { range, startDate, endDate, month, year } = req.query;

    let start, end;

    if (month && year) {
      // Parse month/year filter
      // month is '01' to '12', convert to zero-based index for Date
      const m = parseInt(month) - 1;
      const y = parseInt(year);

      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0, 23, 59, 59, 999); // last day of month
    } else {
      const now = new Date();

      switch (range) {
        case '15days':
          start = new Date(now);
          start.setDate(now.getDate() - 15);
          start.setHours(0, 0, 0, 0);
          end = now;
          break;

        case '1month':
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
          start.setHours(0, 0, 0, 0);
          end = now;
          break;

        case 'custom':
          if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Custom range requires startDate and endDate" });
          }
          start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          break;

        case 'today':
        default:
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
          break;
      }
    }

    const filteredOrders = await orders.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate('user', 'userName email')
      .populate('items.product', 'name price images variants')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error("Get Filtered Orders Error:", error);
    return res.status(500).json({ success: false, message: 'Failed to fetch filtered orders', error: error.message });
  }
};
export const getTotalOrders = async (req, res) => {
  try {
    const total = await orders.countDocuments();

    res.status(200).json({
      success: true,
      totalOrders: total,
    });
  } catch (error) {
    console.error("Error fetching total orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total orderss.",
      error: error.message,
    });
  }
};

