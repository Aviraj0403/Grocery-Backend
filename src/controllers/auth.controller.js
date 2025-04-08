// authController.js
import users from '../models/user.model.js';
import { comparePassword } from '../utils/comparePassword.js';
import { generateToken } from '../utils/generateJWTToken.js';
import hashPassword from '../utils/hashPassword.js';
import generateOTP from '../utils/generateOTP.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const register = async (req, res) => {
  try {
    const { userName, email, password, phoneNumber } = req.body;

    // Validate required fields
    if (!userName || (!email && !phoneNumber) || !password) {
      return res.status(400).json({ message: "All fields are required: userName, email or phoneNumber, and password." });
    }

    // Optional: Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    // Check if email or phone number is already registered
    const duplicateUser = await users.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (duplicateUser) {
      if (duplicateUser.email === email) {
        return res.status(409).json({ message: "Email is already registered." });
      }
      if (duplicateUser.phoneNumber === phoneNumber) {
        return res.status(409).json({ message: "Phone number is already registered." });
      }
    }

    // Hash the password before saving to the database
    const hashedPassword = hashPassword(password);

    // Create new user
    await users.create({
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};

// Login (Email or Username + Password)
export const login = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!(userName || email) || !password) {
      return res.status(400).json({ message: "Username/email or password missing" });
    }

    const userDetails = await users.findOne({ $or: [{ userName }, { email }] });
    if (!userDetails || !(await comparePassword(userDetails.password, password))) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const userData = {
      id: userDetails._id,
      userName: userDetails.userName,
      email: userDetails.email,
      roleType: userDetails.roleType,
    };

    const token = await generateToken(res, userData);

    res.status(200).json({ userData, token, message: "User logged in successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Request OTP for phone login
// export const requestOtpLogin = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
//     if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });

//     let user = await users.findOne({ phoneNumber });
//     if (!user) {
//       user = await users.create({ userName: `user${Date.now()}`, phoneNumber, isVerified: false });
//     }

//     const otp = generateOTP();
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
//     user.otp = { code: otp, expiresAt };
//     await user.save();

//     console.log(`Mock OTP sent to ${phoneNumber}: ${otp}`);
//     res.status(200).json({ message: "OTP sent successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// };

// Verify OTP
// export const verifyOtpLogin = async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;
//     if (!phoneNumber || !otp) return res.status(400).json({ message: "Phone and OTP required" });

//     const user = await users.findOne({ phoneNumber });
//     if (!user || !user.otp) return res.status(404).json({ message: "Invalid request" });

//     const isOtpValid = user.otp.code === otp && new Date(user.otp.expiresAt) > new Date();
//     if (!isOtpValid) return res.status(401).json({ message: "Invalid or expired OTP" });

//     user.otp = undefined;
//     user.isVerified = true;
//     await user.save();

//     const userData = { id: user._id, userName: user.userName, phoneNumber: user.phoneNumber, roleType: user.roleType };
//     const token = await generateToken(res, userData);

//     res.status(200).json({ message: "OTP verified and logged in", token, userData });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to verify OTP" });
//   }
// };

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await users.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save();

  console.log(`Reset token for ${email}: ${token}`);
  res.status(200).json({ message: "Reset token sent to email" });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await users.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};

// Google OAuth Login
export const googleLogin = async (req, res) => {
  const { tokenId } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { email, name, sub } = payload;

  let user = await users.findOne({ email });
  if (!user) {
    user = await users.create({
      userName: name,
      email,
      password: hashPassword(sub),
      isVerified: true,
    });
  }

  const userData = { id: user._id, userName: user.userName, email: user.email, roleType: user.roleType };
  const token = await generateToken(res, userData);

  res.status(200).json({ userData, token, message: "Google login success" });
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Profile
export const profile = async (req, res) => {
  try {
    const userProfileDetail = await users.findById(req.user.id).select("-password");
    res.status(200).json({ userProfileDetail });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Auth Check
export const authMe = async (req, res) => {
  try {
    const data = req.user;
    if (!data) return res.status(401).json({ message: "Auth failed, login again" });
    res.status(200).json({ data });
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate" });
  }
};
