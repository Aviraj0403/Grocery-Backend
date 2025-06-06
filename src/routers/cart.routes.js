import express from 'express';
import {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.get('/getUserCart',verifyToken, getUserCart);
router.post('/addToCart', verifyToken, addToCart);
router.put('/updateCartItem', verifyToken ,updateCartItem);
router.delete('/removeCartItem', verifyToken, removeCartItem);
router.delete('/clearCart',  verifyToken, clearCart);

export default router;
