import users from "../models/user.model.js";
import mongoose from "mongoose";

export const addAddress = async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddress = {
      id: new mongoose.Types.ObjectId(),
      ...req.body,
    };

    // If user has no addresses, make this one default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to add address", error: err.message });
  }
};

// 📌 Update Address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addressIndex = user.addresses.findIndex((addr) => addr.id.toString() === id);
    if (addressIndex === -1) return res.status(404).json({ message: "Address not found" });

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      ...req.body,
    };

    await user.save();
    res.status(200).json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

// 📌 Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter((addr) => addr.id.toString() !== id);

    // If default was deleted, make first one default
    if (!user.addresses.some(addr => addr.isDefault) && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};

// 📌 Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let found = false;
    user.addresses.forEach((addr) => {
      if (addr.id.toString() === id) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) return res.status(404).json({ message: "Address not found" });

    await user.save();
    res.status(200).json({ message: "Default address set", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to set default", error: err.message });
  }
};
// Inside user.controller.js
export const getUserAddresses = async (req, res) => {
  try {
    const user = await users.findById(req.user.id).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Failed to get addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getTotalUsers = async (req, res) => {
  try {
    const total = await users.countDocuments();

    res.status(200).json({
      success: true,
      totalUsers: total,
    });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total users.",
      error: error.message,
    });
  }
};


