import FriendModel from "../model/friends.model.js";
import FriendModel2 from "../model/friends2.model.js";
import AllMessageModel from "../model/message_models/messages.model.js";
import GroupModel from "../model/message_models/group.model.js";
import MyGroupModel from "../model/message_models/myGroups.model.js";
import UserModel from "../model/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

export const getMessages = async (req, res) => {
  try {
    const user = req.user;
    const { senderId } = req.query;
    const receiverId = user._id;
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }
    const messages = await AllMessageModel.find({
      $or: [
        { senderId, receiverId, deletedBy: { $nin: [user._id] } },
        { senderId: receiverId, receiverId: senderId, deletedBy: { $nin: [user._id] } },
      ],
    }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      messages,
      message: "Messages retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message,
    });
  }
};
export const getGroupMessages = async (req, res) => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const foundgroup = await GroupModel.findById(groupId);
    if (!foundgroup) return res.status(404).json({ message: "Group not found" });
    const messages = await AllMessageModel.find({ groupId }).sort({ createdAt: 1 });
    return res.status(200).json({ messages });
  } catch (error) {
    console.log(`Error in getting group messages: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteGroup = async (req, res, next) => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const foundgGroup = await GroupModel.findById(groupId);
    if (!foundgGroup) return res.status(404).json({ message: "Group not found" });
    if (foundgGroup.groupAdminId.toString() !== user._id.toString()) return res.status(403).json({ message: "You are not authorized to delete this group" });
    const members = foundgGroup.groupMembersId;
    const deletedGroup = await GroupModel.findByIdAndDelete(groupId);
    if (!deletedGroup) {
      return res.status(500).json({ message: "Failed to delete the group" });
    }
    const deleted = await MyGroupModel.updateOne({ userId: user._id }, { $pull: { groupIds: groupId } });
    if (deleted.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to remove group from your group list" });
    }
    return res.status(200).json({
      message: "Group deleted successfully",
      success: true,
      members,
    });
  } catch (error) {
    console.log(`Error in deleting group: ${error}`);
    return res.status(500).json({ message: "Failed to delete group" });
  }
};
export const deleteGroupMember = async (req, res, next) => {
  try {
    const user = req.user;
    const { groupId, memberId } = req.params;
    const foundgGroup = await GroupModel.findById(groupId);
    const foundgGroup2 = await MyGroupModel.findOne({ userId: user._id });
    if (!foundgGroup) return res.status(404).json({ message: "Group not found" });
    if (!foundgGroup2) return res.status(404).json({ message: "Group not found" });
    if (foundgGroup.groupAdminId.toString() !== user._id.toString()) return res.status(403).json({ message: "You are not authorized to delete this group" });
    const remove = await MyGroupModel.updateOne({ userId: memberId }, { $pull: { groupIds: groupId } });
    const remove2 = await GroupModel.updateOne({ _id: groupId }, { $pull: { groupMembersId: memberId }, $inc: { totalGroupMemberCount: -1 } });
    if (remove && remove2) return res.status(200).json({ message: "Member removed successfully", success: true });
  } catch (error) {
    console.log(`Error in deleting group: ${error}`);
    return res.status(500).json({ message: "Failed to remove member" });
  }
};
export const addGroupMember = async (req, res, next) => {
  const session = await GroupModel.startSession();
  session.startTransaction();
  try {
    const user = req.user;
    const { groupId } = req.params;
    const { newMembers } = req.body;
    if (newMembers.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No members to add" });
    }
    const foundgGroup = await GroupModel.findById(groupId).session(session);
    if (!foundgGroup) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Group not found" });
    }
    if (foundgGroup.groupAdminId.toString() !== user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "You are not authorized to add members to this group" });
    }
    const prevLength = foundgGroup.groupMembersId.length;
    foundgGroup.groupMembersId.push(...newMembers);
    const newLength = new Set(foundgGroup.groupMembersId).size;
    if (prevLength === newLength) {
      await session.abortTransaction();
      return res.status(400).json({ message: "All members are already in the group", success: false });
    }
    foundgGroup.totalGroupMemberCount += newMembers.length;
    const updatedGroup = await foundgGroup.save({ session });
    if (!updatedGroup) {
      await session.abortTransaction();
      return res.status(500).json({ message: "Failed to add member", success: false });
    }
    for (const memberId of newMembers) {
      const foundgroup2 = await MyGroupModel.updateOne({ userId: memberId }, { $push: { groupIds: groupId } }, { upsert: true, session });
      if (!foundgroup2) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Group not found" });
      }
      // foundgroup2.groupIds.push(groupId);
      // await foundgroup2.save({ session });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: "All member added successfully", success: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(`Error in adding members to group: ${error}`);
    return res.status(500).json({ message: "Failed to add members" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = req.user;
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: "User not found" });

    const [userProfiles, userProfiles2] = await Promise.all([
      FriendModel.find({ userId: user._id, friendName: { $regex: `^${name}`, $options: `i` } }).populate("friendId", "username profilePic bannerPic"),
      FriendModel2.find({ userId: user._id, friendName: { $regex: `^${name}`, $options: `i` } }).populate("friendId", "username profilePic bannerPic"),
    ]);
    if (userProfiles && userProfiles2) return res.status(200).json([...userProfiles, ...userProfiles2]);
    throw new Error(`Error in getting friends`);
  } catch (error) {
    console.log(`Error in getting friends: ${error}`);
    return res.status(500).json({ message: { message: "Internal server error" } });
  }
};

export const getSpecificFriend = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "User Id not provided" });
    const friend1 = await FriendModel.findOne({ userId: user._id, friendId: id }).populate("friendId", "username profilePic bannerPic name");
    const friend2 = await FriendModel2.findOne({ userId: user._id, friendId: id }).populate("friendId", "username profilePic bannerPic name");
    if (friend1) {
      return res.status(200).json(friend1);
    } else if (friend2) {
      return res.status(200).json(friend2);
    }
    throw new Error(`Error in getting friends`);
  } catch (error) {
    console.log(`Error in getting friends: ${error}`);
    return res.status(500).json({ message: { message: "Internal server error" } });
  }
};

export const getRecentMessages = async (req, res, next) => {
  try {
    const user = req.user;
    const groups = await MyGroupModel.findOne({ userId: user._id }).populate("groupIds");
    let groupIds = [];
    if (groups) {
      groupIds = groups.groupIds.map((group) => group._id);
    }
    const recentGroupMessages = await AllMessageModel.aggregate([
      {
        $match: {
          groupId: { $in: groupIds },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: {
            groupId: "$groupId",
          },
          lastMessage: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $project: {
          _id: 0,
          messageId: "$lastMessage._id",
          senderId: "$lastMessage.senderId",
          receiverId: "$lastMessage.receiverId",
          groupId: "$lastMessage.groupId",
          content: "$lastMessage.content",
          imageUrl: "$lastMessage.imageUrl",
          videoUrl: "$lastMessage.videoUrl",
          audioUrl: "$lastMessage.audioUrl",
          status: "$lastMessage.status",
          documentFiles: "$lastMessage.documentFiles",
          createdAt: "$lastMessage.createdAt",
          status: "$lastMessage.status",
          friends: "$lastMessage.friends",
        },
      },
    ]);

    const recentMessages = await AllMessageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: user._id }, { receiverId: user._id }],
          groupId: null,
          deletedBy: { $nin: [user._id] },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: {
            senderId: {
              $cond: {
                if: { $eq: ["$senderId", user._id] },
                then: "$receiverId",
                else: "$senderId",
              },
            },
            receiverId: {
              $cond: {
                if: { $eq: ["$receiverId", user._id] },
                then: "$senderId",
                else: "$receiverId",
              },
            },
          },
          lastMessage: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $project: {
          _id: 0,
          messageId: "$lastMessage._id",
          senderId: "$lastMessage.senderId",
          receiverId: "$lastMessage.receiverId",
          groupId: "$lastMessage.groupId",
          content: "$lastMessage.content",
          imageUrl: "$lastMessage.imageUrl",
          videoUrl: "$lastMessage.videoUrl",
          audioUrl: "$lastMessage.audioUrl",
          status: "$lastMessage.status",
          documentFiles: "$lastMessage.documentFiles",
          createdAt: "$lastMessage.createdAt",
          status: "$lastMessage.status",
          friends: "$lastMessage.friends",
        },
      },
    ]);

    recentMessages.push(...recentGroupMessages);
    recentMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const receiverPromises = recentMessages.map((msg) => {
      if (msg.groupId) return null;
      if (!msg.receiverId) return null;
      const friend = user._id.toString() === msg.receiverId?.toString() ? msg.senderId : msg.receiverId;
      return friend ? UserModel.findById(friend) : null;
    });

    const groupPromises = recentMessages.map((msg) => {
      return msg.groupId ? GroupModel.findById(msg.groupId) : null;
    });

    const receivers = await Promise.all(receiverPromises);
    const myGroups = await Promise.all(groupPromises);

    recentMessages.forEach((msg, index) => {
      if (receivers[index]) msg.friendId = receivers[index];
      if (myGroups[index]) msg.groupId = myGroups[index];
    });
    return res.status(200).json({ lastMessages: recentMessages });
  } catch (error) {
    console.log(`Error in getting recent messages: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const totalUnreadMessagesCount = async (req, res, next) => {
  try {
    const user = req.user;
    const myGroups = await MyGroupModel.findOne({ userId: user._id }).select("groupIds");
    const totalUnreadMessagesCount = await AllMessageModel.countDocuments({
      $or: [
        {
          senderId: { $ne: user._id },
          receiverId: user._id,
          status: "sent",
        },
        {
          senderId: { $ne: user._id },
          groupId: { $ne: null, $in: myGroups?.groupIds || [] },
          receiverId: { $eq: null },
          seenBy: { $nin: user._id },
        },
      ],
    });

    if (totalUnreadMessagesCount >= 0) {
      return res.status(200).json({ totalUnreadMessagesCount });
    }
    throw error;
  } catch (error) {
    console.log("Error in getting total unread messages: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const unreadMessagesCountForEach = async (req, res, next) => {
  try {
    const user = req.user;
    const unreadMessagesCount = await AllMessageModel.aggregate([
      {
        $match: {
          senderId: { $ne: user._id },
          groupId: { $ne: null },
          receiverId: { $eq: null },
          seenBy: { $nin: [user._id] },
        },
      },

      // {
      //   $group: {
      //     _id: {
      //       groupId: { $ifNull: ["$groupId", "$senderId"] },
      //     },
      //     count: { $sum: 1 },
      //   },
      // },

      {
        $group: {
          _id: {
            groupId: "$groupId",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          senderId: null,
          groupId: "$_id.groupId",
          count: 1,
        },
      },
    ]);
    const unreadMessagesCount2 = await AllMessageModel.aggregate([
      {
        $match: { senderId: { $ne: user._id }, receiverId: user._id, status: "sent" },
      },
      {
        $group: {
          _id: {
            senderId: "$senderId",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          senderId: "$_id.senderId",
          groupId: null,
          count: 1,
        },
      },
    ]);
    const arr = [...unreadMessagesCount, ...unreadMessagesCount2];
    if (arr) {
      return res.status(200).json({ unreadMessagesCount: arr });
    }
    throw error;
  } catch (error) {
    console.log("Error in getting total unread messages: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getCurrentMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { friendId } = req.params;
    const lastMessage = await AllMessageModel.find({
      $or: [
        { senderId: user._id, receiverId: friendId },
        { senderId: friendId, receiverId: user._id },
      ],
    }).sort({ createdAt: -1 });
    return res.status(200).json(lastMessage);
  } catch (error) {
    console.l.og(`Error in getting recent messages: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const uploadFiles = async (req, res, next) => {
  try {
    const user = req.user;
    const { type } = req.body;
    let fileType;
    if (type === "file") {
      fileType = "raw";
    } else if (type === "image") {
      fileType = "image";
    } else if (type === "audio") {
      fileType = "video";
    }
    if (!req.file) {
      return res.status(404).json({ message: "File not found" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: fileType,
    });

    if (result.secure_url) {
      fs.unlinkSync(req.file.path);
      return res.status(200).json({ url: result.secure_url, message: "File uploaded successfully" });
    }
    fs.unlinkSync(req.file.path);
    throw new Error("Error in uploading file");
  } catch (error) {
    console.log(`Error in uploading file: `, error);
    if (error.http_code === 413) {
      return res.status(413).json({ message: "File size is too large" });
    }
    if (error.http_code === 400) {
      return res.status(413).json({ message: "File size is too large" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const uploadVideos = async (req, res, next) => {
  try {
    if (req.videoURL.length > 1) {
      return res.status(200).json({ url: req.videoURL, message: "File uploaded successfully" });
    }
  } catch (error) {
    console.log(`Error in uploading file: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const seenMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const message = await AllMessageModel.findById(id);
    if (message) {
      message.status = "delivered";
      await message.save();
      return res.status(200).json({ message: "Message seen" });
    }
    throw new Error("Error in seen message");
  } catch (error) {
    console.log(`Error in seen message: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteAllMessages = async (req, res, next) => {
  try {
    const user = req.user;
    const { friendId } = req.params;
    const messages = await AllMessageModel.find({
      $or: [
        { senderId: user._id, receiverId: friendId },
        { senderId: friendId, receiverId: user._id },
      ],
    });
    if (messages.length === 0) {
      return res.status(200).json({ message: "No messages found" });
    }
    const updatedMessages = [];
    let messagesToDelete = [];

    for (let message of messages) {
      if (!message.deletedBy.includes(user._id)) {
        message.deletedBy.push(user._id);
        updatedMessages.push(message.save());
      }

      if (message.deletedBy.length === 2) {
        messagesToDelete.push(message._id);
      }
    }

    const updatesSuccess = await Promise.all(updatedMessages);
    if (messagesToDelete.length > 0) {
      await AllMessageModel.deleteMany({ _id: { $in: messagesToDelete } });
    }

    if (messagesToDelete.length > 0 || updatesSuccess.length > 0) {
      return res.status(200).json({ message: "All messages deleted", messages: [], success: true });
    }
  } catch (error) {
    console.log(`Error in deleting all messages: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteAllMessagesPermanent = async (req, res, next) => {
  try {
    const user = req.user;
    const { friendId } = req.params;
    const messages = await AllMessageModel.deleteMany({
      $or: [
        { senderId: user._id, receiverId: friendId },
        { senderId: friendId, receiverId: user._id },
      ],
    });
    if (messages.deletedCount === 0) {
      return res.status(200).json({ message: "No messages found" });
    }

    if (messages.deletedCount > 0) {
      return res.status(200).json({ message: "Deleted all messages permanently" });
    }
  } catch (error) {
    console.log(`Error in deleting all messages permanent: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Group Messaging Section

export const createGroup = async (req, res, next) => {
  try {
    const user = req.user;
    let { groupName, groupMembers, groupDescription = "" } = req.body;
    groupMembers = JSON.parse(groupMembers);
    if (!req.file.path) return res.status(400).json({ message: "Please upload group picture" });
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });
    let groupAvatar = null;
    if (result.secure_url) {
      fs.unlinkSync(req.file.path);
      groupAvatar = result.secure_url;
    }
    const newGroup = await GroupModel.create({
      groupName,
      groupDescription,
      groupAvatar,
      groupCreatorId: user._id,
      groupAdminId: user._id,
      totalGroupMemberCount: groupMembers.length,
      groupMembersId: groupMembers,
    });
    const bulkOperation = groupMembers.map((memberId) => ({
      updateOne: {
        filter: { userId: memberId },
        update: {
          $push: { groupIds: newGroup._id, lastSeenTime: { groupId: newGroup._id, lastActiveTime: new Date() } },
        },
        upsert: true,
      },
    }));
    let addedToAllMembers = null;
    if (bulkOperation.length > 0) {
      addedToAllMembers = await MyGroupModel.bulkWrite(bulkOperation);
    }

    if (newGroup && (addedToAllMembers.modifiedCount > 0 || addedToAllMembers.upsertedCount > 0)) {
      return res.status(201).json({ message: "Group created successfully", success: true, group: newGroup });
    }
    return res.status(400).json({ message: "Failed to create group" });
  } catch (error) {
    console.log(`Error in creating group: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getGroups = async (req, res, next) => {
  try {
    const user = req.user;
    const groups = await MyGroupModel.findOne({ userId: user._id }).populate("groupIds");
    if (groups) {
      return res.status(200).json({ groups, success: true });
    }
    return res.status(200).json({ message: "You have no groups" });
  } catch (error) {
    console.log(`Error in creating group: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getSpecificGroup = async (req, res, next) => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const groups = await MyGroupModel.findOne({ userId: user._id }).populate("groupIds");
    if (!groups) return res.status(404).json({ message: "No Group found" });
    const found = groups.groupIds.find((group) => group._id.toString() === groupId.toString());
    if (found) {
      return res.status(200).json({ group: found, success: true });
    }
    return res.status(404).json({ message: "Group not found" });
  } catch (error) {
    console.log(`Error in creating group: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await GroupModel.findById(groupId).populate({
      path: "groupMembersId",
      select: "-password",
    });
    if (group) {
      return res.status(200).json({ groupMembers: group, success: true });
    } else {
      return res.status(404).json({ message: "Group not found" });
    }
  } catch (error) {
    console.log(`Error in creating group: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const user = req.user;
    const group = await GroupModel.findById(groupId);
    const group2 = await MyGroupModel.findOne({ userId: user._id });
    if (!group || !group2) return res.status(404).json({ message: "Group not found" });
    if (group2.groupIds.includes(groupId)) {
      group2.groupIds.pull(groupId);
      await group2.save();
    }
    if (group.groupMembersId.includes(user._id)) {
      group.groupMembersId.pull(user._id);
      group.totalGroupMemberCount -= 1;
      await group.save();
      return res.status(200).json({ message: "You have left the group", success: true });
    } else {
      return res.status(400).json({ message: "You are not a member of this group", success: false });
    }
  } catch (error) {
    console.log(`Error in creating group: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
