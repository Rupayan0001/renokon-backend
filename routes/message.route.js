import express from "express";
import { auth } from "../middleware/auth.js";
import upload from "../lib/multerConfiguration.js";
import up from "../lib/multerForVideo.js";
import uploadVideo from "../middleware/uploadVideo.js";
const router = express.Router();
import {
  getMessages,
  getFriends,
  getRecentMessages,
  getCurrentMessage,
  uploadFiles,
  uploadVideos,
  seenMessage,
  deleteAllMessages,
  deleteAllMessagesPermanent,
  totalUnreadMessagesCount,
  unreadMessagesCountForEach,
  createGroup,
  getGroups,
  getGroupMessages,
  deleteGroup,
  getSpecificFriend,
  getGroupMembers,
  leaveGroup,
  deleteGroupMember,
  addGroupMember,
  getSpecificGroup,
} from "../controller/message.controller.js";
router.use(auth);

// Messages features

router.get("/friendSearch/:name", getFriends);
router.get("/getMessages", getMessages);
router.get("/getRecentMessages", getRecentMessages);
router.get("/getSpecificFriend/:id", getSpecificFriend);
router.get("/totalUnreadMessagesCount", totalUnreadMessagesCount);
router.get("/unreadMessagesCountForEach", unreadMessagesCountForEach);
router.get("/getCurrentMessage/:friendId", getCurrentMessage);
router.post("/uploadFiles", upload.single("media"), uploadFiles);
router.post("/uploadvideo", up.single("media"), uploadVideo, uploadVideos);
router.post("/seen/:id", seenMessage);
router.delete("/deleteAllMessages/:friendId", deleteAllMessages);
router.delete("/deleteAllMessages/permanent/:friendId", deleteAllMessagesPermanent);
router.post("/createGroup", upload.single("groupPic"), createGroup);
router.get("/getGroups", getGroups);
router.get("/getSpecificGroup/:groupId", getSpecificGroup);
router.get("/getGroupMessages/:groupId", getGroupMessages);
router.get("/getGroupMembers/:groupId", getGroupMembers);
router.delete("/deleteGroup/:groupId", deleteGroup);
router.delete("/deleteGroupMember/:groupId/:memberId", deleteGroupMember);
router.put("/addGroupMember/:groupId/", addGroupMember);
router.put("/leaveGroup/:groupId", leaveGroup);

// router.post("/sendMessage", sendMessage);
// router.delete("/deleteMessage", deleteMessage);
// router.post("/:id/seen", seenMessage);
// router.post("/:id/typing", typing);
// router.post("/:id/stopTyping", stopTyping);

// Media features

// router.post("/sendImage", sendImage);
// router.post("/sendLocation", sendLocation);
// router.post("/sendFile", sendFile);
// router.post("/sendAudio", sendAudio);
// router.post("/sendVideo", sendVideo);
// router.post("/sendSticker", sendSticker);
// router.post("/sendGIF", sendGIF);
// router.post("/recordedVoice", recordedVoice);
// router.post("/sendContact", sendContact);
// router.post("/clickLivePhoto", clickLivePhoto);

// Whatsapp Status

// router.post("/createStatus", createStatus);
// router.delete("/deleteStatus", deleteStatus);
// router.post("/:id/seenStatus", seenStatus);
// router.put("/updateStatus", updateStatus);
// router.get("/getAllStatus", getAllStatus);

// Calling features

// router.post("/:id/audioCall", audioCall)
// router.post("/:id/videoCall", videoCall)

// Payment gateway

// router.post("/sendPayment", sendPayment);
// router.get("/recievePayment", recievePayment);
// router.post("/paymentStatus", paymentStatus);
// router.get("/transactions", transactions);

// Ecommerce features

// Music streaming platform

export default router;
