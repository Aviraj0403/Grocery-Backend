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
  updateProfile,
  uploadAvatar,
  authMe,
  refreshToken,
  verifyOtp,
} from '../controllers/auth.controller.js';
import  upload  from '../middlewares/upload.js';

import { verifyToken } from '../middlewares/verifyToken.js'; 

const router = express.Router();

// Public Routes
router.post('/user/register', register);
router.post('/user/login', login);
;
router.post('/user/forgotPassword', forgotPassword);
router.post('/user/resetPassword', resetPassword);
router.post('/user/verifyOtp', verifyOtp);
router.post('/user/googleLogin', googleLogin);

// Protected Routes
router.post('/user/logout', verifyToken, logout);
router.get('/user/profile', verifyToken,profile);
router.patch('/user/updateProfile', verifyToken, updateProfile);
router.post('/user/uploadAvatar', verifyToken, upload.single('avatar'), uploadAvatar);

router.get('/me', verifyToken, authMe);
router.post('/auth/refresh-token', refreshToken);


export default router;
