import mongoose from 'mongoose';
import Offer from '../models/offer.model.js';

// Create offer (promo code or auto offer)
export const createOffer = async (req, res, next) => {
  try {
    const {
      name,
      code,
      discountPercentage,
      maxDiscountAmount,
      startDate,
      endDate,
      status,
      applyAutomatically,
      maxUsageCount
    } = req.body;

    const newOffer = new Offer({
      name,
      code: code ? code.toUpperCase().trim() : undefined,
      discountPercentage,
      maxDiscountAmount,
      startDate,
      endDate,
      status,
      applyAutomatically,
      maxUsageCount
    });

    const savedOffer = await newOffer.save();
    return res.status(201).json({ message: 'Offer created successfully.', data: savedOffer.toObject() });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.code) {
      return res.status(409).json({ message: 'Offer code must be unique.' });
    }
    console.error('Error creating offer:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get all offers
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ message: 'Offers retrieved successfully.', data: offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get offer by ID
export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid offer ID.' });
    }

    const offer = await Offer.findById(id).lean();
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    return res.status(200).json({ message: 'Offer retrieved successfully.', data: offer });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update offer
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid offer ID.' });
    }

    if (updates._id) delete updates._id;

    if (updates.code) {
      const existingCode = await Offer.findOne({ code: updates.code.toUpperCase().trim() });
      if (existingCode && existingCode._id.toString() !== id) {
        return res.status(409).json({ message: 'Offer code must be unique.' });
      }
    }

    const updatedOffer = await Offer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    return res.status(200).json({ message: 'Offer updated successfully.', data: updatedOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete offer
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid offer ID.' });
    }

    const deleted = await Offer.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    return res.status(200).json({ message: 'Offer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get active offers
// Get active offers
export const getActiveOffers = async (req, res) => {
  try {
    const currentDate = new Date();

    const activeOffers = await Offer.find({
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    })
      .sort({ startDate: 1 }) // Show soonest starting offers first
      .lean();

    return res.status(200).json({
      message: 'Active offers retrieved successfully.',
      data: activeOffers,
    });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


// Validate promo code
export const validatePromoCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Promo code is required.' });
    }

    const currentDate = new Date();
    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).lean();

    if (!offer) {
      return res.status(404).json({ message: 'Invalid or expired promo code.' });
    }

    return res.status(200).json({
      message: 'Promo code is valid.',
      data: {
        offerId: offer._id,
        name: offer.name,
        discountPercentage: offer.discountPercentage,
        applyAutomatically: offer.applyAutomatically,
        startDate: offer.startDate,
        endDate: offer.endDate,
      },
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Apply promo code discount
export const applyDiscount = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code || !totalAmount) {
      return res.status(400).json({ message: 'Promo code and total amount are required.' });
    }

    const currentDate = new Date();
    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).lean();

    if (!offer) {
      return res.status(404).json({ message: 'Invalid or expired promo code.' });
    }

    let discountAmount = (offer.discountPercentage / 100) * totalAmount;

    // Apply max discount cap if applicable
    if (offer.maxDiscountAmount !== null && discountAmount > offer.maxDiscountAmount) {
      discountAmount = offer.maxDiscountAmount;
    }

    const finalAmount = totalAmount - discountAmount;

    return res.status(200).json({
      message: 'Promo code applied successfully.',
      data: {
        discountAmount,
        finalAmount,
        offerDetails: {
          name: offer.name,
          discountPercentage: offer.discountPercentage,
          maxDiscountAmount: offer.maxDiscountAmount ?? null,
        },
      },
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get active promo code based offers
// Get active promo code based offers
export const getActivePromoCodeOffers = async (req, res) => {
  try {
    const currentDate = new Date();

    const promoCodeOffers = await Offer.find({
      code: { $nin: [null, ''] }, // FIXED: Correct way to check not null or empty
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).lean();

    return res.status(200).json({
      message: 'Active promo code offers retrieved successfully.',
      data: promoCodeOffers
    });
  } catch (error) {
    console.error('Error fetching promo code offers:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

