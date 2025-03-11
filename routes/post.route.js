import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getAllPost,
  getPost,
  getCurrentUserPost,
  createPost,
  updatePost,
  updateUserNameOfPost,
  getThisUserPostPhotos,
  deletePost,
  likes,
  shares,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  pinPost,
  isLiked,
  savePost,
  interestedPost,
  notInterestedPost,
  reportPost,
  hideAllPosts,
  getSavedPosts,
  unSavePost,
  createPostWithVideo,
  updatePostWithVideo,
  updatePostVideoNoMediaChange,
  myRecentPost,
  getThisUserPostVideos,
  updateShareCount,
  voteOnPoll,
} from "../controller/post.controller.js";
import multer from "multer";
import upload from "../lib/multerConfiguration.js";
import up from "../lib/multerForVideo.js";
import { upForPost } from "../lib/multerForVideo.js";
import uploadVideo from "../middleware/uploadVideo.js";
const router = express.Router();

router.use(auth);

router.get("/getAllPost", getAllPost);
router.post("/myRecentPost", myRecentPost);
router.get("/:postId/getThisPost", getPost);
router.get("/:userId/getCurrentUserPost", getCurrentUserPost);
router.get("/getThisUserPostPhotos/:userId", getThisUserPostPhotos);
router.get("/getThisUserPostVideos/:userId", getThisUserPostVideos);
router.post("/createPost", upload.array("media", 10), createPost);
router.post("/createPost/video", upForPost.single("video"), uploadVideo, createPostWithVideo);
router.put("/updateUserNameOfPost", updateUserNameOfPost);
router.put("/:postId/updatePost/video", upForPost.single("video"), uploadVideo, updatePostWithVideo);
router.put("/:postId/updatePost/video/videoNoChange", upload.none(), updatePostVideoNoMediaChange);
router.put("/:postId/updatePost", upload.array("media", 10), updatePost);
router.delete("/:postId/:userId/deletePost", deletePost);
router.put("/:postId/:userId/pinPost", pinPost);
router.post("/:postId/interestedPost", interestedPost);
router.post("/:postId/notInterestedPost", notInterestedPost);
router.post("/:postId/reportPost", reportPost);
router.post("/:userId/hideAllPosts", hideAllPosts);
router.put("/:postId/:userId/voteOnPoll", voteOnPoll);
// router.post("/launchPoll", upload.array("images", 10), launchPoll)

router.post("/:postId/savePost", savePost);
router.get("/getSavedPosts", getSavedPosts);
router.put("/:postId/unSavePost", unSavePost);

router.put("/:postId/likes", likes);
router.put("/:postId/isLiked", isLiked);
router.post("/:id/shares", shares);

router.put("/updateShareCount/:postId", updateShareCount);

router.get("/:postId/getComment", getComment);
router.post("/:postId/createComment", createComment);
router.put("/:id/:postId/updateComment", updateComment);
router.delete("/:id/:postId/deleteComment", deleteComment);

export default router;
