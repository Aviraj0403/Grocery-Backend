// controllers/orderController.js
import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

export const placeOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total
    let totalAmount = 0;
    cart.items.forEach(item => {
      totalAmount += item.selectedVariant.price * item.quantity;
    });

    const newOrder = await Order.create({
      user: userId,
      items: cart.items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || "COD",
      paymentStatus: req.body.paymentStatus || "Pending",
      totalAmount
    });

    // Clear cart after placing order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};
