import express from "express";
import {
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getUserAddresses
       } 
from "../controllers/user.controller.js";
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();


router.post('/user/address', verifyToken, addAddress);
router.patch('/user/address/:id', verifyToken, updateAddress);
router.delete('/user/address/:id', verifyToken, deleteAddress);
router.get('/user/getaddresses', verifyToken, getUserAddresses);

router.patch('/user/address/:id/set-default', verifyToken, setDefaultAddress);

export default router;
