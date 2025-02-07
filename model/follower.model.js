import mongoose from "mongoose";

const FollowerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    followerName: {
        type: String,
        required: true
    },
    followerUsername: {
        type: String,
        required: true
    },
    followerPersonProfilePic: {
        type: String,
        required: true
    }
}, { timestamps: true });

FollowerSchema.index({ userId: 1, followerId: 1 }, { unique: true })
FollowerSchema.index({ userId: 1 })

const Followermodel = mongoose.model("FollowerList", FollowerSchema);
export default Followermodel;
