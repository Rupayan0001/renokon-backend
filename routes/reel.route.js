import express from "express";
import { auth } from "../middleware/auth.js";
import uploadVideo from "../middleware/uploadVideo.js";
import up from "../lib/multerForVideo.js";
import upload from "../lib/multerConfiguration.js";
import { uploadSingleVideo } from "../lib/multerForVideo.js";
import { createReel, getReels, updateShareCount, likes } from "../controller/reel.controller.js";

const router = express.Router();
router.use(auth);

router.get("/getReels", getReels);
router.post("/createReel", uploadSingleVideo, uploadVideo, createReel);
router.put("/updateShareCount/:reelId", updateShareCount);
router.put("/:postId/likes", likes);
export default router;
