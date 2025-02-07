import express from "express";
import { createLiveShopping, getLiveShoppingEvents } from "../controllers/liveShoppingController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sellerOnly, createLiveShopping);
router.get("/", getLiveShoppingEvents);

export default router;
