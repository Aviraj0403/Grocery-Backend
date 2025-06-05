// src/middlewares/upload.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinaryConfig.js'; // Import Cloudinary configuration

// Ensure the uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create uploads directory if it doesn't exist
}

// Configure Multer to save files temporarily to the 'uploads/' directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Set the destination to the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Unique suffix
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Add extension to file name
  }
});

// Set up Multer with storage configuration
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
//   fileFilter: (req, file, cb) => {
//     // Allowed file types (jpeg, jpg, png, gif, avif)
//     const fileTypes = /jpeg|jpg|png|gif|avif/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = fileTypes.test(file.mimetype);

//     if (extname && mimetype) {
//       return cb(null, true); // If valid file type, allow the upload
//     } else {
//       cb(new Error('Error: File type not supported!')); // Error for unsupported file types
//     }
//   }
// });
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/avif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported! Received: ${file.mimetype}`));
    }
  }
});

export default upload; // Export Multer instance
