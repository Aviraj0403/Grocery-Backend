import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

/**
 * @desc Get current user's cart
 * @route GET /api/cart
 * @access Private
 */
export const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images brand variants slug');

    // res.status(200).json({
    //   success: true,
    //   cart: cart || { user: req.user.id, items: [] }
    // });
    res.status(200).json({
      success: true,
      cart: cart
        ? {
            user: cart.user,
            updatedAt: cart.updatedAt,
            items: cart.items.map(item => ({
              productId: item.product._id,
              name: item.product.name,
              brand: item.product.brand,
              slug: item.product.slug,
              image: item.product.images[0], // First image as default
              selectedVariant: item.selectedVariant,
              quantity: item.quantity
            }))
          }
        : { user: req.user.id, items: [] }
    });
    
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get cart' });
  }
};


/**
 * @desc Add or update item in cart
 * @route POST /api/cart
 * @access Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, selectedVariant, quantity } = req.body;
    if (!productId || !selectedVariant || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid cart input' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if product + variant already in cart
    const index = cart.items.findIndex(item =>
      item.product.toString() === productId &&
      item.selectedVariant.unit === selectedVariant.unit
    );

    if (index > -1) {
      // Update quantity
      cart.items[index].quantity += quantity;
    } else {
      // Push new item
      cart.items.push({
        product: productId,
        selectedVariant,
        quantity
      });
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({ success: true, message: 'Cart updated', cart });

  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

/**
 * @desc Update item quantity in cart
 * @route PUT /api/cart
 * @access Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, unit, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const index = cart.items.findIndex(item =>
      item.product.toString() === productId &&
      item.selectedVariant.unit === unit
    );

    if (index === -1) return res.status(404).json({ success: false, message: 'Item not found' });

    if (quantity > 0) {
      cart.items[index].quantity = quantity;
    } else {
      cart.items.splice(index, 1);
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({ success: true, message: 'Cart item updated', cart });

  } catch (error) {
    console.error('Update Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart item' });
  }
};

/**
 * @desc Remove item from cart
 * @route DELETE /api/cart/item
 * @access Private
 */
export const removeCartItem = async (req, res) => {
  try {
    const { productId, unit } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item =>
      !(item.product.toString() === productId && item.selectedVariant.unit === unit)
    );

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({ success: true, message: 'Item removed from cart', cart });

  } catch (error) {
    console.error('Remove Item Error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
};

/**
 * @desc Clear entire cart
 * @route DELETE /api/cart/clear
 * @access Private
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await cart.save();
    }

    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
