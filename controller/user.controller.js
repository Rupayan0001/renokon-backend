import UserModel from "../model/user.model.js";
// import NotificationModel from "../model/notification.model.js";
import { ReportedUserModel } from "../model/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import PostModel from "../model/post.model.js";
import CommentModel from "../model/comment.model.js";
import FollowingModel from "../model/following.model.js";
import FollowerModel from "../model/follower.model.js";
import FriendRequestRecievedModel from "../model/friendRequestRecieved.model.js";
import FriendModel from "../model/friends.model.js";
import FriendModel2 from "../model/friends2.model.js";
import BlockListModel from "../model/blockList.model.js";
import HideAllPostsModel from "../model/hideAllPost.model.js";
import { createFriendRequestEmailTemplate } from "../emails/emailTemplate.js";
import { sendEmail } from "../lib/emailService.js";
// import errorMap from "zod/locales/en.js";

export const getLoggedInuser = async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      return res.status(200).json({ user });
    } else {
      throw error;
    }
  } catch (error) {
    console.log(`Error in getLoggedInuser: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const profileSearch = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: "User not found" });

    const userProfiles = await UserModel.find({ $or: [{ username: { $regex: `^${name}`, $options: "i" } }, { name: { $regex: `^${name}`, $options: `i` } }] })
      .limit(20)
      .select("name _id followerCount profilePic username");
    return res.status(200).json(userProfiles);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// This needs some work to be done
export const searchFriends = async (req, res, next) => {
  try {
    const { name } = req.params;
    const user = req.user;
    if (!name) return res.status(400).json({ message: "User not found" });

    const friendProfiles = await FriendModel.find({ friendName: { $regex: `^${name}`, $options: "i" }, userId: user._id })
      .limit(20)
      .populate("friendId", "name _id profilePic username");
    const friendProfiles2 = await FriendModel2.find({ friendName: { $regex: `^${name}`, $options: "i" }, userId: user._id })
      .limit(20)
      .populate("friendId", "name _id profilePic username");
    const allFriends = [...friendProfiles, ...friendProfiles2];
    return res.status(200).json(allFriends);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const userProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "User id required" });
    const user = await UserModel.findOne({ _id: id }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    let isBlocked;
    if (currentUser._id.toString() === id) {
      isBlocked = false;
    } else if (currentUser._id.toString() !== id) {
      const isBlockedEntry = await BlockListModel.findOne({
        $or: [
          { userId: currentUser._id, blockedUserId: id },
          { userId: id, blockedUserId: currentUser._id },
        ],
      });
      isBlocked = isBlockedEntry;
    }
    return res.status(200).json({ user, isBlocked });
  } catch (error) {
    console.log("Error in userProfile: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const isMyFriend = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      const friendRequestList = await FriendRequestRecievedModel.find({ userId: req.user._id }).populate("friendId", "name username profilePic");
      return res.status(200).json({ message: "Logged in user", friendRequestList: friendRequestList });
    }
    if (req.user._id.toString() !== req.params.id) {
      const checkEntry = await FriendRequestRecievedModel.findOne({ userId: req.params.id, friendId: req.user._id });
      const friendRequestSentStatus = checkEntry ? true : false;

      const checkEntry2 = await FriendRequestRecievedModel.findOne({ userId: req.user._id, friendId: req.params.id });
      const friendRequestRecievedStatus = checkEntry2 ? true : false;

      const isMyFriendEntry = await FriendModel.findOne({
        $or: [
          { userId: req.user._id, friendId: req.params.id },
          { userId: req.params.id, friendId: req.user._id },
        ],
      });
      const isMyFriend = isMyFriendEntry ? true : false;
      const isBlockedEntry = await BlockListModel.findOne({
        $or: [
          { userId: req.user._id, blockedUserId: req.params.id },
          { userId: req.params.id, blockedUserId: req.user._id },
        ],
      });
      return res.status(200).json({ friendRequestSentStatus, friendRequestRecievedStatus, isMyFriend: isMyFriend, isBlocked: isBlockedEntry });
    }
  } catch (error) {
    console.log(`Error in isMyFriend: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const basicUserProfile = async (req, res, next) => {
  try {
    const { id, currentUserId } = req.params;
    const isSameUser = id === currentUserId;
    const user = await UserModel.findOne({ _id: id }).select("name headline followerCount followingCount profilePic username");
    const isFollowing = await FollowingModel.findOne({ userId: currentUserId, followingId: id });

    if (isFollowing) {
      return res.status(200).json({ user, isFollowing: true, isSameUser });
    }
    return res.status(200).json({ user, isFollowing: false, isSameUser });
  } catch (error) {
    console.log("Error in userProfile: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Have to use reference in comment model for data consistency
export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate({ _id: req.user._id }, { $set: req.body }, { new: true }).select("-password");
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(`Error in updateUser: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateUserBannerpic = async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folders: "bannerPic",
    });
    if (!result.secure_url) return res.status(400).json({ message: "Something went wrong, please try again later" });
    const updatedUser = await UserModel.findOneAndUpdate({ _id: req.user._id }, { $set: { bannerPic: result.secure_url } }, { new: true }).select("-password");
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(`Error in updateUser: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateProfilePic = async (req, res, next) => {
  try {
    const { profilePic } = req.body;
    let result;
    if (profilePic) {
      result = {
        secure_url: profilePic,
      };
    } else {
      result = await cloudinary.uploader.upload(req.file.path, {
        folders: "profilePic",
      });
    }
    const updatedUser = await UserModel.findOneAndUpdate({ _id: req.user._id }, { $set: { profilePic: result.secure_url } }, { new: true }).select("-password");
    await PostModel.updateMany({ userId: req.user._id }, { $set: { creatorProfilePic: result.secure_url } });
    await CommentModel.updateMany({ creatorId: req.user._id }, { $set: { creatorProfilePic: result.secure_url } });
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(`Error in updateUser: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const followThisUser = async (req, res, next) => {
  try {
    const followUserId = req.params.followId;
    const currentUser = req.user;
    const followUser = await UserModel.findOne({ _id: followUserId });
    if (!followUser) {
      return res.status(400).json({ message: "User not found" });
    }
    if (currentUser._id.toString() === followUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }
    const following = await FollowingModel.updateOne(
      { userId: currentUser._id, followingId: followUserId },
      {
        userId: currentUser._id,
        followingId: followUserId,
        followingName: followUser.name,
        followingUsername: followUser.username,
        followingPersonProfilePic: followUser.profilePic,
      },
      { upsert: true }
    );
    const follower = await FollowerModel.updateOne(
      { userId: followUserId, followerId: currentUser._id },
      {
        userId: followUserId,
        followerId: currentUser._id,
        followerName: currentUser.name,
        followerUsername: currentUser.username,
        followerPersonProfilePic: currentUser.profilePic,
      },
      { upsert: true }
    );
    if (following && follower) {
      await UserModel.bulkWrite([
        { updateOne: { filter: { _id: req.user._id }, update: { $inc: { followingCount: 1 } } } },
        { updateOne: { filter: { _id: followUserId }, update: { $inc: { followerCount: 1 } } } },
      ]);
      return res.status(200).json({ message: "following" });
    }
  } catch (error) {
    console.log(`Error in followUser: ${error}`);
    if (error.code === 11000) {
      return res.status(409).json({ message: `You are already following ${req.params.followId}` });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const unFollowUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const unFollowUser = await UserModel.findOne({ _id: req.params.unFollowId });
    if (!unFollowUser) {
      return res.status(409).json({ message: "User nor found" });
    }
    const deleteFollowing = await FollowingModel.deleteOne({ userId: currentUser._id, followingId: unFollowUser._id });
    const deletefollower = await FollowerModel.deleteOne({ userId: unFollowUser._id, followerId: currentUser._id });
    if (deleteFollowing.deletedCount > 0 && deletefollower.deletedCount > 0) {
      await UserModel.bulkWrite([
        { updateOne: { filter: { _id: currentUser._id }, update: { $inc: { followingCount: -1 } } } },
        { updateOne: { filter: { _id: unFollowUser._id }, update: { $inc: { followerCount: -1 } } } },
      ]);
      return res.status(200).json({ message: "unfollowed" });
    }
    return res.status(400).json({ message: "Could not unfollow, please try again later" });
  } catch (error) {
    console.log(`Error in unFollowUser: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getFollowers = async (req, res, next) => {
  try {
    const user = req.user;
    const { userId } = req.params;
    const followerList = await FollowerModel.find({ userId });
    if (followerList) {
      return res.status(200).json(followerList);
    }
    return res.status(200).json({ message: "No followers found" });
  } catch (error) {
    console.log(`Error in getFollowers: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getFollowing = async (req, res, next) => {
  try {
    const user = req.user;
    const { userId } = req.params;
    const followingList = await FollowingModel.find({ userId });
    if (followingList) {
      return res.status(200).json(followingList);
    }
    return res.status(404).json({ message: "Following no one" });
  } catch (error) {
    console.log(`Error in getFollowers: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const blockUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { blockUserId } = req.params;
    const isUser = await UserModel.findOne({ _id: blockUserId });
    if (!isUser) return res.status(400).json({ message: "User not found" });
    const blockUser = await BlockListModel.create({ userId: currentUser._id, blockedUserId: blockUserId });
    // deleting from friendLists, follower lists
    const [removeFriend, removeFriend2, unFollowUser, unFollowUser2, friendRequest] = await Promise.all([
      FriendModel.deleteOne({
        $or: [
          { userId: currentUser._id, friendId: blockUserId },
          { userId: blockUserId, friendId: currentUser._id },
        ],
      }),
      FriendModel2.deleteOne({
        $or: [
          { userId: currentUser._id, friendId: blockUserId },
          { userId: blockUserId, friendId: currentUser._id },
        ],
      }),
      FollowingModel.deleteMany({
        $or: [
          { userId: currentUser._id, followingId: blockUserId },
          { userId: blockUserId, followingId: currentUser._id },
        ],
      }),
      FollowerModel.deleteMany({
        $or: [
          { userId: currentUser._id, followerId: blockUserId },
          { userId: blockUserId, followerId: currentUser._id },
        ],
      }),
      FriendRequestRecievedModel.deleteOne({
        $or: [
          { userId: currentUser._id, friendId: blockUserId },
          { userId: blockUserId, friendId: currentUser._id },
        ],
      }),
    ]);
    if (blockUser) {
      return res.status(201).json({ message: "User blocked" });
    }
    throw new Error(`Error in blocking user`);
  } catch (error) {
    console.log(`Error in blockUser: ${error}`);
    if (error.code === 11000) {
      return res.status(409).json({ message: "You already blocked this user" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const unBlockUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { unBlockUserId } = req.params;
    const unBlockUser = await UserModel.findOne({ _id: unBlockUserId });
    if (!unBlockUser) return res.status(400).json({ message: "User not found" });
    const unBlock = await BlockListModel.deleteOne({ userId: currentUser._id, blockedUserId: unBlockUserId });
    if (unBlock.deletedCount > 0) {
      return res.status(200).json({ message: `Unblocked` });
    }
    return res.status(409).json({ message: "Could not unblock, please try again later" });
  } catch (error) {
    console.log(`Error in unBlockUser: ${error}`);
    return res.status(400).json({ message: "Internal server error" });
  }
};
export const unHideUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { unHideUserId } = req.params;
    const unHideUser = await UserModel.findOne({ _id: unHideUserId });
    if (!unHideUser) return res.status(400).json({ message: "User not found" });
    const unHide = await HideAllPostsModel.deleteOne({ userId: currentUser._id, hideUserId: unHideUserId });
    if (unHide.deletedCount > 0) {
      return res.status(200).json({ message: `UnHide` });
    }
    return res.status(409).json({ message: "Could not unhide, please try again later" });
  } catch (error) {
    console.log(`Error in unHideUser: ${error}`);
    return res.status(400).json({ message: "Internal server error" });
  }
};
export const reportUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const whatToReport = req.body.whatToReport;
    const reportUser = await UserModel.findOne({ username: req.query.username });
    const report = await ReportedUserModel.create({
      email: reportUser.email,
      reportedUserId: reportUser._id,
      whoReported: currentUser._id,
      report: whatToReport,
    });
    if (report) {
      return res.status(200).json({ message: "Reported successfully" });
    }
  } catch (error) {
    console.log(`Error in reportUser: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getBlockedUsers = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const blockedUsers = await BlockListModel.find({ userId: currentUser._id }).populate("blockedUserId", "name profilePic username");
    if (!blockedUsers) return res.status(404).json({ message: "No blocked users found" });

    return res.status(200).json({ blockedUsers });
  } catch (error) {
    console.log(`Error in getBlockedUser ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getHideUsers = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const hideUsers = await HideAllPostsModel.find({ userId: currentUser._id }).populate("hideUserId", "name profilePic username");
    if (!hideUsers) return res.status(404).json({ message: "You have not hide any user's profile" });
    return res.status(200).json({ hideUsers });
  } catch (error) {
    console.log(`Error in getBlockedUser ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const sendFriendRequest = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const friendProfile = await UserModel.findOne({ _id: req.params.friendId });
    if (!friendProfile) {
      return res.status(400).json({ message: "User not found" });
    }
    const friendRequestEntry = await FriendRequestRecievedModel.create({
      userId: friendProfile._id,
      friendId: currentUser._id,
    });
    if (friendRequestEntry) {
      const profileUrl = `http://renokon.com/userProfile/${currentUser._id}`;
      res.status(200).json({ message: "Friend request sent" });
      try {
        const html = createFriendRequestEmailTemplate(currentUser.name.split(" ")[0], friendProfile.name, profileUrl, friendProfile.profilePic);
        await sendEmail(friendProfile.email, "New Friend Request", html);
        return;
      } catch (error) {
        console.log(`Error in email for friendRequest: ${error}`);
        return;
      }
    }
  } catch (error) {
    console.log(`Error in sending friend request: ${error}`);
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already sent a friend request" });
    }
    return res.status(500).json({ message: "Something went wrong, Please try again later" });
  }
};
export const cancelFriendRequest = async (req, res, next) => {
  try {
    const user = req.user;
    const friendId = req.params.friendId;
    const find_Friend_Request_Entry = await FriendRequestRecievedModel.deleteOne({ userId: friendId, friendId: user._id });
    if (find_Friend_Request_Entry.deletedCount > 0) {
      return res.status(200).json({ message: "Friend request cancelled" });
    }
    return res.status(404).json({ message: "Friend request not found" });
  } catch (error) {
    console.log(`Error in cancel friend request: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const rejectFriendRequest = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const friendId = req.params.friendId;
    const find_Friend_Request_Entry = await FriendRequestRecievedModel.deleteOne({ userId: currentUser._id, friendId: friendId });
    if (find_Friend_Request_Entry.deletedCount > 0) {
      return res.status(200).json({ message: "Friend request rejected" });
    }
    return res.status(200).json({ message: "Something wen wrong, please try again later" });
  } catch (error) {
    console.log(`Error in sending friend request: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const addFriend = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const friendProfile = await UserModel.findOne({ _id: req.params.friendId });
    if (!friendProfile) {
      return res.status(409).json({ message: "User not found" });
    }
    const addFriend = await FriendModel.create({
      userId: currentUser._id,
      friendId: friendProfile._id,
      friendName: friendProfile.name,
    });
    const addFriend2 = await FriendModel2.create({
      userId: friendProfile._id,
      friendId: currentUser._id,
      friendName: currentUser.name,
    });
    if (addFriend && addFriend2) {
      const deleteFriendRequest = await FriendRequestRecievedModel.deleteOne({ userId: currentUser._id, friendId: friendProfile._id });
      if (deleteFriendRequest.deletedCount > 0) {
        return res.status(200).json({ message: "Friend request accepted" });
      }
    }
    return res.status(409).json({ message: "Something went wrong, please try again later" });

    // const notified = await Notificationmodel.create({
    //     recipient: addFriend._id,
    //     sender: currentUser._id,
    //     type: "friendRequestAccepted",
    //     content: `${currentUser.name} accepted your friend request`,
    //     relatedPost: null,
    //     read: false
    // })

    // if (notified) {
    //     return res.status(200).json({ message: "Friend request accepted" });
    // }
    // else {
    //     throw new Error(`Error in sending notification.`)
    // }
  } catch (error) {
    console.log(`Error in accepting friend request: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllFriends = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const [friends, friends2] = await Promise.all([
      FriendModel.find({ userId: currentUser._id }).populate("friendId", "name username profilePic"),
      FriendModel2.find({ userId: currentUser._id }).populate("friendId", "name username profilePic"),
    ]);
    const allFriends = [...friends, ...friends2];
    if (allFriends) {
      return res.status(200).json({ friends: allFriends });
    }
    return res.status(400).json({ message: "No friends found" });
  } catch (error) {
    console.log(`Error in getting friendlists`);
    return res.status(500).json({ message: { message: "Internal server error" } });
  }
};
export const removeFriend = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const deleteFriend = await FriendModel.deleteOne({
      $or: [
        { userId: req.params.friendId, friendId: currentUser._id },
        { userId: currentUser._id, friendId: req.params.friendId },
      ],
    });
    const deleteFriend2 = await FriendModel2.deleteOne({
      $or: [
        { userId: req.params.friendId, friendId: currentUser._id },
        { userId: currentUser._id, friendId: req.params.friendId },
      ],
    });
    if (deleteFriend.deletedCount > 0 && deleteFriend2.deletedCount > 0) {
      return res.status(200).json({ message: "Removed friend" });
    }
    return res.status(404).json({ message: "Friend not found" });
  } catch (error) {
    console.log(`Error in accepting friend request: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteMyAccount = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const deleted = await UserModel.deleteOne({ _id: currentUser._id });
    if (deleted.deletedCount > 0) {
      res.status(200).json({ message: "Account deleted successfully" });
    }
  } catch (error) {
    console.log(`Error in deleteMyAccount: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// This Needs work, this is not complete
export const suggestedUser = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(`Error in suggestedUser: ${error}`);
    return res.status(400).json({ message: "Internal server error" });
  }
};
