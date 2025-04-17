import express from "express";
import { adminGetAllProducts,getAllAdmins,getAllCustomers } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/admin/products", adminGetAllProducts);
router.get('/customers', getAllCustomers);
router.get('/admins', getAllAdmins);

export default router;
