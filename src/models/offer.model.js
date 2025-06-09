import mongoose from 'mongoose';

// Define the schema for the offer model
const offerSchema = new mongoose.Schema({
  name: { type: String, required: false, trim: true }, // optional
  code: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: { type: Number, min: 0, max: 100 }, // optional
  maxDiscountAmount: { type: Number, default: null },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  applyAutomatically: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  maxUsageCount: { type: Number, default: 40 }
});


// Create and export the model
const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
