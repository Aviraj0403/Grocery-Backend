import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getMainCategories
} from '../controllers/category.controller.js';
import  upload  from '../middlewares/upload.js';
import {uploadImageToCloudinary} from '../controllers/imageUploadController.js'
import { verifyToken } from '../middlewares/verifyToken.js';  

const router = express.Router();

router.post("/createCategory", upload.single('image'), verifyToken, uploadImageToCloudinary, createCategory);
router.get("/getAllCategories", getAllCategories);
router.get("/getMainCategories", getMainCategories);
router.get("/getCategory/:id", getCategory);
router.put("/updateCategory/:id", upload.single('image'),verifyToken, uploadImageToCloudinary,updateCategory);
router.delete("/deleteCategory/:id", deleteCategory);

export default router;
