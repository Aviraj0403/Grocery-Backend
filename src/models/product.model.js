import mongoose from "mongoose";

// Schema for product variants (e.g., 100g, 1kg, etc.)
const variantSchema = new mongoose.Schema({
  unit: { type: String, required: true },         // e.g., '100g', '1kg', '500ml'
  price: { type: Number, required: true },
  stockQty: { type: Number, default: 0 },
  packaging: { type: String, default: 'Loose' }   // e.g., Pouch, Bottle, Jar
}, { _id: false });

// Main Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

  multilingualName: {
    en: { type: String, trim: true },
    hi: { type: String, trim: true },
  },

  productCode: { type: String, unique: true, sparse: true }, // Optional SKU/barcode

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },

  brand: { type: String, default: 'Unbranded' },

  description: { type: String, trim: true },

  variants: [variantSchema],

  activeVariant: { type: String }, // e.g., '1kg' (default shown unit)

  tags: [String],
  images: [String],

  discount: { type: Number, default: 0 }, // Percentage

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  bestBeforeDays: { type: Number }, // Optional: for groceries

  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  meta: {
    origin: String,
    expiryDate: Date,
    ingredients: String,
  },
}, { timestamps: true });

productSchema.index({ name: 'text', tags: 'text', brand: 'text' });

const Product = mongoose.model("Product", productSchema);
export default Product;
export { variantSchema };
