import express from "express";
import { adminGetAllProducts } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/admin/products", adminGetAllProducts);

export default router;
