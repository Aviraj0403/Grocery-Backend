import express from 'express';
import {
  placeOrderFromCart,
  getUserOrders,
  getUserOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/order.controller.js';


const router = express.Router();

// ========== USER ROUTES ==========
router.post('/placeOrderFromCart', placeOrderFromCart);                // Place order from cart
router.get('/getUserOrders',  getUserOrders);                    // Get logged-in user's orders
router.get('/getUserOrderById/:id', getUserOrderById);                // Get one order by ID

// ========== ADMIN ROUTES ==========
router.get('/getAllOrders', getAllOrders);              // Get all orders
router.put('/updateOrderStatus/:id',  updateOrderStatus);      // Update status/payment
router.delete('/deleteOrder/:id',  deleteOrder);         // Delete order

export default router;
