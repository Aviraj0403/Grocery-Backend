import mongoose from 'mongoose';
import { variantSchema } from './product.model.js';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  selectedVariant: variantSchema, // The selected unit/price/packaging
  quantity: {
    type: Number,
    required: true,
    min: 1,
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
