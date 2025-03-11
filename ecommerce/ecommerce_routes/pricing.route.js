import express from "express";
import { adjustPrices } from "../services/pricingService.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/adjust", protect, adminOnly, async (req, res) => {
  await adjustPrices();
  res.status(200).json({ message: "Prices adjusted dynamically!" });
});

export default router;
