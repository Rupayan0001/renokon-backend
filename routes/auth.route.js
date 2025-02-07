import express from "express";
import { signup, login, logout, sendOTP, verifyEmailMobile, resetPassword, enterNewPassword, verifyOtp } from "./../controller/auth.controller.js";
import { auth } from "../middleware/auth.js";
import rateLimiter from "express-rate-limit";
const router = express.Router();

const signUpLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    console.error(`Rate limit exceeded: IP ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({ message: "Too many signup attempts, please try again later." });
  },
});
const loginLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    console.error(`Rate limit exceeded: IP ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({ message: "Too many login attempts, please try again later." });
  },
});
const emailVerifyLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 25,
  handler: (req, res) => {
    console.error(`Rate limit exceeded: IP ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({ message: "Too many verify attempts, please try again later." });
  },
});
const resendOTPLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  handler: (req, res) => {
    console.error(`Rate limit exceeded: IP ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({ message: "Too many otp requests, please try again later." });
  },
});
const resetPasswordLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    console.error(`Rate limit exceeded: IP ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({ message: "Too many reset password requests, please try again later." });
  },
});

router.post("/signup", signUpLimiter, signup, sendOTP);
router.post("/resendOTP", resendOTPLimiter, sendOTP);
router.post("/verify_email_mobile", emailVerifyLimiter, verifyEmailMobile);

router.post("/login", loginLimiter, login);
router.post("/logout", auth, logout);

// router.get("/profile/:username", auth, getMe);

router.post("/reset_password", resetPasswordLimiter, resetPassword);
router.post("/verifyOtp", resendOTPLimiter, verifyOtp);
router.post("/enter_new_password", enterNewPassword);

export default router;
