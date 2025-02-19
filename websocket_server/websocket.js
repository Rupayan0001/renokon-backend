import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Messagemodel from "../model/message_models/messages.model.js";
import Friendmodel from "../model/friends.model.js";
import Friendmodel2 from "../model/friends2.model.js";
import Usermodel from "../model/user.model.js";
import MyGroupModel from "../model/message_models/myGroups.model.js";
import NotificationModel from "../model/notification.model.js";
import dotenv from "dotenv";
dotenv.config();

const clients = new Map();
const myActiveFriend = new Map();
const myActiveGroup = new Map();
const groups = new Map();
const SECRET_KEY = process.env.JWT_SECRET;
export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws, req) => {
    const token = getTokenFromCookies(req);
    if (!token) {
      console.log("WebSocket Unauthorized: No token provided");
      ws.send(JSON.stringify({ type: "unauthorized" }));
      ws.close(1008, "Unauthorized");
      return;
    }
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.userId.toString();
      handleUserRegistration({ userId }, ws);
    } catch (error) {
      console.error("Invalid WebSocket token:", error);
      ws.close(1008, "Unauthorized: Invalid token");
    }
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (!data) return;

        if (data.type === "register") {
          handleUserRegistration(data, ws);
        } else if (data.type === "text") {
          handleTextMessage(data, ws);
        } else if (data.type === "file") {
          handleMediaMessage(data, ws);
        } else if (data.type === "audio") {
          handleMediaMessage(data, ws);
        } else if (data.type === "video") {
          handleMediaMessage(data, ws);
        } else if (data.type === "image") {
          handleMediaMessage(data, ws);
        } else if (data.type === "typing") {
          handleTyping(data, ws);
        } else if (data.type === "initiateCall") {
          handleInitiateCall(data, ws);
        } else if (data.type === "call-accepted") {
          handleCallAccepted(data, ws);
        } else if (data.type === "new-ice-candidate") {
          handleIceCandidate(data, ws);
        } else if (data.type === "messageSeen") {
          handleMessageSeen(data, ws);
        } else if (data.type === "messageSeenGroup") {
          handleMessageSeenGroup(data, ws);
        } else if (data.type === "myActiveFriend") {
          handleMYActiveFriend(data, ws);
        } else if (data.type === "post_like") {
          handlePostLikeNotify(data, ws);
        } else if (data.type === "post_comment") {
          handlePostCommentNotify(data, ws);
        } else if (data.type === "newfriendRequest") {
          handleNewFriendRequestNotify(data, ws);
        } else if (data.type === "friendRequestAccepted") {
          handleFriendRequestAcceptedNotify(data, ws);
        } else if (data.type === "removeFriend") {
          handleFriendRemovedNotify(data, ws);
        } else if (data.type === "blockFriend") {
          handleFriendBlockedNotify(data, ws);
        } else if (data.type === "cancelfriendRequest") {
          handleCancelFriendNotify(data, ws);
        } else if (data.type === "follow") {
          handleFollowNotify(data, ws);
        } else if (data.type === "groupCreated") {
          handleGroupMembers(data, ws);
        } else if (data.type === "groupMemberAdd") {
          handleAddGroupMembers(data, ws);
        } else if (data.type === "memberRemove") {
          handleGroupMemberRemove(data, ws);
        } else if (data.type === "deleteGroup") {
          handleDeleteGroup(data, ws);
        } else if (data.type === "leaveGroup") {
          handleLeaveGroup(data, ws);
        } else if (data.type === "getOnlineGroupMembers") {
          handleSendOnlineGroupMembers(data, ws);
        } else if (data.type === "getAllOnlineFriends") {
          handleSendOnlineFriends(data, ws);
        } else {
          console.log(`Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.log(error);
      }
    });
    ws.on("error", (error) => {
      console.log(error);
    });
    ws.on("close", async () => {
      handleClose(ws);
    });
  });

  return wss;
};

function getTokenFromCookies(req) {
  if (!req.headers.cookie) return null;
  const cookies = cookie.parse(req.headers.cookie);
  return cookies.token || null;
}
function sendOnlineStatus(allFriends, data, ws) {
  allFriends.forEach((e) => {
    if (clients.has(e.friendId.toString())) {
      ws.send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: e.friendId.toString(),
            status: true,
          },
        })
      );
      clients.get(e.friendId.toString()).send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: data.userId.toString(),
            status: true,
          },
        })
      );
    }
  });
}
async function handleClose(ws) {
  if (ws.groupIds?.length > 0) {
    ws.groupIds.forEach((groupId) => {
      const arr = groups.get(groupId);
      if (!arr) return;

      const updated = arr.filter((socket) => socket.userId !== ws.userId);
      if (updated.length === 0) {
        groups.delete(groupId);
      } else {
        groups.set(groupId, updated);

        updated.forEach((socket) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "total_Group_Members",
                payload: {
                  groupId,
                  count: updated.length - 1,
                },
              })
            );
          }
        });
      }
    });
  }
  clients.delete(ws.userId);
  myActiveFriend.delete(ws.userId);
  const [friends, friends2] = await Promise.all([Friendmodel.find({ userId: ws.userId }), Friendmodel2.find({ userId: ws.userId })]);
  if (friends && friends2) {
    const allFriends = [...friends, ...friends2];
    allFriends.forEach((e) => {
      if (clients.has(e.friendId.toString())) {
        clients.get(e.friendId.toString()).send(
          JSON.stringify({
            type: "statusUpdate",
            payload: {
              userId: ws.userId,
              status: false,
            },
          })
        );
      }
    });
  }
  const updated = await Usermodel.findByIdAndUpdate(ws.userId, { lastSeenOnMessage: new Date().toISOString() });
}
const handleUserRegistration = async (data, ws) => {
  clients.set(data.userId.toString(), ws);
  ws.userId = data.userId.toString();
  try {
    const [friends, friends2] = await Promise.all([Friendmodel.find({ userId: data.userId.toString() }), Friendmodel2.find({ userId: data.userId.toString() })]);
    if (friends && friends2) {
      const allFriends = [...friends, ...friends2];
      sendOnlineStatus(allFriends, data, ws);
    }
    myGroupStatus(data.userId, ws);
  } catch (error) {
    console.log(`Error in handleUserRegistration: ${error}`);
  }
};
async function myGroupStatus(userId, ws) {
  if (!userId) return;
  const myGroups = await MyGroupModel.findOne({ userId }).populate("groupIds");
  if (!myGroups) return;
  const groupIds = myGroups.groupIds.map((e) => e._id.toString());
  ws.groupIds = groupIds;
  groupIds.forEach((e) => {
    const thisGroup = groups.get(e);
    if (thisGroup) {
      const index = thisGroup.filter((socket) => socket.userId !== ws.userId);
      index.push(ws);
      groups.set(e, index);
    } else {
      groups.set(e, [ws]);
    }
    const updatedGroup = groups.get(e);
    updatedGroup?.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "total_Group_Members",
            payload: {
              groupId: e,
              count: groups.get(e).length - 1,
              myGroupStatus: "myGroupStatus",
            },
          })
        );
      }
    });
  });
}
async function handleGroupMembers(data, ws) {
  const { userId, members, groupAdminName, profilePic, groupName, id } = data.payload;
  myGroupStatus(userId, ws);
  // if new group created then this will run
  if (members?.length > 0 && id) {
    members.forEach(async (e) => {
      if (clients.has(e) && e !== ws.userId) {
        clients.get(e).send(
          JSON.stringify({
            type: "newGroup_added_Me",
          })
        );
      }
      if (e === ws.userId) {
        const notification = await NotificationModel.create({
          recipient: e,
          sender: id,
          type: "youHaveCreatedGroup",
          senderProfilePic: profilePic,
          senderName: groupAdminName,
          content: `You have created the ${groupName} group`,
        });
        ws.send(
          JSON.stringify({
            type: "notification",
            payload: notification,
          })
        );
        return;
      }
      const notification = await NotificationModel.create({
        recipient: e,
        sender: id,
        type: "groupMember_AddedMe",
        senderProfilePic: profilePic,
        senderName: groupName,
        content: `${groupAdminName} has added you to the ${groupName} group`,
      });
      if (clients.has(e) && e !== ws.userId) {
        clients.get(e).send(
          JSON.stringify({
            type: "notification",
            payload: notification,
          })
        );
      }
    });
  }
}

const handleTextMessage = async (data, ws) => {
  const { senderId, receiverId, groupId, senderName, friends, content, senderPic = "" } = data.payload;
  let recieverActiveFriend = "";
  let reciever = "";
  let groupMembers = [];
  let onlineGroupMembers = [];
  let activeGroupMembers = [];
  let seenBy = [senderId];
  if (receiverId) {
    recieverActiveFriend = myActiveFriend.get(receiverId)?.id;
    reciever = clients.get(receiverId);
  } else if (groupId) {
    groupMembers = groups.get(groupId.toString());
  }

  if (groupMembers?.length > 0) {
    onlineGroupMembers = groupMembers.map((e) => e.userId);

    onlineGroupMembers.forEach((member) => {
      const active = myActiveFriend.get(member);
      if (active && active.type === "Group" && active.id === groupId) {
        activeGroupMembers.push(member);
      }
    });
    seenBy = [...activeGroupMembers, senderId];
  }
  const saveToDB = await Messagemodel.create({
    senderId,
    receiverId,
    groupId: groupId,
    senderName,
    friends,
    content,
    imageUrl: [],
    videoUrl: [],
    audioUrl: [],
    documentFiles: [],
    status: recieverActiveFriend === senderId ? "delivered" : "sent",
    seenBy,
    senderPic,
  });
  if (receiverId) {
    ws.send(
      JSON.stringify({
        type: "text",
        payload: saveToDB,
      })
    );

    if (clients.has(senderId) && reciever) {
      clients.get(receiverId).send(
        JSON.stringify({
          type: "text",
          payload: saveToDB,
        })
      );
    }
  }
  if (groupMembers?.length > 0) {
    groupMembers.forEach((member) => {
      member.send(
        JSON.stringify({
          type: "text",
          payload: saveToDB,
        })
      );
    });
  }
};

const handleMediaMessage = async (data, ws) => {
  const { type } = data;
  const { senderId, receiverId, groupId, randomId, senderName, friends, file, senderPic = "" } = data.payload;
  let recieverActiveFriend = "";
  let reciever = "";
  let groupMembers = [];
  let onlineGroupMembers = [];
  let activeGroupMembers = [];
  let seenBy = [senderId];
  if (receiverId) {
    recieverActiveFriend = myActiveFriend.get(receiverId)?.id;
    reciever = clients.get(receiverId);
  } else if (groupId) {
    groupMembers = groups.get(groupId.toString());
  }

  if (groupMembers?.length > 0) {
    onlineGroupMembers = groupMembers.map((e) => e.userId);

    onlineGroupMembers.forEach((member) => {
      const active = myActiveFriend.get(member);
      if (active && active.type === "Group" && active.id === groupId) {
        activeGroupMembers.push(member);
      }
    });
    seenBy = [...activeGroupMembers, senderId];
  }

  // Saving to database
  const saveToDB = await Messagemodel.create({
    senderId,
    receiverId,
    groupId: groupId,
    senderName,
    friends,
    imageUrl: type === "image" ? [file] : [],
    videoUrl: type === "video" ? [file] : [],
    audioUrl: type === "audio" ? [file] : [],
    documentFiles: type === "file" ? [file] : [],
    status: recieverActiveFriend === senderId ? "delivered" : "sent",
    seenBy,
    senderPic,
  });

  const saveToDB_obj = saveToDB.toObject();
  saveToDB_obj.randomId = randomId;

  if (receiverId) {
    // Sending to sender
    ws.send(
      JSON.stringify({
        type: type,
        payload: saveToDB_obj,
      })
    );

    // Sending to reciever
    if (clients.has(senderId) && reciever) {
      reciever.send(
        JSON.stringify({
          type: type,
          payload: saveToDB,
        })
      );
    }
  }
  if (groupMembers?.length > 0) {
    groupMembers.forEach((member) => {
      member.send(
        JSON.stringify({
          type: "text",
          payload: saveToDB_obj,
        })
      );
    });
  }
};
const sendObject = (senderId, receiverId, senderName, groupId, isTyping) => {
  return JSON.stringify({
    type: "typing",
    payload: {
      senderId,
      receiverId,
      senderName,
      groupId,
      isTyping,
    },
  });
};
function handleTyping(data, ws) {
  const { senderId, receiverId, groupId, senderName, isTyping } = data.payload;
  let sendingToType = null;

  if (!receiverId && !groupId && !isTyping && ws.typing) {
    const { type, id } = ws.typing;
    if (type === "user") {
      clients.get(id)?.send(sendObject(senderId, id, senderName, groupId, isTyping));
    } else if (type === "group") {
      const groupMembers = groups.get(id);
      groupMembers?.forEach((member) => {
        member?.send(sendObject(senderId, receiverId, senderName, id, isTyping));
      });
    }
    return;
  }
  const receiver = clients.get(receiverId);
  const groupMembers = groups.get(groupId);
  sendingToType = receiver ? "user" : "group";
  ws.typing = {
    type: sendingToType,
    id: sendingToType === "user" ? receiverId : groupId,
  };
  if (receiver) {
    receiver.send(sendObject(senderId, receiverId, senderName, groupId, isTyping));
  } else if (groupMembers?.length > 0) {
    groupMembers.forEach((member) => {
      member.send(sendObject(senderId, receiverId, senderName, groupId, isTyping));
    });
  }
}
function handleInitiateCall(data, ws) {
  const { callerId, callerName, callerProfilePic, receiverId, callType, offer } = data.payload;
  try {
    if (clients.has(callerId) && clients.has(receiverId)) {
      ws.send(
        JSON.stringify({
          type: "call-initiated",
          payload: {
            callerId,
            callerName,
            callerProfilePic,
            receiverId,
            callType,
            status: "online",
          },
        })
      );
      clients.get(receiverId).send(
        JSON.stringify({
          type: "incoming-call",
          payload: {
            callerId,
            callerName,
            callerProfilePic,
            receiverId,
            callType,
            offer,
          },
        })
      );
    }
  } catch (error) {
    console.log(error);
  }
}
function handleCallAccepted(data, ws) {
  const { callerId, receiverId, answer } = data.payload;
  try {
    if (clients.has(callerId)) {
      clients.get(callerId).send(
        JSON.stringify({
          type: "call-accepted",
          payload: {
            callerId,
            receiverId,
            answer,
          },
        })
      );
    }
  } catch (error) {
    console.log(error);
  }
}
function handleIceCandidate(data, ws) {
  console.log("new-ice-candidate hitted");
  const { callerId, receiverId, candidate } = data.payload;
  try {
    if (clients.has(receiverId)) {
      clients.get(receiverId).send(
        JSON.stringify({
          type: "new-ice-candidate",
          payload: {
            callerId,
            receiverId,
            candidate,
          },
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}
async function handleMessageSeen(data, ws) {
  const { messageId, receiverId, senderId } = data.payload;
  try {
    if (messageId.length === 0) return;
    const bulkOps = messageId.map((id) => ({ updateOne: { filter: { _id: id }, update: { $set: { status: "delivered" } } } }));
    const updateAll = await Messagemodel.bulkWrite(bulkOps);
    if (updateAll.modifiedCount > 0) {
      if (clients.has(senderId)) {
        clients.get(senderId).send(
          JSON.stringify({
            type: "messageSeen",
            payload: {
              messageId,
              receiverId,
              senderId,
              count: updateAll.modifiedCount,
            },
          })
        );
      }
      ws.send(
        JSON.stringify({
          type: "messageSeenRequestProcessed",
        })
      );
    }
  } catch (error) {
    console.log("error: ", error);
  }
}
async function handleMessageSeenGroup(data, ws) {
  const { messageId, groupId, senderId } = data.payload;
  try {
    if (messageId.length === 0) return;
    const bulkOps = messageId.map((id) => ({ updateOne: { filter: { _id: id }, update: { $push: { seenBy: senderId } } } }));
    const updateAll = await Messagemodel.bulkWrite(bulkOps);
    if (updateAll.modifiedCount > 0) {
      ws.send(
        JSON.stringify({
          type: "messageSeenRequestProcessed",
        })
      );
    }
  } catch (error) {
    console.log("error: ", error);
  }
}
async function handleMYActiveFriend(data, ws) {
  const { senderId, receiverId, type } = data.payload;
  // if (previousActiveFriend?.type === "Group") {
  //   try {
  //     const myGroups = await MyGroupModel.updateOne(
  //       { userId: senderId, "lastSeenTime.groupId": previousActiveFriend.id },
  //       {
  //         $set: {
  //           "lastSeenTime.$.lastActiveTime": new Date(),
  //         },
  //       }
  //     );
  //     console.log("myGroups: ", myGroups);
  //     if (myGroups.modifiedCount === 1) console.log("active group time updated: ", myGroups);
  //   } catch (error) {
  //     console.log("active group became null, but can't update time: ", error);
  //   }
  // }
  myActiveFriend.set(senderId, { id: receiverId, type });
}
async function handlePostLikeNotify(data, ws) {
  const { postId, postCreatorId, senderId, senderName, senderProfilePic } = data.payload;
  if (postCreatorId === senderId) return;
  const recipient = clients.get(postCreatorId);
  try {
    const notify = await NotificationModel.create({
      relatedPost: postId,
      recipient: postCreatorId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "like",
      content: `${senderName} liked your post`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handlePostCommentNotify(data, ws) {
  const { postId, postCreatorId, senderId, senderName, senderProfilePic, comment } = data.payload;
  const recipient = clients.get(postCreatorId);
  try {
    const notify = await NotificationModel.create({
      relatedPost: postId,
      recipient: postCreatorId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "comment",
      extraContent: comment,
      content: `${senderName} commented on your post`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleNewFriendRequestNotify(data, ws) {
  const { recipientId, senderId, senderName, senderProfilePic } = data.payload;
  const recipient = clients.get(recipientId);
  try {
    const notify = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "newfriendRequest",
      content: `${senderName} sent you a friend request`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleFriendRequestAcceptedNotify(data, ws) {
  const { recipientId, senderId, senderName, senderProfilePic } = data.payload;
  const recipient = clients.get(recipientId);
  try {
    const notify = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "friendRequestAccepted",
      content: `${senderName} accepted your friend request`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
      ws.send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: recipientId,
            status: true,
          },
        })
      );
      recipient.send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: senderId,
            status: true,
          },
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleFriendRemovedNotify(data, ws) {
  const { recipientId, senderId, senderName, senderProfilePic } = data.payload;
  const recipient = clients.get(recipientId);
  try {
    const notify = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "removeFriend",
      content: `${senderName} removed you as a friend`,
    });

    ws.send(
      JSON.stringify({
        type: "statusUpdate",
        payload: {
          userId: recipientId,
          status: false,
        },
      })
    );
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
      recipient.send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: senderId,
            status: false,
          },
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleDeleteGroup(data, ws) {
  const { groupId, members, groupName, groupAvatar, senderId, senderName } = data.payload;
  const recipient = groups.get(groupId);
  if (recipient) {
    groups.delete(groupId);
  }
  try {
    members.forEach(async (member) => {
      if (member === senderId) return;
      const notify = await NotificationModel.create({
        recipient: member,
        sender: senderId,
        senderName: groupName,
        senderProfilePic: groupAvatar,
        type: "groupDeleted",
        content: `${senderName}, the admin of the ${groupName} group, has deleted the group`,
      });
      if (notify && clients.has(member)) {
        clients.get(member).send(
          JSON.stringify({
            type: "notification",
            groupId,
            payload: notify,
          })
        );
      }
    });
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleLeaveGroup(data, ws) {
  const { groupId, groupName, groupAvatar, senderId, senderName } = data.payload;
  const recipient = groups.get(groupId);
  if (!recipient) return;
  try {
    const updated = recipient.filter((e) => e !== ws);
    groups.set(groupId, updated);
    updated.forEach(async (member) => {
      if (member.userId === senderId) return;
      if (member.readyState === WebSocket.OPEN) {
        member.send(
          JSON.stringify({
            type: "total_Group_Members",
            payload: {
              groupId,
              count: updated.length - 1,
            },
          })
        );
      }
      const notify = await NotificationModel.create({
        recipient: member.userId,
        sender: groupId,
        senderName: groupName,
        senderProfilePic: groupAvatar,
        type: "leaveGroup",
        content: `${senderName} has left the ${groupName} group.`,
      });
      if (notify && clients.has(member.userId)) {
        clients.get(member.userId).send(
          JSON.stringify({
            type: "notification",
            payload: notify,
          })
        );
      }
    });
  } catch (err) {
    console.log("error from leaveGroup: ", err);
  }
}
async function handleAddGroupMembers(data, ws) {
  const { userId, members, groupAdminName, profilePic, groupName, groupId } = data.payload;
  const myGroups = await MyGroupModel.findOne({ userId }).populate("groupIds");
  if (!myGroups) return;
  const groupIds = myGroups.groupIds.map((e) => e._id.toString());
  ws.groupIds = groupIds;
  groupIds.forEach((e) => {
    const thisGroup = groups.get(e);
    if (thisGroup) {
      if (!thisGroup.includes(ws)) groups.get(e).push(ws);
    } else {
      groups.set(e, [ws]);
    }

    thisGroup?.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "total_Group_Members",
            payload: {
              groupId: e,
              count: thisGroup.length,
            },
          })
        );
      }
    });
  });
  // if new group created then this will run
  if (members?.length > 0) {
    members.forEach(async (e) => {
      if (clients.has(e) && e !== ws.userId) {
        clients.get(e).send(
          JSON.stringify({
            type: "newGroup_added_Me",
          })
        );
      }
      if (e === ws.userId) {
        const notification = await NotificationModel.create({
          recipient: e,
          sender: groupId,
          type: "youHaveCreatedGroup",
          senderProfilePic: profilePic,
          senderName: groupAdminName,
          content: `You have created the ${groupName} group`,
        });
        ws.send(
          JSON.stringify({
            type: "notification",
            payload: notification,
          })
        );
        return;
      }
      const notification = await NotificationModel.create({
        recipient: e,
        sender: groupId,
        type: "groupMember_AddedMe",
        senderProfilePic: profilePic,
        senderName: groupAdminName,
        content: `${groupAdminName} has added you to the ${groupName} group`,
      });
      if (clients.has(e)) {
        clients.get(e).send(
          JSON.stringify({
            type: "notification",
            payload: notification,
          })
        );
      }
    });
  }
}
async function handleGroupMemberRemove(data, ws) {
  const { groupId, removeId, groupName, groupAdminName, groupAvatar } = data.payload;
  if (!groupId || !removeId) return;
  if (groups.has(groupId)) {
    const arr = groups.get(groupId);
    const updated = arr.filter((a) => a.userId !== removeId);
    groups.set(groupId, updated);
    updated.forEach((member) => {
      if (member.readyState === WebSocket.OPEN) {
        member.send(
          JSON.stringify({
            type: "total_Group_Members",
            payload: {
              groupId,
              count: updated.length - 1,
            },
          })
        );
      }
    });
  }
  const notification = await NotificationModel.create({
    recipient: removeId,
    sender: ws.userId,
    type: "groupMemberRemoved",
    senderProfilePic: groupAvatar,
    senderName: groupAdminName,
    content: `${groupAdminName}, the admin of the ${groupName} group has removed you from the group`,
  });

  if (clients.has(removeId)) {
    clients.get(removeId).send(
      JSON.stringify({
        type: "notification",
        groupId: groupId,
        payload: notification,
      })
    );
  }
}
async function handleFriendBlockedNotify(data, ws) {
  const { recipientId, senderId, senderName, senderProfilePic } = data.payload;
  const recipient = clients.get(recipientId);
  try {
    const notify = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "blockFriend",
      content: `${senderName} has blocked you`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
      ws.send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: recipientId,
            status: false,
          },
        })
      );
      recipient.send(
        JSON.stringify({
          type: "statusUpdate",
          payload: {
            userId: senderId,
            status: false,
          },
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleCancelFriendNotify(data, ws) {
  const { recipientId, senderId, senderName, senderProfilePic } = data.payload;
  const recipient = clients.get(recipientId);
  try {
    const notify = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "cancelfriendRequest",
      content: `${senderName} sent you a friend request earlier, and ${senderName.split(" ")[0]} cancelled it now`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
async function handleFollowNotify(data, ws) {
  const { recipientId, senderId, senderName, senderProfilePic } = data.payload;
  const recipient = clients.get(recipientId);
  try {
    const notify = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      senderName,
      senderProfilePic,
      type: "follow",
      content: `${senderName} is following you`,
    });
    if (notify && recipient) {
      recipient.send(
        JSON.stringify({
          type: "notification",
          payload: notify,
        })
      );
    }
  } catch (err) {
    console.log("error: ", err);
  }
}

function handleSendOnlineGroupMembers(data, ws) {
  const { groupId } = data.payload;
  if (!groupId) return;
  if (groups.has(groupId)) {
    const allSoctets = groups.get(groupId);
    const ids = allSoctets.map((a) => a.userId);
    if (ids.length > 0) {
      ws.send(
        JSON.stringify({
          type: "online_Group_Members",
          payload: {
            groupId,
            activeMembers: ids,
          },
        })
      );
    }
  }
}
function handleSendOnlineFriends(data, ws) {
  const { ids } = data.payload;
  if (!ids || ids.length === 0) return;
  const onlineUserIds = new Set(clients.keys());
  const onlineFriends = ids.filter((id) => onlineUserIds.has(id));

  ws.send(
    JSON.stringify({
      type: "online_friends",
      payload: {
        onlineFriends,
      },
    })
  );
}
