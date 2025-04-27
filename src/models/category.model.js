import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

  description: { type: String, trim: true },

  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
    validate: {
      validator: function(v) {
        return v === null || mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid ObjectId!`
    }
  },

  type: {
    type: String,
    enum: ['Main', 'Sub'],
    default: 'Main'
  },

  displayOrder: { type: Number, default: 0 },

  image: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length === 1;
      },
      message: 'Category must have exactly 1 image.'
    }
  },

  publicId: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ name: 'text', slug: 'text' });

const Category = mongoose.model("Category", categorySchema);
export default Category;
