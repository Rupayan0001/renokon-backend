import express from "express";
import { createPaymentIntent, handlePaymentWebhook } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/webhook", express.raw({ type: "application/json" }), handlePaymentWebhook);

export default router;
