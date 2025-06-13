import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import cloudinary from '../config/cloudinaryConfig.js';
import slugify from 'slugify';
import fs from 'fs';

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, type, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }

    // Generate a unique slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const imageUrl = req.cloudinaryImageUrl || '';
    const publicId = req.cloudinaryPublicId || '';
     
      if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log(`🧹 Deleted local temp file: ${req.file.path}`);
    }

    const newCategory = await Category.create({
      name,
      slug,
      description,
      parentCategory: type === 'Sub' && !parentCategory ? null : parentCategory,
      type,
      displayOrder,
      image: imageUrl ? [imageUrl] : [],
      publicId,
    });

    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentCategory, type, displayOrder } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });

    let imageUrl = category.image?.[0] || '';
    let publicId = category.publicId;

    if (req.file && req.cloudinaryImageUrl && req.cloudinaryPublicId) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn(`Failed to delete old Cloudinary image: ${err.message}`);
        }
      }

      imageUrl = req.cloudinaryImageUrl;
      publicId = req.cloudinaryPublicId;

      const localPath = req.file.path;
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`Deleted local temp file: ${localPath}`);
      }
    }

    category.name = name || category.name;
    category.slug = slugify(name || category.name, { lower: true, strict: true });
    category.description = description || category.description;
    category.parentCategory = type === 'Sub' && !parentCategory ? null : parentCategory;
    category.type = type || category.type;
    category.displayOrder = displayOrder || category.displayOrder;
    category.image = [imageUrl];
    category.publicId = publicId;

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Delete image from Cloudinary
    if (category.publicId) {
      try {
        await cloudinary.uploader.destroy(category.publicId);
      } catch (err) {
        console.warn("Error deleting Cloudinary image:", err.message);
      }
    }

    // Nullify references in Product
    await Product.updateMany(
      { $or: [{ category: id }, { subCategory: id }] },
      { $set: { category: null, subCategory: null } }
    );

    await Category.findByIdAndDelete(id);

    res.json({ success: true, message: "Category deleted and related products updated." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET MAIN CATEGORIES
export const getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parentCategory: null }).sort({ displayOrder: 1 }).lean();
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching main categories:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET CATEGORY DETAILS (with subcategories + products)
export const getCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategories = await Category.find({ parentCategory: id }).sort({ displayOrder: 1 }).lean();
    const allCategoryIds = [id, ...subcategories.map(cat => cat._id)];

    const products = await Product.find({
      $or: [{ category: { $in: allCategoryIds } }, { subCategory: { $in: allCategoryIds } }]
    }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      subcategories,
      products
    });
  } catch (error) {
    console.error("Error fetching category details:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET SINGLE CATEGORY
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
