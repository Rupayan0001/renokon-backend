import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";
import { getProducts, getProductById } from "../controller/ecommerce.controller.js";
import upload from "../lib/multerConfiguration.js";
import { whisperApi } from "../lib/whisperAPI.js";
import multer from "multer";
const uploadAudio = multer({ dest: "uploads/" });

router.get("/getProducts", getProducts);
router.get("/getProductById/:id", getProductById);
router.post("/transcribe", uploadAudio.single("audio"), whisperApi);
router.use(auth);

// router.post("/create", upload.single("image"), createProduct);
// router.put("/updateProduct/:id", upload.single("image"), updateProduct);
// router.delete("/deleteProduct/:id", deleteProduct);

export default router;
