import mongoose from "mongoose";

const MyGroupsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  groupIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Group",
    },
  ],
  lastSeenTime: [
    {
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Group",
      },
      lastActiveTime: {
        type: Date,
      },
    },
  ],
});

MyGroupsSchema.index({ userId: 1, "lastSeenTime.groupId": 1 });
const MyGroupModel = mongoose.model("MyGroups", MyGroupsSchema);
export default MyGroupModel;
