import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    phoneNumber: {
      type: String, 
      unique: true,   // This already creates an index
      sparse: true,   // Makes the index sparse (for null or undefined values)
    },
    email: {
      type: String,
      required: true,
      unique: true,   // This already creates an index
      sparse: true,   // Makes the index sparse
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    roleType: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Remove duplicate index definitions
// userSchema.index({ userName: 1 });   // No need for this since it's not unique
// userSchema.index({ phoneNumber: 1 });  // Removed due to unique constraint
// userSchema.index({ email: 1 });  // Removed due to unique constraint

const users = mongoose.model('user', userSchema);
export default users;
