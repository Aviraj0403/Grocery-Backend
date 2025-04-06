import express from 'express';
import {
  register,
  login,
  requestOtpLogin,
  verifyOtpLogin,
  forgotPassword,
  resetPassword,
  googleLogin,
  logout,
  profile,
  authMe,
} from '../controllers/auth.controller.js';

import { verifyToken } from '../middlewares/verifyToken.js'; 

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/otp/request', requestOtpLogin);
router.post('/otp/verify', verifyOtpLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google-login', googleLogin);

// Protected Routes
router.post('/logout', verifyToken, logout);
router.get('/profile', verifyToken, profile);
router.get('/me', verifyToken, authMe);

export default router;
