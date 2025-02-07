import express from "express";
import { recommendProducts } from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, recommendProducts);

export default router;
