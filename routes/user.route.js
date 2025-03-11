import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";
import {
    suggestedUser, userProfile, updateUser, updateUserBannerpic, updateProfilePic, followThisUser, unFollowUser,
    blockUser, unBlockUser, reportUser, getBlockedUsers, sendFriendRequest,
    removeFriend, rejectFriendRequest, addFriend, deleteMyAccount, basicUserProfile, profileSearch, getFollowers, getLoggedInuser,
    getFollowing, cancelFriendRequest, getAllFriends, isMyFriend, getHideUsers, unHideUser, searchFriends
} from "../controller/user.controller.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });


router.use(auth);

router.get("/suggestedUser", suggestedUser);
router.get("/userProfile/:id", userProfile);
router.get("/getLoggedInuser", getLoggedInuser);
router.get("/basicUserProfile/:id/:currentUserId", basicUserProfile);
router.get("/profileSearch/:name", profileSearch);
router.get("/searchFriends/:name", searchFriends);
// router.get("/searchUser", searchUser);
router.put("/updateUser", updateUser);
router.put("/updateUserBannerpic", upload.single("bannerPic"), updateUserBannerpic);
router.put("/updateProfilePic", upload.single("profilePic"), updateProfilePic);
router.put("/:followId/followUser", followThisUser);
router.get("/:userId/getFollowers", getFollowers);
router.get("/:userId/getFollowing", getFollowing);
router.put("/:unFollowId/unFollowUser", unFollowUser);

router.post("/:blockUserId/blockUser", blockUser);
// router.get("/getBlockedUsers", getBlockedUsers);
router.put("/:unBlockUserId/unBlockUser", unBlockUser);
router.put("/:unHideUserId/unHideUser", unHideUser);
router.post("/reportUser", reportUser);
router.get("/:userId/getBlockedUsers", getBlockedUsers);
router.get("/:userId/getHideUsers", getHideUsers);

router.post("/:friendId/sendFriendRequest", sendFriendRequest);
router.put("/:friendId/cancelFriendRequest", cancelFriendRequest);
router.delete("/:friendId/rejectFriendRequest", rejectFriendRequest);
router.put("/:friendId/addFriend", addFriend)
router.get("/getAllFriends", getAllFriends)
router.delete("/:friendId/removeFriend", removeFriend)
router.get("/:id/isMyFriend", isMyFriend)

router.delete("/deleteMyAccount", deleteMyAccount)

router.use("/", (req, res) => {
    res.status(400).json({ message: "You are not logged in!" })
})


export default router;