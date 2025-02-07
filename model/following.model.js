import mongoose from "mongoose";

const FollowingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    followingName: {
        type: String,
        required: true
    },
    followingUsername: {
        type: String,
        required: true
    },
    followingPersonProfilePic: {
        type: String,
        required: true
    }
}, { timestamps: true });

FollowingSchema.index({ userId: 1, followingId: 1 }, { unique: true })
FollowingSchema.index({ userId: 1 })

const Followingmodel = mongoose.model("FollowingList", FollowingSchema);
export default Followingmodel;
