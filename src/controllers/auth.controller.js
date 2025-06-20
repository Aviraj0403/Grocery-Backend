import users from '../models/user.model.js';
import { comparePassword } from '../utils/comparePassword.js';
import { generateToken } from '../utils/generateJWTToken.js';
import hashPassword from '../utils/hashPassword.js';
import generateOTP from '../utils/generateOTP.js';
import sendMailer from '../utils/emailService.js';
import cloudinary from '../config/cloudinaryConfig.js';
import { sendOtpViaSms } from "../utils/sendSms.js";
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
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const userData = decoded.data;

    const accessToken = jwt.sign(
      { data: userData },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
// Request OTP for phone login
// export const requestOtpLogin = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
//     if (!phoneNumber) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }

//     let user = await users.findOne({ phoneNumber });

//     if (!user) {
//       user = await users.create({
//         userName: `user${Date.now()}`,
//         phoneNumber,
//         isVerified: false,
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

//     user.otp = { code: otp, expiresAt };
//     await user.save();

//     const message = `Your OTP code is ${otp}. It will expire in 5 minutes. -Team AviRaj`;

//     const smsResponse = await sendOtpViaSms(phoneNumber, message);

//     if (smsResponse.data.response?.status !== "success") {
//       console.error("❌ SMS failed:", smsResponse.data);
//       return res.status(500).json({ message: "Failed to send OTP via SMS" });
//     }

//     console.log(`✅ OTP sent to ${phoneNumber}: ${otp}`);
//     res.status(200).json({ message: "OTP sent successfully" });

//   } catch (error) {
//     console.error("❌ OTP error:", error.message);
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
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000); // ✅ numeric OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // ✅ 10 minutes expiry

    user.resetOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // ✅ Send OTP via mail
    await sendMailer(email, "Password Reset OTP", "otp", {
      customerName: user.userName,
      otp,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await users.findOne({ email });

    if (!user || user.resetOTP !== Number(otp) || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = hashPassword(newPassword); // Make sure hashPassword is correct & async handled if needed
    user.resetOTP = null;
    user.otpExpiry = null;
    await user.save();

    await sendMailer(email, "Password Reset Confirmation", "resetPassword", {
      customerName: user.userName,
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password", error: err.message });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await users.findOne({ email });

    if (!user || user.resetOTP !== Number(otp) || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // user.resetOTP = undefined;
    // user.otpExpiry = undefined;
    // await user.save();

    return res.status(200).json({
      message: "OTP verified",
      success: true,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to verify OTP",
      error: err.message,
    });
  }
};






// Google OAuth Middleware
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await users.findById(userId);
    const isMatch = await comparePassword(user.password, currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};

// Google OAuth Login  --> Pending
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
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

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
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address } = req.body;

    // Prevent updates to protected fields
    const forbiddenFields = ['email', 'password', 'roleType', '_id'];
    for (let key of forbiddenFields) {
      if (req.body[key]) {
        return res.status(400).json({ message: `You cannot update field: ${key}` });
      }
    }

    const user = await users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    // Handle avatar
    if (req.file?.path) {
      user.avatar = req.file.path;
    } else if (req.body.avatar) {
      // Optional: validate avatar URL here
      user.avatar = req.body.avatar;
    }

    // Handle address update
    if (address) {
      const allowedAddressFields = ['street', 'city', 'state', 'zip', 'country'];
      const isInvalidField = Object.keys(address).some(field => !allowedAddressFields.includes(field));
      if (isInvalidField) {
        return res.status(400).json({ message: "Invalid address fields submitted" });
      }

      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      userProfile: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      message: "Something went wrong while updating the profile",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const user = await users.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      width: 300,
      crop: "scale"
    });

    // Save Cloudinary URL in DB
    user.avatar = result.secure_url;
    await user.save();

    // Delete temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatarUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

