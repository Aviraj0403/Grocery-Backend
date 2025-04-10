import express from 'express';
import {
  register,
  login,
  // requestOtpLogin,
  // verifyOtpLogin,
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
router.post('/user/register', register);
router.post('/user/login', login);
// router.post('/otp/request', requestOtpLogin);
// router.post('/otp/verify', verifyOtpLogin);
router.post('/user/forgotPassword', forgotPassword);
router.post('/user/resetPassword', resetPassword);
router.post('/user/googleLogin', googleLogin);

// Protected Routes
router.post('/user/logout', verifyToken, logout);
router.get('/user/profile', verifyToken, profile);
router.get('/me', verifyToken, authMe);

export default router;
