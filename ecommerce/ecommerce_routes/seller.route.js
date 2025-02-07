import express from "express";
import { registerAsSeller, getSellerProducts } from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, registerAsSeller);
router.get("/products", protect, getSellerProducts);

export default router;
