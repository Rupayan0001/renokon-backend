import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      index: true,
    },
    senderName: {
      type: String,
    },
    senderPic: {
      type: String,
    },
    content: {
      type: String,
      default: "",
    },
    friends: [{ type: String }],
    imageUrl: [{ type: String }],
    videoUrl: [{ type: String }],
    audioUrl: [{ type: String }],
    documentFiles: [{ type: String }],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, recipientId: 1 });
const Messagemodel = mongoose.model("Message", messageSchema);

export default Messagemodel;
