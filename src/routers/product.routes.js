import express from 'express';
import {
  createProduct,
  addProductImages,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import  upload  from '../middlewares/upload.js'; // Assuming you have a multer setup in middlewares/multer.js

const router = express.Router();

router.post("/createProduct",createProduct);
router.post('/products/:productId/images', upload.array('files'), addProductImages);
router.get("/getAllProducts",getAllProducts);
router.get("/getProduct/:id",getProduct);
router.put("/updateProduct/:productId",updateProduct)
router.delete("/deleteProduct/:id",deleteProduct);


export default router;
