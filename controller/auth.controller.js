import Usermodel from "../model/user.model.js";
import OTP from "../model/otp.model.js";
import bcrypt from "bcryptjs";
import zod from "zod";
import jwt from "jsonwebtoken";
import cloudinary from "./../lib/cloudinary.js";
import { sendEmail } from "../lib/emailService.js";
import { createWelcomeEmailTemplate, verifyEmail, verifyEmailForPasswordReset, passwordChangedsuccessEmailTemplate } from "../emails/emailTemplate.js";
import path from "path";
// import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const BACKEND_HOST = process.env.BACKEND_HOST;

// need to add each user should have a unique mobile no
export const signup = async (req, res, next) => {
  try {
    let { username, email, password, name, mobile } = req.body;
    console.log("Signup started... ", email);

    if (!username || !email || !password || !name || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }
    email = email.toLowerCase();
    // finding if the user already exists
    mobile = mobile.toString();

    const existingUser = await Usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // checking if username is not available

    const existingUserName = await Usermodel.findOne({ username });
    if (existingUserName) {
      return res.status(400).json({ message: "Username not available, use different username" });
    }
    if (!name.includes(" ") || !(name.split(" ").slice(-1)[0].length >= 1)) {
      return res.status(400).json({ message: "Please enter your full name" });
    }
    if (mobile.length < 10 || mobile.length > 13) {
      return res.status(400).json({ message: "Please enter a valid mobile number" });
    }
    emailSchema.parse(email);
    passwordSchema.parse(password);
    nameSchema.parse(name);

    const hashedPassword = await bcrypt.hash(password, 10);
    let profile_pic_url = "";
    if (!req.body.profilePic) {
      profile_pic_url = `https://res.cloudinary.com/dkuxqgbvt/image/upload/v1730308932/0d64989794b1a4c9d89bff571d3d5842-modified_bl9aus.png`;
    }
    if (req.body.profilePic) {
      const result = await cloudinary.uploader.upload(req.body.profilePic, {
        folder: "myUploads",
      });
      profile_pic_url = result.secure_url;
    }
    let banner_pic_url = "";
    if (!req.body.bannerPic) {
      banner_pic_url = `https://res.cloudinary.com/dkuxqgbvt/image/upload/v1730308958/abstract-background-design-dark-gray_53876-59277_kwr9w9.avif`;
    }
    if (req.body.bannerPic) {
      const result = await cloudinary.uploader.upload(req.body.bannerPic);
      banner_pic_url = result.secure_url;
    }
    name = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    const user = await Usermodel.create({
      email,
      username,
      password: hashedPassword,
      name,
      mobile,
      profilePic: profile_pic_url || "",
      bannerPic: banner_pic_url || "",
      dateOfBirth: req.body.dateOfBirth || "",
      headline: req.body.headline || "",
      about: req.body.about || "",
      skills: req.body.skills || "",
      loaction: req.body.loaction || "",
      experience: req.body.experience || {},
      education: req.body.education || {},
      status: "not verified",
    });
    req.user = user;
    next();
    // To Email Sending
  } catch (error) {
    console.log("Error in signup", error);
    res.status(500).json({ message: `${error.errors ? error.errors[0].message : error}` });
  }
};

export const sendOTP = async (req, res, next) => {
  let user;
  let id;
  if (req.user) {
    user = req.user;
    id = user._id;
  }
  if (!req.user && req.body.user) {
    user = req.body.user;
    id = user.id;
  }
  const email_otp = Math.floor(100000 + Math.random() * 900000);
  const hash_email_otp = await bcrypt.hash(email_otp.toString(), 10);
  await OTP.deleteMany({ userId: id });
  await OTP.create({
    emailOtp: hash_email_otp,
    userId: id,
  });
  try {
    const html = verifyEmail(user.name.split(" ")[0], email_otp);
    await sendEmail(user.email, "Verify your email", html);
    return res.status(200).json({ user, message: "OTP sent successfully", success: true });
  } catch (error) {
    console.log(`Error sending email: ${error}`);
  }
};
const nameSchema = zod.string().refine(
  (e) => {
    const notToolarge = e.length <= 30;
    return notToolarge;
  },
  { message: "Name must be under 30 letters" }
);
const emailSchema = zod.string().email({ message: "Invalid email address" });

const passwordSchema = zod.string().refine(
  (val) => {
    const has8Characters = val.length >= 8;

    const hasSpecialCharacters = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    const hasNumbers = /\d/.test(val);

    const hasLowerCase = /[a-z]/.test(val);

    const hasUpperCase = /[A-Z]/.test(val);

    return hasSpecialCharacters && hasNumbers && hasLowerCase && hasUpperCase && has8Characters;
  },
  {
    message: "Password must contain atleast one special character, one number, one lowercase character, one uppercase character and has to be atleast 8 characters long",
  }
);

export const verifyEmailMobile = async (req, res, next) => {
  const { emailOtp, userId } = req.body;
  const matchDocument = await OTP.findOne({ userId });
  if (!matchDocument) {
    return res.status(400).json({ message: "You have not generated an OTP" });
  }
  const isValidOtp = await bcrypt.compare(emailOtp, matchDocument.emailOtp);
  if (!isValidOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const user = await Usermodel.findOne({ _id: userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.status = "verified";
  await user.save();
  const profileUrl = `https://www.renokon.com/userProfile/${user._id}`;

  try {
    const html = createWelcomeEmailTemplate(user.name.split(" ")[0], profileUrl);
    await sendEmail(user.email, "Welcome to Renokon", html);
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("Error in sending email", error);
    return res.status(500).json({ message: "Internal server error, please try again" });
  }
};

export const login = async (req, res, next) => {
  let { email, password } = req.body;
  console.log("Login started... ", email);
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  let isEmail = false;
  if (email.includes("@")) {
    email = email.toLowerCase();
    isEmail = true;
  }
  try {
    let foundUser;
    if (isEmail) {
      foundUser = await Usermodel.findOne({ email }).lean();
    } else {
      foundUser = await Usermodel.findOne({ mobile: email }).lean();
    }
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    delete foundUser.password;
    const sendUser = foundUser;
    // const sendUser = await Usermodel.findOne({ $or: [{ email }, { mobile: email }] }).select("-password");
    const token = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, { expiresIn: "30d", algorithm: "HS256" });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/", 
    });
    console.log("Logged in successfully: ", email);
    return res.status(200).json({ sendUser, message: "Logged in successfully" });
  } catch (error) {
    console.log("Error in login ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    path: "/
  });
  res.status(200).json({ message: "Logged out successfully" });
};
// Password Reset logic

export const resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const foundUser = await Usermodel.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    const otp = Math.floor(Math.random() * 900000) + 100000;
    const hash_email_otp = await bcrypt.hash(otp.toString(), 10);
    await OTP.deleteMany({ userId: foundUser._id });
    await OTP.create({ emailOtp: hash_email_otp, userId: foundUser._id });

    const html = verifyEmailForPasswordReset(foundUser.name.split(" ")[0], otp);
    await sendEmail(foundUser.email, "Reset Password", html); // send otp
    res.cookie("id", foundUser._id, { httpOnly: true, sameSite: "None", secure: true, maxAge: 30 * 60 * 60 * 1000 });
    return res.status(200).json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.log("Error in reset password ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { emailOtp } = req.body;
    const userId = req.cookies.id;
    const matchDocument = await OTP.findOne({ userId });
    if (!matchDocument) {
      return res.status(400).json({ message: "You have not generated an OTP" });
    }
    const isValidOtp = await bcrypt.compare(emailOtp, matchDocument.emailOtp);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    res.cookie("verifiedEmail", true, { httpOnly: true, sameSite: "None", secure: true, maxAge: 60 * 60 * 60 * 1000 });
    return res.status(200).json({ message: "Email verified successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const enterNewPassword = async (req, res, next) => {
  try {
    const userId = req.cookies.id;
    const verifiedEmail = req.cookies.verifiedEmail;
    if (!verifiedEmail) {
      return res.status(400).json({ message: "You have not verified your email" });
    }
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await Usermodel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newPassword = password;
    passwordSchema.parse(newPassword);
    const hash_newPassword = await bcrypt.hash(newPassword, 10);
    user.password = hash_newPassword;
    await user.save();
    res.clearCookie("id", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });
    res.clearCookie("verifiedEmail", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });
    const profileUrl = `https://www.renokon.com/userProfile/${user._id}`;
    const html = passwordChangedsuccessEmailTemplate(user.name.split(" ")[0], profileUrl);
    await sendEmail(user.email, "Password Changed Successfully", html);
    return res.status(200).json({ message: "Password changed successfully", success: true });
  } catch (error) {
    console.log("Error in entering new password ", error);
    return res.status(500).json({ message: `${error.errors ? error.errors[0].message : error}` });
  }
};
