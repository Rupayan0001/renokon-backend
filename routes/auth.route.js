import express from "express";
import { signup, login, logout, sendOTP, verifyEmailMobile, resetPassword, enterNewPassword, verifyOtp, exchangeJWT } from "./../controller/auth.controller.js";
import { auth } from "../middleware/auth.js";
import rateLimiter from "express-rate-limit";
import passport from "passport";
import "./../lib/passport.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import redisClient from "../lib/redis.js";

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
router.post("/exchangeJWT", exchangeJWT);

// router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google", (req, res, next) => {
  const redirect = req.query.redirect || "web";
  console.log("redirect", redirect, req.originalUrl);
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
  })(req, res, next);
});

router.get("/google/callback", passport.authenticate("google", { session: false }), async (req, res) => {
  const id = req.user?._id;
  const redirectTarget = req.query.state || "web";

  // const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "30d", algorithm: "HS256" });

  // console.log("Logged in successfully: req.query.redirect", redirectTarget);
  if (redirectTarget === "app") {
    const code = uuidv4();
    await redisClient.set(`code-${code}`, JSON.stringify({ userId: id }), "EX", 120);
    return res.send(`
     <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Opening Renokon...</title>
    <style>
      body {
        margin: 0;
        background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
        color: #f5f5f5;
        font-family: 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
        overflow: hidden;
      }

      h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
        animation: fadeIn 1.2s ease-out forwards;
      }

      .spinner {
        margin-top: 20px;
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top: 4px solid #00bcd4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      a {
        margin-top: 20px;
        display: inline-block;
        color: #00bcd4;
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        animation: fadeIn 2s ease-out forwards;
      }

      a:hover {
        text-decoration: underline;
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <h1>Redirecting to the Renokon app...</h1>
    <div class="spinner"></div>
    <a href="renokon://auth-complete?code=${code}">Tap here to open Renokon ${code}</a>

    <script>
      setTimeout(() => {
        window.location.href = "renokon://auth-complete?code=${code}";
      }, 500);
    </script>
  </body>
</html>

    `);
  } else {
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "30d", algorithm: "HS256" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "None" : "lax",
      secure: NODE_ENV === "production" ? true : false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    return res.redirect(NODE_ENV === "production" ? "https://www.renokon.com" : "http://localhost:5173");
  }

  // return res.status(200).json({ sendUser: req.user, message: "Logged in successfully" });
});

// API route to get user info
router.get("/api/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  res.json(req.user);
});

export default router;
