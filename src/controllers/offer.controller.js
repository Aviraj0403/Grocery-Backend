import mongoose from 'mongoose';
import  Offer  from '../models/offer.model.js';

export const createOffer = async (req, res, next) => {
  try {
    const { name, code, discountPercentage, startDate, endDate, status, applyAutomatically } = req.body;

    // Validate required fields
    if (!name || discountPercentage === undefined || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, discountPercentage, startDate, and endDate are required.' });
    }

    // Create the new offer
    const newOffer = new Offer({
      name,
      code: code ? code.toUpperCase().trim() : undefined, // promo code is optional
      discountPercentage,
      startDate,
      endDate,
      status,
      applyAutomatically: applyAutomatically ?? false,
    });

    // Save the offer
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


// Get all offers - use lean for faster performance
export const getAllOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ message: 'Offers retrieved successfully.', data: offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get offer by ID - use lean
export const getOfferById = async (req, res, next) => {
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

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid offer ID.' });
    }

    // Prevent updating the _id field
    if (updates._id) delete updates._id;

    // Validate if the code is being updated and is unique
    if (updates.code) {
      const existingCode = await Offer.findOne({ code: updates.code.toUpperCase().trim() });
      if (existingCode && existingCode._id.toString() !== id) {
        return res.status(409).json({ message: 'Offer code must be unique.' });
      }
    }

    // Validate dates if they are being updated
    if (updates.startDate && updates.endDate) {
      const startDate = new Date(updates.startDate);
      const endDate = new Date(updates.endDate);
      if (startDate >= endDate) {
        return res.status(400).json({ message: 'Start date must be before end date.' });
      }
    }

    // Update the offer with new data
    const updatedOffer = await Offer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true, // Ensure that validation is run for the updated fields
    }).lean();

    // If no offer was found with the given ID
    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    return res.status(200).json({ message: 'Offer updated successfully.', data: updatedOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


// Delete offer by ID - no lean (returns deleted document, not always needed)
export const deleteOffer = async (req, res, next) => {
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

// Get active offers - use lean
export const getActiveOffers = async (req, res, next) => {
  try {
    const currentDate = new Date();

    const activeOffers = await Offer.find({
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).lean();

    return res.status(200).json({ message: 'Active offers retrieved successfully.', data: activeOffers });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const validatePromoCode = async (req, res, next) => {
  try {
    // Get the promo code from the URL parameter
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ message: 'Promo code is required.' });
    }

    const currentDate = new Date();

    // Query the Offer collection to find an active offer with the provided promo code
    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),  // Make sure the code is in uppercase and trimmed
      status: 'Active',                  // The offer should be active
      startDate: { $lte: currentDate },  // The offer start date should be before or equal to current date
      endDate: { $gte: currentDate },    // The offer end date should be after or equal to current date
    }).lean();

    if (!offer) {
      return res.status(404).json({ message: 'Invalid or expired promo code.' });
    }

    // Return the offer info along with the discount percentage
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
export const applyDiscount = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body;  // Expect code and the total cart/order amount

    if (!code || !totalAmount) {
      return res.status(400).json({ message: 'Promo code and total amount are required.' });
    }

    const currentDate = new Date();

    // Find offer with the given code that is active and within date range
    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),  // Ensure promo code is uppercased and trimmed
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).lean();

    if (!offer) {
      return res.status(404).json({ message: 'Invalid or expired promo code.' });
    }

    // Calculate the discount based on the discount percentage
    const discountAmount = (offer.discountPercentage / 100) * totalAmount;
    const finalAmount = totalAmount - discountAmount;  // Calculate final amount after discount

    return res.status(200).json({
      message: 'Promo code applied successfully.',
      data: {
        discountAmount,
        finalAmount,
        offerDetails: {
          name: offer.name,
          discountPercentage: offer.discountPercentage,
        },
      },
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

