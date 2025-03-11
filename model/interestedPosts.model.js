import mongoose from "mongoose";

const InterestedPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

InterestedPostSchema.index({ userId: 1, postId: 1 }, { unique: true })
InterestedPostSchema.index({ userId: 1 })
const InterestedPostmodel = mongoose.model("InterestedPost", InterestedPostSchema);
export default InterestedPostmodel;