import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";
import { createProfile, getProfile, uploadProfileImages, createAds } from "../controller/business.controller.js";
import upload from "../lib/multerConfiguration.js";

router.use(auth);

router.post("/create", createProfile);
router.post("/ads/create", upload.single("image"), createAds);
router.post("/uploadProfileImages", upload.fields([{ name: "logo" }, { name: "coverImage" }]), uploadProfileImages);
router.get("/getProfile", getProfile);

export default router;
