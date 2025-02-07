import express from "express";
import { createAd, getAdsByUser, deleteAd } from "../controllers/adController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createAd);
router.get("/", protect, getAdsByUser);
router.delete("/:adId", protect, deleteAd);

export default router;
