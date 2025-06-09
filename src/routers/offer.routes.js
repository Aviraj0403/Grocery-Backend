import express from 'express';
import {
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferById,
  getAllOffers,
  getActiveOffers,
  validatePromoCode,
  applyDiscount,
} from '../controllers/offer.controller.js';

const router = express.Router();

// Create a new offer (Admin/Authorized only)
router.post('/offers', createOffer);

// Update an existing offer by ID (Admin/Authorized only)
router.put('/offers/:id', updateOffer);

// Delete an offer by ID (Admin/Authorized only)
router.delete('/offers/:id', deleteOffer);

// Get all offers (Public or Admin)
router.get('/offers', getAllOffers);

// Get single offer by ID (Public or Admin)
router.get('/offers/:id', getOfferById);

// Get active offers (Public or Admin)
// Removed restaurantId param since controller doesn't use it
router.get('/offers/active', getActiveOffers);

// Validate promo code (Public)
router.get('/offers/validate/:code', validatePromoCode);

// Apply promo code to cart/order (Public)
router.post('/offers/apply-discount', applyDiscount);

export default router;
