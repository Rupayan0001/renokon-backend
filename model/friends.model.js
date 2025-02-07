import mongoose from "mongoose";

const FriendSchema1 = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friendName: {
      type: String,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

FriendSchema1.index({ userId: 1, friendId: 1 }, { unique: true });
FriendSchema1.index({ userId: 1 });

const Friendmodel = mongoose.model("FriendsList", FriendSchema1);
export default Friendmodel;
