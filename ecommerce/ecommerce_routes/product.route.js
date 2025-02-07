import express from "express";
import { createProduct, getProducts, getProductById } from "../controllers/productController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, sellerOnly, upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
