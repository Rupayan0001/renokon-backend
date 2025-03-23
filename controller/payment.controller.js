import { Cashfree } from "cashfree-pg";
import Wallet from "../model/game_model/wallet.model.js";
import { withdrawalRequestEmailTemplate, newWithdrawalRequestAdminEmail, depositSuccessEmailTemplate } from "../emails/emailTemplate.js";
import { sendEmail } from "../lib/emailService.js";
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

    return res.status(200).json({ success: true, paymentSessionId: response.data.payment_session_id });
  } catch (error) {
    console.error("Cashfree Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;
    if (!orderId) return res.status(400).json({ success: false, message: "Order id is not provided" });
    const response = await axios.get(`${CASHFREE_API_URL}/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });
    if (response.data.order_status !== "PAID") return res.status(400).json({ success: false, message: "Payment not verified" });
    let amount;
    let wallet;
    if (response.data.order_status === "PAID") {
      amount = response.data.order_amount;
      wallet = await Wallet.findOneAndUpdate({ userId: user._id }, { $inc: { balance: amount } }, { new: true, upsert: true });
    }
    const html = depositSuccessEmailTemplate(user.name, amount);
    await sendEmail(user.email, "Deposit Successful", html);
    return res.status(200).json({ success: true, message: "Payment verified", wallet });
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

const CASHFREE_PAYOUT_URL = process.env.NODE_ENV === "production" ? "https://payout-api.cashfree.com/payout/v2/transfer" : "https://payout-gamma.cashfree.com/payout/v2/transfer";
const CASHFREE_PAYOUT_TOKEN_URL = process.env.NODE_ENV === "production" ? "https://payout-api.cashfree.com/payout/v1" : "https://payout-gamma.cashfree.com/payout/v1";

export const getAuthToken = async () => {
  try {
    const response = await axios.post(
      `${CASHFREE_PAYOUT_TOKEN_URL}/authorize`,
      {},
      {
        headers: {
          "x-client-id": process.env.CASHFREE_PAYOUT_ID_DEVELOPMENT,
          "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_DEVELOPMENT,
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
        },
      }
    );
    if (response.data.status === "SUCCESS") {
      return response.data.data.token;
    } else {
      throw Error;
    }
  } catch (error) {
    console.error("Cashfree Auth Error:", error);
    throw new Error("Authentication failed");
  }
};

// export const processPayout = async (req, res) => {
//   try {
//     const { amount, upiId } = req.body;

//     if (!amount || !upiId) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     // const token = await getAuthToken();

//     const transferId = `TXN-${Date.now()}`;

//     // {"transfer_id":"JUNOB2018","transfer_amount":1,"transfer_mode":"imps","beneficiary_details":{"beneficiary_details":{"beneficiary_instrument_details":{"bank_account_number":"1234554321","bank_ifsc":"SBIN0001161"}}}}
//     const payoutRequest = { transfer_id: transferId, transfer_amount: 1, beneficiary_details: { beneficiary_id: req.user._id } };
//     const response = await axios.post(`https://sandbox.cashfree.com/payout/transfers`, payoutRequest, {
//       headers: {
//         "x-client-id": process.env.CASHFREE_PAYOUT_ID_DEVELOPMENT,
//         "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_DEVELOPMENT,
//         "Content-Type": "application/json",
//         "x-api-version": "2024-01-01",
//       },
//     });
//     if (response.data.status === "SUCCESS") {
//       console.log(`[Payout Success] User: ${userId}, Amount: ₹${amount}, UPI: ${upiId}`);
//       return { success: true, data: response.data };
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: response.data.message,
//         data: response.data.data || {},
//       });
//     }
//   } catch (error) {
//     console.error("Payout Error:", error.response?.data || error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Withdrawal processing failed",
//       error: error.response?.data || error.message,
//     });
//   }
// };

export const processPayout = async (req, res) => {
  try {
    let { amount, upiId, requestId } = req.body;
    const user = req.user;

    if (!amount || !upiId || !requestId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    amount = Number(amount);
    if (amount <= 0) return res.status(400).json({ success: false, message: "Amount should be greater than 0" });
    const html = withdrawalRequestEmailTemplate(user.name, amount, upiId, requestId);
    await sendEmail(user.email, "Withdrawal Request Received", html);
    const balance = await Wallet.findOne({ userId: user._id });
    const html_2 = newWithdrawalRequestAdminEmail(user.name, amount, upiId, user._id, requestId, user.email, balance.balance);
    await sendEmail(`renokon.payment@gmail.com`, `New withdrawal Request- ${user._id}`, html_2);
    await Wallet.findOneAndUpdate({ userId: user._id }, { $inc: { withdrawalRequestAmount: amount, balance: -amount } });
    return res.status(200).json({ success: true, message: "Withdrawal request received" });
  } catch (error) {
    console.log(`Error in processPayout: ${error}`);
    return res.status(500).json({ success: false, message: "Withdrawal processing failed" });
  }
};

// const validateUPI = async (upiId) => {
//   console.log("Validating UPI ID:", upiId);
//   try {
//     const response = await axios.get(
//       `https://payout-api.cashfree.com/payout/v1/validation/upiDetails?upi=${upiId}`,
//       { upi_id: upiId },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           // Authorization: 'Bearer <your_authorization_token>',
//           "x-client-id": "905204d19831f9be445eefb6ff402509",
//           "x-client-secret": "cfsk_ma_prod_60791a3f4dbd212eab340eb644bbbd61_3032e9af",
//           "x-api-version": "2022-09-01",
//         },
//       }
//     );

//     if (response.data.valid) {
//       console.log("UPI ID is valid:", response.data.account_holder);
//       return { success: true, accountHolder: response.data.account_holder };
//     } else {
//       console.log("Invalid UPI ID:", upiId);
//       return { success: false, message: "Invalid UPI ID" };
//     }
//   } catch (error) {
//     console.error("Error validating UPI ID:", error);
//     return { success: false, message: "Failed to validate UPI ID" };
//   }
// };
