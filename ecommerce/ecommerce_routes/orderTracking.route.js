import express from "express";
import { updateOrderStatus } from "../controllers/orderTrackingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/update-status", protect, adminOnly, updateOrderStatus);

export default router;
