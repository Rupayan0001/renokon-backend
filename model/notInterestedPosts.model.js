import mongoose from "mongoose";

const NotInterestedPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

NotInterestedPostSchema.index({ userId: 1, postId: 1 }, { unique: true })
NotInterestedPostSchema.index({ userId: 1 })
const NotInterestedPostmodel = mongoose.model("NotInterestedPost", NotInterestedPostSchema);
export default NotInterestedPostmodel;