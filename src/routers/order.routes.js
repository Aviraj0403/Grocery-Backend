import express from 'express';
import {
  placeOrderFromCart,
  getUserOrders,
  getUserOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  createOrder,
  getFilteredOrders,
  getOrdersByUserId,
  getOrderDetailsAdmin,
  getTotalOrders,

} from '../controllers/order.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';


const router = express.Router();

// ========== USER ROUTES ==========
router.post('/createOrder', verifyToken, createOrder);                // Create a new order
router.post('/placeOrderFromCart', verifyToken, placeOrderFromCart);                // Place order from cart
router.get('/getUserOrders', verifyToken, getUserOrders);                    // Get logged-in user's orders
router.get('/getUserOrderById/:id',verifyToken, getUserOrderById);                // Get one order by ID

// ========== ADMIN ROUTES ==========
router.get('/getAllOrders', getAllOrders); 
router.get('/getTotalOrders', getTotalOrders); // Get total number of orders
router.get('/getOrderDetailsAdmin/:orderId', getOrderDetailsAdmin); // Get order details for admin
router.get('/getOrdersByUserId/:id', getOrdersByUserId);
router.get('/filter',  getFilteredOrders); 
            // Get all orders
router.put('/updateOrderStatus/:id',  updateOrderStatus);      // Update status/payment
router.delete('/deleteOrder/:id',  deleteOrder);         // Delete order

export default router;
