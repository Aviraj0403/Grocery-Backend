import express from 'express';
import {
  createProduct,
  addProductImages,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getTotalProducts,
} from '../controllers/product.controller.js';
import  upload  from '../middlewares/upload.js'; // Assuming you have a multer setup in middlewares/multer.js
import { verifyToken } from '../middlewares/verifyToken.js';
const router = express.Router();

router.post("/createProduct",createProduct);
router.post('/products/:productId/images', upload.array('files'), addProductImages);
router.get("/getAllProducts",getAllProducts);
router.get('/products', getAllProducts); // ✅ handles ?category= in query
router.get("/getProduct/:id",getProduct);
router.put("/updateProduct/:productId",updateProduct)
router.delete("/deleteProduct/:id",deleteProduct);
router.get('/totalProducts', getTotalProducts); // Get total number of products
router.get('/products/category', getProductsByCategory);

export default router;
