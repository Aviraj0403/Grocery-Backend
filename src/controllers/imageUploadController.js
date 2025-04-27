import cloudinary from '../config/cloudinaryConfig.js'; // Import Cloudinary config
import fs from 'fs'; // File system module for handling local files

// This function handles uploading an image to Cloudinary
export const uploadImageToCloudinary = async (req, res, next) => {
  try {
    if (req.file) {
      // Upload the image to Cloudinary using the synchronous upload method
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'uploads', // Customize the folder name on Cloudinary
        resource_type: 'image', // Set the resource type to image
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Resize image to 800x800
          { quality: 'auto' }, // Automatic quality adjustment
          { fetch_format: 'webp' }, // Convert to WebP format
        ],
      });

      // Attach Cloudinary URL and Public ID to the request for further processing
      req.cloudinaryImageUrl = uploadResult.secure_url; // Image URL
      req.cloudinaryPublicId = uploadResult.public_id; // Cloudinary public_id (for future deletion if needed)
      
      // Remove the file from local storage after upload
      fs.unlinkSync(req.file.path);

      next(); // Proceed to the next middleware or route handler
    } else {
      next(); // If no file is uploaded, continue to the next middleware
    }
  } catch (error) {
    console.error('Error during Cloudinary upload:', error);
    res.status(500).json({ success: false, message: 'Internal server error during image upload.' });
  }
};
