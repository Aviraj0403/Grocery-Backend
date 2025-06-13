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
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
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
    avatar: {
      type: String, 
      default: "", 
      trim: true,
    },

   addresses: [
      {
        _id: false,
        id: {
          type: mongoose.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        label: { type: String, trim: true, default: "Home" },
        phoneNumber: { type: String, trim: true },
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'India' },
        isDefault: { type: Boolean, default: false },
      },
    ],


    resetOTP: { type: Number },
    otpExpiry: { type: Date },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const users = mongoose.model('users', userSchema);

export default users;
