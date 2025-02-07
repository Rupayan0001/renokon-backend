import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount * 100,
      currency: "usd",
      metadata: { orderId: order._id.toString() },
    });

    const payment = new Payment({
      user: req.user.id,
      order: order._id,
      amount: order.totalAmount,
      paymentIntentId: paymentIntent.id,
    });

    await payment.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: "Error processing payment" });
  }
};

// ✅ Handle Payment Webhook (Stripe)
export const handlePaymentWebhook = async (req, res) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (payment) {
      payment.status = "Completed";
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { status: "Paid" });
    }
  }

  res.status(200).send("Received");
};
