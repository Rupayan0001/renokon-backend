import mongoose from "mongoose";

const FriendSchema2 = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    friendName: {
        type: String,
        required: true
    }
}, { timestamps: true });

FriendSchema2.index({ userId: 1, friendId: 1 }, { unique: true })
FriendSchema2.index({ userId: 1 })


const Friendmodel2 = mongoose.model("FriendsList2", FriendSchema2);
export default Friendmodel2;
