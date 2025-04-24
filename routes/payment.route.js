import express from "express";
const router = express.Router();

import { initiatePayment, walletHistory, verifyPayment, processPayout, orderConfirmed } from "../controller/payment.controller.js";
import { auth } from "../middleware/auth.js";

router.use(auth);

router.post("/createOrder", initiatePayment);
router.post("/verifyPayment/:orderId", verifyPayment);
router.post("/orderConfirmed/:orderId", orderConfirmed);
router.get("/walletHistory", walletHistory);
router.post("/withdraw", processPayout);
// router.post("/capture-paypal-order", capturePayment);
// Router.post("/webhook", express.raw({ type: "application/json" }), handlePaymentWebhook);

export default router;
