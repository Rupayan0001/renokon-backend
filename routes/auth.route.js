import express from "express";
import { signup, login, logout, sendOTP, verifyEmailMobile, resetPassword, enterNewPassword, verifyOtp } from "./../controller/auth.controller.js";
import { auth } from "../middleware/auth.js";
import rateLimiter from "express-rate-limit";
import passport from "passport";
import "./../lib/passport.js";
import jwt from "jsonwebtoken";
const NODE_ENV = process.env.NODE_ENV;
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
    res.status(429).json({ message: "Too many password reset requests, please try again later." });
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

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const id = req.user?._id;

  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "30d", algorithm: "HS256" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: NODE_ENV === "production" ? "None" : "lax",
    secure: NODE_ENV === "production" ? true : false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  console.log("Logged in successfully: req.query.redirect", req.query.redirect);
  if (req.query.redirect === "app") {
    return res.redirect("renokon://auth-complete");
  }
  res.redirect(NODE_ENV === "production" ? "https://www.renokon.com" : "http://localhost:5173");
  return;
  // return res.status(200).json({ sendUser: req.user, message: "Logged in successfully" });
});

// API route to get user info
router.get("/api/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  res.json(req.user);
});

export default router;
