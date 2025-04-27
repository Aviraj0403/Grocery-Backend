import Category from "../models/category.model.js";
import slugify from 'slugify';
import { uploadImageToCloudinary } from '../controllers/imageUploadController.js'; // Reusable Cloudinary upload function
import { unlink } from 'fs/promises'; // Use async unlink for safer file deletion
import fs from 'fs'; // Ensure fs is imported

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      parentCategory,
      type,
      displayOrder
    } = req.body;

    // Validate name
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }

    // Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    // Handle image upload through Cloudinary
    await uploadImageToCloudinary(req, res, async () => {
      const imageUrl = req.cloudinaryImageUrl || ''; // Get image URL from the uploaded file

      // Create a new category
      const newCategory = await Category.create({
        name,
        slug,
        description,
        parentCategory: (type === 'Sub' && !parentCategory) ? null : parentCategory,
        type,
        displayOrder,
        image: imageUrl ? [imageUrl] : [],
        publicId: req.cloudinaryPublicId || '', // Store Cloudinary public_id for future deletion
      });

      console.log(newCategory);
      res.status(201).json({ success: true, category: newCategory });
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      parentCategory,
      type,
      displayOrder
    } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });

    let imageUrl = category.image[0]; // Keep the old image URL if no new image is uploaded
    let publicId = category.publicId;

    if (req.file) {
      // If there is an old image in Cloudinary, delete it before uploading the new one
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      // Use the URL and public ID from Cloudinary upload middleware
      imageUrl = req.cloudinaryImageUrl || category.image[0]; // New image URL if available
      publicId = req.cloudinaryPublicId || category.publicId; // New public ID if available

      // Remove the local file after uploading to Cloudinary
      try {
        const localFilePath = req.file.path; // Local file path
        console.log("Attempting to delete file at:", localFilePath); // Log the file path being deleted
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath); // Safely delete the local file
          console.log(`File deleted successfully: ${localFilePath}`);
        } else {
          console.log(`File ${localFilePath} not found, skipping deletion.`);
        }
      } catch (err) {
        console.error(`Error deleting local file: ${err.message}`);
      }
    }

    // Update the category data
    category.name = name || category.name;
    category.slug = slugify(name || category.name, { lower: true, strict: true });
    category.description = description || category.description;
    category.parentCategory = (type === 'Sub' && (!parentCategory || parentCategory === '')) ? null : parentCategory;
    category.type = type || category.type;
    category.displayOrder = displayOrder || category.displayOrder;
    category.image = [imageUrl];
    category.publicId = publicId;

    // Save the updated category
    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });

    // Delete Cloudinary image
    if (category.publicId) {
      await cloudinary.uploader.destroy(category.publicId);
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE CATEGORY
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
