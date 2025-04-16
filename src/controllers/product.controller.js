import Product from "../models/product.model.js";
import slugify from 'slugify';
import fs from 'fs';
import cloudinary from '../config/cloudinaryConfig.js';
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      multilingualName,
      productCode,
      category,
      subCategory,
      brand,
      description,
      variants,
      activeVariant,
      tags,
      images,
      discount,
      vendor,
      bestBeforeDays,
      isAvailable,
      isFeatured,
      meta
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name and category."
      });
    }

    // Create initial slug from name
    let baseSlug = slugify(name, {
      lower: true,
      strict: true,  // removes special characters
      replacement: '-', // replaces spaces with -
    });
    let slug = baseSlug;
    let count = 1;
    // Generate a unique slug if a product with the same slug exists
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // Remove productCode if it is an empty string.
    const validProductCode = productCode && productCode.trim() !== "" ? productCode : undefined;

    // Create new product
    const newProduct = await Product.create({
      name,
      slug, // our unique slug
      multilingualName,
      productCode: validProductCode,
      category,
      // Convert an empty string to null for subCategory so it passes type casting
      subCategory: subCategory === "" ? null : subCategory,
      brand,
      description,
      variants,
      activeVariant: activeVariant || (variants && variants.length > 0 ? variants[0].unit : ""),
      tags,
      images,
      discount: discount || 0,
      vendor,
      bestBeforeDays,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      meta
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: newProduct
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while creating the product."
    });
  }
};

export const addProductImages = async (req, res) => {
  try {
    const { productId } = req.params; // Get the productId from URL parameters
    const files = req.files; // Get the files uploaded via form-data

    // Allow either 1 image or exactly 3 images
    if (!files || (files.length !== 1 && files.length !== 3)) {
      return res.status(400).json({
        success: false,
        message: "Please upload either 1 or 3 images.",
      });
    }

    // Array to hold Cloudinary URLs
    const imageUrls = [];

    // Upload each file to Cloudinary
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Apply transformations: resizing to 800x800px and converting to WebP format
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: process.env.CF, // Folder name from environment variable
        resource_type: 'image', // Specify that this is an image
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'webp' },
        ],
      });

      imageUrls.push(uploadResult.secure_url);

      // Remove file from local storage after uploading
      fs.unlinkSync(file.path);
    }

    // Update the product with the new image URLs
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { images: imageUrls },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed.",
      error: error.message,
    });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query; // Optional query params for pagination and search

    // Calculate skip and limit for pagination
    const skip = (page - 1) * limit;
    
    // Search condition (if search query is provided)
    const searchCondition = search
      ? { $text: { $search: search } } // Full-text search on text fields like name, tags, etc.
      : {};

    // Fetch products with optional search, pagination, and sorting by createdAt (descending)
    const products = await Product.find(searchCondition)
      .populate("category subCategory")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Count total number of products to calculate total pages
    const totalProducts = await Product.countDocuments(searchCondition);

    // Prepare response with pagination info
    res.json({
      success: true,
      products,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        totalPages: Math.ceil(totalProducts / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get Single Product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the product by ID and populate category and subCategory fields
    const product = await Product.findById(id).populate("category subCategory");

    // If the product is not found, return a 404 error
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Return the product details if found
    res.json({
      success: true,
      product,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product. Please try again later."
    });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params; // ID of the product to update
    const {
      name,
      multilingualName,
      productCode,
      category,
      subCategory,
      brand,
      description,
      variants,
      activeVariant,
      tags,
      images,
      discount,
      vendor,
      bestBeforeDays,
      isAvailable,
      isFeatured,
      meta
    } = req.body;

    // Validate required fields
    if (!name || !category || !variants || !variants.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, category, or variants."
      });
    }

    // Generate slug from the name automatically (if changed)
    const slug = slugify(name, {
      lower: true,
      strict: true,
      replacement: '-',
    });

    // Check for duplicate slug only if name changed
    const existingProduct = await Product.findOne({ slug, _id: { $ne: productId } });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with the same name (slug) already exists."
      });
    }

    // Find the product to update
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Update the product with new data
    product.name = name;
    product.slug = slug;
    product.multilingualName = multilingualName;
    product.productCode = productCode || product.productCode; // Keep the old value if not provided
    product.category = category;
    product.subCategory = subCategory;
    product.brand = brand;
    product.description = description;
    product.variants = variants;
    product.activeVariant = activeVariant || variants[0].unit;
    product.tags = tags;
    product.images = images;
    product.discount = discount || 0;
    product.vendor = vendor;
    product.bestBeforeDays = bestBeforeDays;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.meta = meta;

    // Save the updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while updating the product."
    });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    // If the product is not found, return a 404 error
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Return a success message after the product is deleted
    res.json({
      success: true,
      message: "Product deleted successfully."
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product. Please try again later."
    });
  }
};
