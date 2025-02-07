import mongoose from "mongoose";

const FriendRequestRecievedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
}, { timestamps: true });

FriendRequestRecievedSchema.index({ userId: 1, friendId: 1 }, { unique: true })
FriendRequestRecievedSchema.index({ userId: 1 })
const FriendRequestRecievedModel = mongoose.model("FriendRequestRecieved", FriendRequestRecievedSchema);
export default FriendRequestRecievedModel;