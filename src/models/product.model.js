import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  stockQty: { type: Number, default: 0 },
  packaging: { type: String, default: 'Loose' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  multilingualName: {
    en: { type: String, trim: true },
    hi: { type: String, trim: true },
  },
  productCode: { type: String, unique: true, sparse: true },
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
  activeVariant: { type: String },
  tags: [String],
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length === 0 || v.length === 1 || v.length === 3;
      },
      message: 'A product must have either 1 or 3 images, if provided.'
    },
  },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bestBeforeDays: { type: Number },
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
