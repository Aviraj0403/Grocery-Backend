import mongoose from "mongoose";
import { variantSchema } from "./product.model.js";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  selectedVariant: variantSchema,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pinCode: String,
    country: { type: String, default: "India" }
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  totalAmount: {
    type: Number,
    required: true
  },
  placedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const orders = mongoose.model("orders", orderSchema);
export default orders;
