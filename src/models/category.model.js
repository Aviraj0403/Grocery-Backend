import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

  description: { type: String, trim: true },

  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null, // Root categories have null
  },

  type: {
    type: String,
    enum: ['Main', 'Sub'],
    default: 'Main'
  },

  displayOrder: { type: Number, default: 0 },

  image: { type: String }, // Icon/banner path
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ name: 'text', slug: 'text' });

const Category = mongoose.model("Category", categorySchema);
export default Category;
