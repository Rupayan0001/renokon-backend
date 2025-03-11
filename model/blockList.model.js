import mongoose from "mongoose";

const BlockListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blockedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})
BlockListSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true })
BlockListSchema.index({ userId: 1 });
const BlockListmodel = mongoose.model("BlockList", BlockListSchema);
export default BlockListmodel;