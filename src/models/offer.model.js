import mongoose from 'mongoose';

// Define the schema for the offer model
const offerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { 
    type: String, 
    unique: true, 
    sparse: true,  // Allows multiple offers without code
    uppercase: true, 
    trim: true 
  },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  applyAutomatically: { type: Boolean, default: false }, // false means manual promo code
});

// Create and export the model
const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
