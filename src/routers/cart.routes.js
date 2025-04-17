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

router.get('/getUserCart', getUserCart);
router.post('/addToCart', verifyToken, addToCart);
router.put('/updateCartItem',  updateCartItem);
router.delete('/removeCartItem',  removeCartItem);
router.delete('/clearCart',  clearCart);

export default router;
