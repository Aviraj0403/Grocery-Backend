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

    // Fetch the product to know its existing images
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Delete previous images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        // Assuming Cloudinary URLs follow the pattern:
        // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<extension>
        const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
        const match = imageUrl.match(regex);
        if (match && match[1]) {
          const publicId = match[1]; // Extracted public_id
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          } catch (err) {
            console.error("Error deleting image from Cloudinary:", err);
            // Optionally, continue or send an error response if image deletion is critical.
          }
        }
      }
    }

    // Upload new images to Cloudinary
    const imageUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Transformations: resizing to 800x800px and converting to WebP format.
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: process.env.CF, // Folder name from your environment variable
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'webp' },
        ],
      });
      imageUrls.push(uploadResult.secure_url);

      // Remove file from local storage after uploading.
      fs.unlinkSync(file.path);
    }

    // Update the product with the new image URLs.
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { images: imageUrls },
      { new: true } // Return the updated document.
    );

    res.status(200).json({
      success: true,
      message: "Images updated successfully.",
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
// export const addProductImages = async (req, res) => {
//   try {
//     const { productId } = req.params; // Get the productId from URL parameters
//     const files = req.files; // Get the files uploaded via form-data

//     // Allow either 1 image or exactly 3 images
//     if (!files || (files.length !== 1 && files.length !== 3)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please upload either 1 or 3 images.",
//       });
//     }

//     // Array to hold Cloudinary URLs
//     const imageUrls = [];

//     // Upload each file to Cloudinary
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];

//       // Apply transformations: resizing to 800x800px and converting to WebP format
//       const uploadResult = await cloudinary.uploader.upload(file.path, {
//         folder: process.env.CF, // Folder name from environment variable
//         resource_type: 'image', // Specify that this is an image
//         transformation: [
//           { width: 800, height: 800, crop: 'limit' },
//           { quality: 'auto' },
//           { fetch_format: 'webp' },
//         ],
//       });

//       imageUrls.push(uploadResult.secure_url);

//       // Remove file from local storage after uploading
//       fs.unlinkSync(file.path);
//     }

//     // Update the product with the new image URLs
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       { images: imageUrls },
//       { new: true } // Return the updated document
//     );

//     res.status(200).json({
//       success: true,
//       message: "Images uploaded successfully.",
//       data: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Image upload failed:", error);
//     res.status(500).json({
//       success: false,
//       message: "Image upload failed.",
//       error: error.message,
//     });
//   }
// };

// Get All Products
// controllers/product.controller.js

export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 8, search = "", category } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("category subCategory")
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        total: totalProducts,
        page: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
        limit: Number(limit),
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

    // Fetch the product by ID and populate category, subCategory, and vendor fields.
    const product = await Product.findById(id).populate("category subCategory vendor");

    // If the product is not found, return a 404 error.
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Return the product details if found.
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
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

    // Extract fields to update from request body
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
      meta,
    } = req.body;

    // Build an update object with provided fields
    const updateData = {
      multilingualName,
      // Set productCode only if it's valid (non-empty); otherwise, undefined will remove it from update
      productCode: productCode && productCode.trim() !== "" ? productCode : undefined,
      category,
      // Convert an empty string to null so Mongoose can cast it properly
      subCategory: subCategory === "" ? null : subCategory,
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
      meta,
    };

    // If the name is being updated, generate a new slug and include the name field as well.
    if (name) {
      let baseSlug = slugify(name, {
        lower: true,
        strict: true,      // remove special characters
        replacement: '-',  // replace spaces with dashes
      });
      let slug = baseSlug;
      let count = 1;

      // Loop until a unique slug is found. Exclude the current product by _id.
      while (await Product.findOne({ slug, _id: { $ne: productId } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
      updateData.name = name;
      updateData.slug = slug;
    }

    // Update the product document and return the new version
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while updating the product.",
    });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product first to obtain its image URLs before deletion.
    const product = await Product.findById(id);
    
    // If the product is not found, return a 404 error.
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Delete images from Cloudinary if any exist.
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        // Cloudinary URLs are typically in the form:
        // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<extension>
        // The following regex extracts the public_id from such URLs.
        const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
        const match = imageUrl.match(regex);
        if (match && match[1]) {
          const publicId = match[1]; // extracted public_id
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
          } catch (err) {
            console.error("Error deleting image from Cloudinary:", err);
            // Optionally, you could choose to continue or return an error response.
          }
        }
      }
    }

    // Delete the product document from the database.
    await Product.findByIdAndDelete(id);

    // Return a success message after deletion.
    res.json({
      success: true,
      message: "Product deleted successfully and images removed from Cloudinary."
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product. Please try again later."
    });
  }
};
// New API: Fetch Products by Category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Product.find({ category }).limit(12);
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products by category" });
  }
};

