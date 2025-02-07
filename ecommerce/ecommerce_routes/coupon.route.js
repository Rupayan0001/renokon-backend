import express from "express";
import { createCoupon, applyCoupon } from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createCoupon);
router.post("/apply", protect, applyCoupon);

export default router;
