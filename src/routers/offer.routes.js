import express from 'express';
import {
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferById,
  getAllOffers,
  getActiveOffers,
  getActivePromoCodeOffers,
  validatePromoCode,
  applyDiscount,
} from '../controllers/offer.controller.js';

const router = express.Router();

// Public/Admin Routes
router.get('/offers', getAllOffers);                      // All offers
router.get('/offers/active', getActiveOffers);            // Auto + promo offers active
router.get('/offers/active/promos', getActivePromoCodeOffers); // Promo-code-based active offers
router.get('/offers/:id', getOfferById);                  // Single offer by ID
router.get('/offers/validate/:code', validatePromoCode);  // Validate promo code
router.post('/offers/apply-discount', applyDiscount);     // Apply promo code discount

// Admin-only Routes (ideally with middleware)
router.post('/offers', createOffer);                      // Create offer
router.put('/offers/:id', updateOffer);                   // Update offer
router.delete('/offers/:id', deleteOffer);                // Delete offer

export default router;
