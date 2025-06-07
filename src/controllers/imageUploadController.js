// src/controllers/imageUploadController.js
import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs/promises'; // Using promise-based FS for async/await

export const uploadImageToCloudinary = async (req, res, next) => {
  try {
    if (!req.file?.path) return next();

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'webp' },
      ],
    });

    req.cloudinaryImageUrl = uploadResult.secure_url;
    req.cloudinaryPublicId = uploadResult.public_id;

    // ✅ Safely clean up local temp file
    await fs.unlink(req.file.path);

    next();
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during image upload.',
    });
  }
};
