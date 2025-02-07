import express from "express";
const router = express.Router();

import { createPaymentIntent, capturePayment } from "../controller/payment.controller.js";
import { auth } from "../middleware/auth.js";

router.use(auth);

router.post("/create-paypal-order", createPaymentIntent);
router.post("/capture-paypal-order", capturePayment);
// Router.post("/webhook", express.raw({ type: "application/json" }), handlePaymentWebhook);

export default router;
