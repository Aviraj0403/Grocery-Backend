import express from 'express';
import {
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferById,
    getAllOffers,
//   getOffers,
  getActiveOffers,
  validatePromoCode,
  applyDiscount
} from '../controllers/offer.controller.js';  // Import the controller functions
// import { adminMiddleware } from '../middlewares/adminMiddleware.js';  // Import the admin middleware (optional)
// import { authMiddleware } from '../middlewares/authMiddleware.js';  // Import auth middleware (optional)

const router = express.Router();

// Routes for offers

// Create a new offer (Only Admins or Authorized Users)
router.post('/offers', createOffer);

// Update an existing offer (Only Admins or Authorized Users)
router.put('/offers/:id', updateOffer);

// Delete an offer (Only Admins or Authorized Users)
router.delete('/offers/:id', deleteOffer);

// Get a list of all offers (Public or Admin Access)
router.get('/offers', getAllOffers);

// Get details of a single offer by ID (Public or Admin Access)
router.get('/offers/:id', getOfferById);

// Get active offers for a specific restaurant (Admin or Restaurant Owner)
router.get('/offers/active/:restaurantId', getActiveOffers);
router.get('/offers/validate/:code', validatePromoCode);

// Route for applying a promo code to a cart or order
router.post('/offers/apply-discount', applyDiscount);
export default router;
