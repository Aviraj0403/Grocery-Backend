import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';

const router = express.Router();

router.post("/createProduct",createProduct);
router.get("/getAllProducts",getAllProducts);
router.get("/getProduct/:id",getProduct);
router.put("/updateProduct/:id",updateProduct)
router.delete("/deleteProduct/:id",deleteProduct);


export default router;
