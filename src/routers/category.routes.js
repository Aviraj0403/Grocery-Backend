import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

import { verifyToken } from '../middlewares/verifyToken.js';  

const router = express.Router();

router.post("/createCategory", createCategory);
router.get("/getAllCategories", getAllCategories);
router.get("/getCategory/:id", getCategory);
router.put("/updateCategory/:id", updateCategory);
router.delete("/deleteCategory/:id", deleteCategory);

export default router;
