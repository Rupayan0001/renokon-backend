import { Cashfree } from "cashfree-pg";
import Wallet from "../model/game_model/wallet.model.js";
import axios from "axios";
import UserModel from "../model/user.model.js";
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = process.env.NODE_ENV === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders";

export const initiatePayment = async (req, res) => {
  try {
    const { orderId, customerName, customerEmail, amount } = req.body;
    const user = req.user;

    const response = await axios.post(
      CASHFREE_API_URL,
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: user._id,
          customer_name: user.name,
          customer_email: customerEmail,
          customer_phone: user.mobile,
        },
        order_meta: {
          return_url: process.env.NODE_ENV === "production" ? "https://renokon.com/wallet" : "http://localhost:5000/wallet",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
        },
      }
    );
    // console.log("amount: ", amount);
    // const response = await axios.post(
    //   CASHFREE_API_URL,
    //   {
    //     link_id: orderId,
    //     link_amount: amount,
    //     link_currency: "INR",
    //     link_purpose: "Wallet Top-up",
    //     customer_details: {
    //       customer_id: String(user._id),
    //       customer_name: user.name,
    //       customer_email: customerEmail,
    //       customer_phone: "9748589803",
    //     },
    //     link_notify: {
    //       sendSms: true,
    //       sendEmail: true,
    //     },
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       "x-client-id": CASHFREE_APP_ID,
    //       "x-client-secret": CASHFREE_SECRET_KEY,
    //       "x-api-version": "2022-09-01",
    //     },
    //   }
    // );

    return res.status(200).json({ success: true, paymentSessionId: response.data.payment_session_id });
  } catch (error) {
    console.error("Cashfree Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ success: false, message: "Order id is not provided" });
    const response = await axios.get(`${CASHFREE_API_URL}/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });
    console.log("response: ", response);
    if (response.data.order_status !== "PAID") return res.status(400).json({ success: false, message: "Payment not verified" });
    if (response.data.order_status === "PAID") {
      const amount = response.data.order_amount;
      const wallet = await Wallet.findOne({ userId: response.data.customer_details.customer_id });
      await UserModel.findByIdAndUpdate(response.data.customer_details.customer_id, { $inc: { walletBalance: amount } });
      if (!wallet) {
        const newWallet = await Wallet.create({ userId: response.data.customer_details.customer_id, balance: amount });
        // await newWallet.save();
      } else {
        wallet.balance += amount;
        await wallet.save();
      }
    }
    return res.status(200).json({ success: true, message: "Payment verified", data: response.data });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({ success: false, message: "VerifyPayment failed" });
  }
};

export const walletHistory = async (req, res) => {
  try {
    const user = req.user;
    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) return res.status(200).json({ message: "No transaction found", success: false });
    return res.status(200).json({ wallet, success: true });
  } catch (error) {
    console.error("Error in fetching wallet history", error);
    res.status(500).json({ success: false, message: "Wallet history retrieval failed" });
  }
};
